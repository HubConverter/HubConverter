  const convertToWord = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("Reading PDF...");

      const arrayBuffer = await file.arrayBuffer();

      // Initialize the PDF Document safely
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const docxParagraphs = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setMessage(`Reading page ${pageNumber} of ${pdf.numPages}...`);

        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        // Safe extraction check
        if (!textContent || !textContent.items) continue;

        let currentLine = "";
        let previousY = null;

        for (const item of textContent.items) {
          if (!item.str) continue;

          const text = item.str.trim();
          if (!text) continue;

          // Safely access the 6th element in the transformation matrix for Y coordinates
          const currentY = item.transform && item.transform.length >= 6 
            ? item.transform[5] 
            : null;

          // Check if text has shifted to a new line visually
          if (
            previousY !== null &&
            currentY !== null &&
            Math.abs(currentY - previousY) > 5
          ) {
            if (currentLine.trim()) {
              docxParagraphs.push(
                new Paragraph({
                  children: [new TextRun(currentLine.trim())],
                })
              );
            }
            currentLine = text;
          } else {
            // Build text along the same visual line segment
            currentLine += (currentLine ? " " : "") + text;
          }
          previousY = currentY;
        }

        // Push any remaining text from the final line processing loop
        if (currentLine.trim()) {
          docxParagraphs.push(
            new Paragraph({
              children: [new TextRun(currentLine.trim())],
            })
          );
        }
      }

      setMessage("Generating Word Document...");

      // Structural layout wrapper for docx module
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxParagraphs,
          },
        ],
      });

      // Export binary structure to browser local save prompt
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(/\.[^/.]+$/, "")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage("Conversion complete!");
    } catch (error) {
      // Logs the real technical breakdown to your developer tools console
      console.error("Conversion breakdown detail:", error);
      setMessage("Could not convert this PDF. Please try another PDF file.");
    } finally {
      setProcessing(false);
    }
  };
