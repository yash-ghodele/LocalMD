import { calculateStructureScore, estimateTokens } from "./aiReadiness";

export interface ConversionFidelityReport {
    format: "PDF" | "DOCX" | "PPTX" | "Markdown" | "Batch";
    originalFileName: string;
    fileSizeFormatted: string;
    pageOrSlideCount?: number;
    headingsPreserved: number;
    tablesPreserved: number;
    listsPreserved: number;
    mathExpressionsDetected: number;
    speakerNotesExtracted?: number;
    degradationsAndWarnings: string[];
    structureScore: number;
    structureGrade: "A+" | "A" | "B" | "C";
    structureTier: string;
    estimatedTokens: number;
    processedAt: string;
}

export interface ConversionResult {
    markdown: string;
    report: ConversionFidelityReport;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * High-Fidelity Local PDF to Markdown Extractor
 * 100% In-Browser execution using local /pdf.worker.min.mjs (Zero external CDN calls)
 */
export async function extractTextFromPDF(file: File): Promise<ConversionResult> {
    const pdfjs = await import("pdfjs-dist");
    // Explicit local worker path to eliminate unpkg CDN dependencies
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullMarkdown = "";
    let totalHeadings = 0;
    let totalTables = 0;
    let totalLists = 0;
    let totalMath = 0;
    const warnings: string[] = [];
    let blankOrScannedPages = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = textContent.items as any[];

        if (!items || items.length === 0) {
            blankOrScannedPages++;
            warnings.push(`Page ${i}: No selectable text detected (likely a scanned image/diagram). OCR is deferred to local WASM update.`);
            continue;
        }

        // Sort items by Y (descending) then X (ascending)
        items.sort((a, b) => {
            if (Math.abs(a.transform[5] - b.transform[5]) < 4) {
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
            if (lastY === -1 || Math.abs(item.transform[5] - lastY) < 4) {
                currentLine.push(item);
            } else {
                lines.push(currentLine);
                currentLine = [item];
            }
            lastY = item.transform[5];
        }
        if (currentLine.length > 0) lines.push(currentLine);

        // Calculate average height to detect headings
        const heights = items.map(it => it.height).filter(h => h > 0);
        const avgHeight = heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : 10;

        let pageMarkdown = "";

        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
            const line = lines[lIdx];
            let lineText = line.map(it => it.str).join(" ").replace(/\s+/g, " ").trim();
            if (!lineText) continue;

            const maxHeight = Math.max(...line.map(it => it.height || 0));

            // Math heuristic detection
            if (/[\u2200-\u22FF\u0391-\u03C9\u2211\u222B\u2202\u2248\u2264\u2265\u00B1]/.test(lineText)) {
                totalMath++;
            }

            // Heading detection
            if (maxHeight > avgHeight * 1.6 && lineText.length < 120) {
                pageMarkdown += `# ${lineText}\n\n`;
                totalHeadings++;
            } else if (maxHeight > avgHeight * 1.3 && lineText.length < 140) {
                pageMarkdown += `## ${lineText}\n\n`;
                totalHeadings++;
            } else if (maxHeight > avgHeight * 1.1 && lineText.length < 160) {
                pageMarkdown += `### ${lineText}\n\n`;
                totalHeadings++;
            } else if (/^([•◦▪\-\*]|\d+[\.\)])\s+/.test(lineText)) {
                // List item detection
                totalLists++;
                const cleanListItem = lineText.replace(/^[•◦▪]\s*/, "- ");
                pageMarkdown += `${cleanListItem}\n`;
            } else {
                pageMarkdown += `${lineText} `;
                if (lineText.length < 50 || lIdx === lines.length - 1) {
                    pageMarkdown += "\n\n";
                }
            }
        }
        
        fullMarkdown += pageMarkdown.trim() + "\n\n";
    }

    if (blankOrScannedPages > 0 && blankOrScannedPages === pdf.numPages) {
        warnings.push("Document appears to be 100% scanned images. Raw text extraction yielded 0 selectable characters.");
    }

    const trimmedMarkdown = fullMarkdown.trim() || `# Converted Document: ${file.name}\n\n*No selectable text stream could be extracted from this PDF.*`;
    const analysis = calculateStructureScore(trimmedMarkdown);

    if (totalHeadings === 0) {
        warnings.push("No distinct heading font sizes detected; text was formatted as standard paragraphs.");
    }

    const report: ConversionFidelityReport = {
        format: "PDF",
        originalFileName: file.name,
        fileSizeFormatted: formatBytes(file.size),
        pageOrSlideCount: pdf.numPages,
        headingsPreserved: totalHeadings,
        tablesPreserved: totalTables,
        listsPreserved: totalLists,
        mathExpressionsDetected: totalMath,
        degradationsAndWarnings: warnings,
        structureScore: analysis.totalScore,
        structureGrade: analysis.grade,
        structureTier: analysis.tierName,
        estimatedTokens: estimateTokens(trimmedMarkdown),
        processedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    return { markdown: trimmedMarkdown, report };
}

/**
 * High-Fidelity Local PowerPoint (.pptx) to Markdown Extractor
 * Extracts slide headings, hierarchical bullet lists, tables, and speaker notes
 */
export async function extractTextFromPPTX(file: File): Promise<ConversionResult> {
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
    let totalHeadings = 0;
    let totalTables = 0;
    let totalLists = 0;
    let speakerNotesCount = 0;
    const warnings: string[] = [];
    const parser = new DOMParser();

    for (let sIdx = 0; sIdx < slideFiles.length; sIdx++) {
        const slidePath = slideFiles[sIdx];
        const slideNum = sIdx + 1;
        const slideXml = await zip.file(slidePath)?.async("text");
        if (!slideXml) continue;
        
        const doc = parser.parseFromString(slideXml, "application/xml");
        let slideMarkdown = `## Slide ${slideNum}`;
        totalHeadings++;

        // 1. Check for shapes and text blocks
        const shapes = doc.getElementsByTagName("p:sp");
        let hasSlideTitle = false;

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const ph = shape.getElementsByTagName("p:ph")[0];
            const type = ph?.getAttribute("type");
            const isTitle = type === "title" || type === "ctrTitle";

            const paragraphs = shape.getElementsByTagName("a:p");
            for (let p = 0; p < paragraphs.length; p++) {
                const pElem = paragraphs[p];
                const textNodes = pElem.getElementsByTagName("a:t");
                let paraText = "";
                for (let t = 0; t < textNodes.length; t++) {
                    paraText += textNodes[t].textContent || "";
                }
                const cleanText = paraText.trim();
                if (!cleanText) continue;

                if (isTitle && !hasSlideTitle) {
                    slideMarkdown = `## Slide ${slideNum}: ${cleanText}\n\n`;
                    hasSlideTitle = true;
                } else {
                    const pPr = pElem.getElementsByTagName("a:pPr")[0];
                    const lvl = parseInt(pPr?.getAttribute("lvl") || "0");
                    const indent = "  ".repeat(lvl);
                    slideMarkdown += `${indent}- ${cleanText}\n`;
                    totalLists++;
                }
            }
        }
        slideMarkdown += "\n";

        // 2. Check for PowerPoint Tables
        const tables = doc.getElementsByTagName("a:tbl");
        for (let t = 0; t < tables.length; t++) {
            const tableElem = tables[t];
            const rows = tableElem.getElementsByTagName("a:tr");
            if (rows.length > 0) {
                totalTables++;
                let tableMd = "\n";
                for (let r = 0; r < rows.length; r++) {
                    const cells = rows[r].getElementsByTagName("a:tc");
                    const cellTexts: string[] = [];
                    for (let c = 0; c < cells.length; c++) {
                        const cellNode = cells[c];
                        const tNodes = cellNode.getElementsByTagName("a:t");
                        let cellContent = "";
                        for (let n = 0; n < tNodes.length; n++) {
                            cellContent += tNodes[n].textContent || "";
                        }
                        cellTexts.push(cellContent.trim().replace(/\|/g, "\\|") || " ");
                    }
                    tableMd += `| ${cellTexts.join(" | ")} |\n`;
                    if (r === 0) {
                        tableMd += `| ${cellTexts.map(() => "---").join(" | ")} |\n`;
                    }
                }
                slideMarkdown += tableMd + "\n";
            }
        }

        // 3. Extract Speaker Notes if present
        const noteRelPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        const noteRelXml = await zip.file(noteRelPath)?.async("text");
        if (noteRelXml) {
            const relDoc = parser.parseFromString(noteRelXml, "application/xml");
            const rels = relDoc.getElementsByTagName("Relationship");
            for (let r = 0; r < rels.length; r++) {
                const target = rels[r].getAttribute("Target") || "";
                if (target.includes("notesSlide")) {
                    const cleanTarget = target.startsWith("../") ? `ppt/${target.substring(3)}` : `ppt/slides/${target}`;
                    const noteXml = await zip.file(cleanTarget)?.async("text");
                    if (noteXml) {
                        const noteDoc = parser.parseFromString(noteXml, "application/xml");
                        const noteTextNodes = noteDoc.getElementsByTagName("a:t");
                        let noteText = "";
                        for (let nt = 0; nt < noteTextNodes.length; nt++) {
                            const str = noteTextNodes[nt].textContent?.trim();
                            // filter out standard slide number placeholders in notes
                            if (str && str !== `${slideNum}`) {
                                noteText += str + " ";
                            }
                        }
                        if (noteText.trim()) {
                            slideMarkdown += `> **Speaker Notes:** ${noteText.trim()}\n\n`;
                            speakerNotesCount++;
                        }
                    }
                }
            }
        }

        fullMarkdown += slideMarkdown.trim() + "\n\n---\n\n";
    }

    if (slideFiles.length === 0) {
        warnings.push("No slide XML definitions found in the PPTX archive.");
    }

    warnings.push("Slide animations, vector smart-art, and media embeds are converted into structured text sections.");

    const trimmedMarkdown = fullMarkdown.trim() || `# Presentation: ${file.name}\n\n*No text content extracted.*`;
    const analysis = calculateStructureScore(trimmedMarkdown);

    const report: ConversionFidelityReport = {
        format: "PPTX",
        originalFileName: file.name,
        fileSizeFormatted: formatBytes(file.size),
        pageOrSlideCount: slideFiles.length,
        headingsPreserved: totalHeadings,
        tablesPreserved: totalTables,
        listsPreserved: totalLists,
        mathExpressionsDetected: 0,
        speakerNotesExtracted: speakerNotesCount,
        degradationsAndWarnings: warnings,
        structureScore: analysis.totalScore,
        structureGrade: analysis.grade,
        structureTier: analysis.tierName,
        estimatedTokens: estimateTokens(trimmedMarkdown),
        processedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    return { markdown: trimmedMarkdown, report };
}

import * as mammoth from "mammoth";

/**
 * Extracts content from a Word document (.docx) and converts it to high-fidelity Markdown.
 */
export async function extractTextFromDOCX(file: File): Promise<ConversionResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (mammoth as any).convertToMarkdown(
            { arrayBuffer },
            {
                styleMap: [
                    "p[style-name='Title'] => # :fresh-line",
                    "p[style-name='Subtitle'] => ## :fresh-line",
                    "p[style-name='Heading 1'] => # :fresh-line",
                    "p[style-name='Heading 2'] => ## :fresh-line",
                    "p[style-name='Heading 3'] => ### :fresh-line",
                    "p[style-name='Heading 4'] => #### :fresh-line",
                    "r[style-name='Code'] => ``",
                ]
            }
        );

        const warnings: string[] = [];
        if (result.messages && result.messages.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.messages.forEach((msg: any) => {
                if (msg.type === "warning") warnings.push(msg.message);
            });
        }

        warnings.push("Word styles mapped to standard semantic markdown headings.");

        const markdown = result.value || `# Converted Word Document: ${file.name}\n\n*No content extracted.*`;
        const analysis = calculateStructureScore(markdown);

        const report: ConversionFidelityReport = {
            format: "DOCX",
            originalFileName: file.name,
            fileSizeFormatted: formatBytes(file.size),
            headingsPreserved: analysis.metrics.headingsCount,
            tablesPreserved: analysis.metrics.tablesCount,
            listsPreserved: analysis.metrics.listsCount,
            mathExpressionsDetected: analysis.metrics.mathCount,
            degradationsAndWarnings: warnings,
            structureScore: analysis.totalScore,
            structureGrade: analysis.grade,
            structureTier: analysis.tierName,
            estimatedTokens: estimateTokens(markdown),
            processedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        return { markdown, report };
    } catch (error) {
        console.error("DOCX extraction error:", error);
        throw new Error("Failed to extract text from Word document");
    }
}
