(() => {
  function createExportService({ state, slides, deckTitleProvider }) {
    function exportResponses() {
      return {
        exportedAt: new Date().toISOString(),
        responses: state.responses,
        deckTitle: deckTitleProvider()
      };
    }

    function downloadDeckResponsesPdf({ filename = "deck-reflections-export.pdf" } = {}) {
      window.pdfExport.downloadPdf({
        filename,
        lines: window.pdfExport.buildDeckExportLines({
          slides,
          responses: state.responses,
          generatedAt: new Date().toISOString()
        })
      });
    }

    return { exportResponses, downloadDeckResponsesPdf };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.exportService = { createExportService };
})();
