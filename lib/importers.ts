export async function extractTextFromPDF(file: File): Promise<string> {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullMarkdown = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Items are in random order sometimes, so sort by Y (descending) then X (ascending)
        // transform[5] is the Y-coordinate, transform[4] is the X-coordinate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = textContent.items as any[];
        items.sort((a, b) => {
            if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
                return a.transform[4] - b.transform[4];
            }
            return b.transform[5] - a.transform[5];
        });

        // Group items into lines
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lines: any[][] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let currentLine: any[] = [];
        let lastY = -1;

        for (const item of items) {
            if (lastY === -1 || Math.abs(item.transform[5] - lastY) < 5) {
                currentLine.push(item);
            } else {
                lines.push(currentLine);
                currentLine = [item];
            }
            lastY = item.transform[5];
        }
        if (currentLine.length > 0) lines.push(currentLine);

        // Process lines into Markdown
        let pageMarkdown = "";
        // Calculate average height to detect headings
        const heights = items.map(it => it.height).filter(h => h > 0);
        const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length || 10;

        for (const line of lines) {
            const lineText = line.map(it => it.str).join("").trim();
            if (!lineText) continue;

            const maxHeight = Math.max(...line.map(it => it.height));
            
            if (maxHeight > avgHeight * 1.6) {
                pageMarkdown += `# ${lineText}\n\n`;
            } else if (maxHeight > avgHeight * 1.3) {
                pageMarkdown += `## ${lineText}\n\n`;
            } else if (maxHeight > avgHeight * 1.1) {
                pageMarkdown += `### ${lineText}\n\n`;
            } else {
                pageMarkdown += `${lineText} `;
                // If the line is short compared to page width, it's likely a paragraph end
                if (lineText.length < 60) {
                    pageMarkdown += "\n\n";
                }
            }
        }
        
        fullMarkdown += pageMarkdown + "\n\n";
    }
    
    return fullMarkdown.trim() || "No text could be extracted from this PDF.";
}


export async function extractTextFromPPTX(file: File): Promise<string> {
    const JSZip = (await import("jszip")).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
    ).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0]);
        const numB = parseInt(b.match(/\d+/)![0]);
        return numA - numB;
    });
    
    let fullMarkdown = "";
    const parser = new DOMParser();
    
    for (const slidePath of slideFiles) {
        const slideXml = await zip.file(slidePath)?.async("text");
        if (!slideXml) continue;
        
        const doc = parser.parseFromString(slideXml, "application/xml");
        const shapes = doc.getElementsByTagName("p:sp");
        
        let slideMarkdown = "";
        
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            
            // Check if this shape is a title
            const ph = shape.getElementsByTagName("p:ph")[0];
            const type = ph?.getAttribute("type");
            const isTitle = type === "title" || type === "ctrTitle";
            
            const textNodes = shape.getElementsByTagName("a:t");
            let shapeText = "";
            for (let j = 0; j < textNodes.length; j++) {
                shapeText += textNodes[j].textContent;
            }
            
            const cleanText = shapeText.trim();
            if (cleanText) {
                if (isTitle) {
                    slideMarkdown += `# ${cleanText}\n\n`;
                } else {
                    slideMarkdown += `${cleanText}\n\n`;
                }
            }
        }
        
        if (slideMarkdown.trim()) {
            fullMarkdown += slideMarkdown + "---\n\n";
        }
    }
    
    return fullMarkdown.trim() || "No text could be extracted from this PPTX.";
}

