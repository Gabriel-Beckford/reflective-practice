(() => {
  function sanitizePdfText(value) {
    return String(value ?? "")
      .replace(/[\r\n]+/g, " ")
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function wrapText(line, maxChars = 92) {
    const source = String(line ?? "").trim();
    if (!source) return [""];

    const words = source.split(/\s+/);
    const wrapped = [];
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) wrapped.push(current);
    return wrapped;
  }

  function toPdfBlob(lines) {
    const textLines = lines.flatMap((line) => wrapText(line)).map((line) => sanitizePdfText(line));

    const streamBody = [
      "BT",
      "/F1 11 Tf",
      "50 742 Td",
      ...textLines.map((line, index) => (index === 0 ? `(${line}) Tj` : `T* (${line}) Tj`)),
      "ET"
    ].join("\n");

    const objects = [
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj",
      `4 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj`,
      "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj"
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((obj) => {
      offsets.push(pdf.length);
      pdf += `${obj}\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  }

  function downloadPdf({ filename, lines }) {
    const blob = toPdfBlob(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function extractScalar(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
  }

  function buildDeckExportLines({ slides = [], responses = {}, generatedAt = new Date().toISOString() } = {}) {
    const lines = ["Deck Reflection Export (V3)", `Generated: ${generatedAt}`, ""];
    const shared = responses.__shared__ && typeof responses.__shared__ === "object" ? responses.__shared__ : {};

    const slideById = new Map((Array.isArray(slides) ? slides : []).map((slide) => [slide.id, slide]));
    const findResponseBySlideType = (type) => (Array.isArray(slides) ? slides : [])
      .filter((slide) => slide.type === type)
      .map((slide) => ({ slide, data: responses[slide.id] || {} }));

    lines.push("Grounding");
    ["01.2", "1.2", "04.2", "7.2"].forEach((id) => {
      const slide = slideById.get(id);
      if (!slide?.responseKey) return;
      const raw = extractScalar((responses[id] || {})[slide.responseKey]);
      if (raw) lines.push(`${slide.badge || id}: ${raw}`);
    });
    lines.push("");

    lines.push("Critical Incident");
    const incident = extractScalar(shared.criticalIncidentText);
    lines.push(incident || "No critical incident captured.");
    lines.push("");

    lines.push("Mapping Outputs");
    const mappingTypes = new Set(["drag-drop", "linking", "matrix", "table-completion", "gapfill"]);
    (Array.isArray(slides) ? slides : []).forEach((slide) => {
      if (!mappingTypes.has(slide.type) || !slide.responseKey) return;
      const value = (responses[slide.id] || {})[slide.responseKey];
      if (value === undefined || value === null) return;
      lines.push(`${slide.badge || slide.id}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
    });
    lines.push("");

    lines.push("Rubric Grades + Rationales");
    findResponseBySlideType("rubric-grade").forEach(({ slide, data }) => {
      const grade = extractScalar(data[`${slide.responseKey}__grade`]);
      const rationale = extractScalar(data[`${slide.responseKey}__rationale`]);
      if (!grade && !rationale) return;
      lines.push(`${slide.badge || slide.id}: grade=${grade || "n/a"}; rationale=${rationale || "n/a"}`);
    });
    lines.push("");

    lines.push("Chatbot Transcript");
    const transcriptCandidates = [];
    Object.entries(responses).forEach(([slideId, data]) => {
      if (!data || typeof data !== "object") return;
      Object.entries(data).forEach(([key, value]) => {
        if (/transcript/i.test(key)) {
          transcriptCandidates.push(`${slideId}.${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
        }
      });
    });
    if (transcriptCandidates.length) {
      lines.push(...transcriptCandidates);
    } else {
      lines.push("No chatbot transcript captured.");
    }
    lines.push("");

    lines.push("Feedback Responses");
    const feedbackSlide = slideById.get("06.4");
    const feedbackData = feedbackSlide ? (responses["06.4"] || {}) : {};
    const feedbackBase = feedbackSlide?.responseKey || "feedback_form_v3";
    const name = extractScalar(feedbackData[`${feedbackBase}__name`]);
    const submittedAt = extractScalar(feedbackData[`${feedbackBase}__submitted_at`]);
    const status = extractScalar(feedbackData[`${feedbackBase}__submit_status`]);
    lines.push(`Name: ${name || "n/a"}`);
    lines.push(`Submitted at: ${submittedAt || "n/a"}`);
    lines.push(`Submission status: ${status || "not submitted"}`);
    for (let i = 1; i <= 6; i += 1) {
      const answer = extractScalar(feedbackData[`${feedbackBase}__q${i}`]);
      lines.push(`Q${i}: ${answer || "n/a"}`);
    }

    return lines;
  }

  window.pdfExport = {
    downloadPdf,
    buildDeckExportLines
  };
})();
