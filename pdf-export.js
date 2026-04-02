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

  window.pdfExport = {
    downloadPdf
  };
})();
