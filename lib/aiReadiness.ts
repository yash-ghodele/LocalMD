export interface StructurePillar {
    name: string;
    score: number;
    maxScore: number;
    details: string;
}

export interface StructureAnalysis {
    totalScore: number;
    grade: "A+" | "A" | "B" | "C";
    tierName: "Optimal" | "Good" | "Moderate" | "Raw / Unstructured";
    pillars: StructurePillar[];
    metrics: {
        wordCount: number;
        charCount: number;
        estimatedTokens: number;
        headingsCount: number;
        h1Count: number;
        h2Count: number;
        h3Count: number;
        h4PlusCount: number;
        listsCount: number;
        tablesCount: number;
        codeBlocksCount: number;
        mathCount: number;
        blockquotesCount: number;
        averageParagraphWords: number;
        monolithicBlocksCount: number;
    };
    suggestions: string[];
}

/**
 * Fast & accurate token estimation calibrated against standard LLM tokenizers
 * (GPT-4 / Claude / Llama avg ~3.85 - 4 characters per token).
 */
export function estimateTokens(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    return Math.ceil(text.length / 3.85);
}

/**
 * Deterministic 100-Point Structure Score Algorithm
 * Calibrated to support technical/academic prose without double-penalizing legitimate deep paragraphs.
 */
export function calculateStructureScore(text: string): StructureAnalysis {
    const trimmed = text.trim();
    if (!trimmed) {
        return {
            totalScore: 0,
            grade: "C",
            tierName: "Raw / Unstructured",
            pillars: [
                { name: "Heading Hierarchy", score: 0, maxScore: 30, details: "Document is empty." },
                { name: "Section Granularity", score: 0, maxScore: 25, details: "No content found." },
                { name: "Semantic Richness", score: 0, maxScore: 25, details: "No semantic elements." },
                { name: "Formatting Hygiene", score: 0, maxScore: 20, details: "Clean slate." }
            ],
            metrics: {
                wordCount: 0,
                charCount: 0,
                estimatedTokens: 0,
                headingsCount: 0,
                h1Count: 0,
                h2Count: 0,
                h3Count: 0,
                h4PlusCount: 0,
                listsCount: 0,
                tablesCount: 0,
                codeBlocksCount: 0,
                mathCount: 0,
                blockquotesCount: 0,
                averageParagraphWords: 0,
                monolithicBlocksCount: 0,
            },
            suggestions: ["Start typing or import a document to calculate structure score."]
        };
    }

    const lines = text.split("\n");
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const estimatedTokens = estimateTokens(text);

    // 1. Analyze Headings
    let h1Count = 0;
    let h2Count = 0;
    let h3Count = 0;
    let h4PlusCount = 0;
    const headingLevels: number[] = [];
    const headingsList: string[] = [];

    lines.forEach(line => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const lvl = match[1].length;
            headingLevels.push(lvl);
            headingsList.push(match[2].trim());
            if (lvl === 1) h1Count++;
            else if (lvl === 2) h2Count++;
            else if (lvl === 3) h3Count++;
            else h4PlusCount++;
        }
    });

    const totalHeadings = headingLevels.length;

    // Check heading hierarchy validity (no skip > 1 level, e.g., H1 -> H3)
    let hasSkippedLevels = false;
    for (let i = 0; i < headingLevels.length - 1; i++) {
        if (headingLevels[i + 1] - headingLevels[i] > 1) {
            hasSkippedLevels = true;
            break;
        }
    }

    let headingScore = 0;
    const headingDetails: string[] = [];
    if (h1Count >= 1) {
        headingScore += 10;
        headingDetails.push("Top-level H1 document title present (+10)");
    } else {
        headingDetails.push("Missing primary # H1 title (-10)");
    }

    if (totalHeadings > 0 && !hasSkippedLevels) {
        headingScore += 10;
        headingDetails.push("Consistent heading hierarchy without skipped levels (+10)");
    } else if (hasSkippedLevels) {
        headingScore += 4;
        headingDetails.push("Skipped heading levels detected (e.g. H1 to H3) (+4)");
    } else {
        headingDetails.push("No subheadings detected (+0)");
    }

    // Heading density: lenient for short documents, rewarding 1 heading per 80-600 words for technical docs
    const wordsPerHeading = totalHeadings > 0 ? wordCount / totalHeadings : wordCount;
    if (totalHeadings > 0 && wordsPerHeading <= 600) {
        headingScore += 10;
        headingDetails.push("Balanced heading distribution (+10)");
    } else if (totalHeadings > 0 && wordsPerHeading <= 900) {
        headingScore += 6;
        headingDetails.push("Moderate heading density (+6)");
    } else if (wordCount < 150) {
        headingScore += 10; // short doc
        headingDetails.push("Compact document (+10)");
    } else {
        headingScore += 2;
        headingDetails.push("Sparse heading density for document length (+2)");
    }
    headingScore = Math.min(30, Math.max(0, headingScore));

    // 2. Analyze Section Granularity & Paragraphs
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    let monolithicBlocks = 0;
    let totalParagraphWords = 0;

    paragraphs.forEach(p => {
        const pWords = p.split(/\s+/).filter(w => w.length > 0).length;
        totalParagraphWords += pWords;
        // Only penalize truly monolithic unsegmented blocks (>600 words with no headings or lists)
        if (pWords > 600 && !p.startsWith("```")) {
            monolithicBlocks++;
        }
    });

    const avgParagraphWords = paragraphs.length > 0 ? Math.round(totalParagraphWords / paragraphs.length) : 0;
    let granularityScore = 25;
    const granularityDetails: string[] = [];

    if (monolithicBlocks > 0) {
        const deduction = Math.min(12, monolithicBlocks * 6);
        granularityScore -= deduction;
        granularityDetails.push(`${monolithicBlocks} monolithic text block(s) (>600 words) detected (-${deduction})`);
    } else {
        granularityDetails.push("No monolithic unsegmented blocks (+15)");
    }

    // Lenient paragraph range (up to 300 words average is natural for technical writing)
    if (avgParagraphWords >= 15 && avgParagraphWords <= 300) {
        granularityDetails.push(`Natural paragraph flow (~${avgParagraphWords} words avg) (+10)`);
    } else if (avgParagraphWords > 300) {
        granularityScore -= 4;
        granularityDetails.push(`Very dense paragraphs (~${avgParagraphWords} words avg) (-4)`);
    } else {
        granularityDetails.push(`Short/scannable sections (~${avgParagraphWords} words avg) (+10)`);
    }
    granularityScore = Math.min(25, Math.max(0, granularityScore));

    // 3. Analyze Semantic Richness
    let listCount = 0;
    let tableCount = 0;
    let codeBlockCount = 0;
    let mathCount = 0;
    let blockquoteCount = 0;

    lines.forEach(line => {
        if (/^(\s*[-*+]|\s*\d+\.)\s+/.test(line)) listCount++;
        if (/^\|.*\|$/.test(line.trim())) tableCount++;
        if (/^>\s+/.test(line)) blockquoteCount++;
    });

    const codeMatches = text.match(/```[\s\S]*?```/g);
    codeBlockCount = codeMatches ? codeMatches.length : 0;

    const mathMatches = text.match(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+\$)/g);
    mathCount = mathMatches ? mathMatches.length : 0;

    let richnessScore = 0;
    const richnessDetails: string[] = [];

    if (listCount > 0) {
        richnessScore += 10;
        richnessDetails.push(`Structured lists present (${listCount} items) (+10)`);
    }
    if (tableCount > 0) {
        richnessScore += 8;
        richnessDetails.push(`Tables present (${Math.max(1, Math.round(tableCount / 3))} tables) (+8)`);
    }
    if (codeBlockCount > 0 || mathCount > 0 || blockquoteCount > 0) {
        richnessScore += 7;
        richnessDetails.push(`Rich elements present (Code: ${codeBlockCount}, Math: ${mathCount}, Quotes: ${blockquoteCount}) (+7)`);
    }
    if (richnessScore === 0) {
        richnessDetails.push("Pure plaintext prose without lists, tables, or callouts (+0)");
    }
    richnessScore = Math.min(25, richnessScore);

    // 4. Formatting Hygiene
    let hygieneScore = 20;
    const hygieneDetails: string[] = [];

    // Check for OCR / PDF artifact lines
    const loneCharLines = lines.filter(l => l.trim().length === 1).length;
    if (loneCharLines > 8 && loneCharLines > lines.length * 0.15) {
        hygieneScore -= 8;
        hygieneDetails.push(`Detected ${loneCharLines} orphaned single-character artifact lines (-8)`);
    }

    // Check for excessive consecutive empty lines (> 3)
    if (/\n{4,}/.test(text)) {
        hygieneScore -= 4;
        hygieneDetails.push("Excessive consecutive blank lines (-4)");
    }

    // Check for unescaped control characters / broken unicode
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) {
        hygieneScore -= 8;
        hygieneDetails.push("Unescaped binary/control characters detected (-8)");
    }

    if (hygieneScore === 20) {
        hygieneDetails.push("Clean markdown syntax with zero artifact noise (+20)");
    }
    hygieneScore = Math.min(20, Math.max(0, hygieneScore));

    const totalScore = Math.round(headingScore + granularityScore + richnessScore + hygieneScore);

    let grade: "A+" | "A" | "B" | "C" = "C";
    let tierName: "Optimal" | "Good" | "Moderate" | "Raw / Unstructured" = "Raw / Unstructured";

    if (totalScore >= 90) {
        grade = "A+";
        tierName = "Optimal";
    } else if (totalScore >= 75) {
        grade = "A";
        tierName = "Good";
    } else if (totalScore >= 60) {
        grade = "B";
        tierName = "Moderate";
    } else {
        grade = "C";
        tierName = "Raw / Unstructured";
    }

    const suggestions: string[] = [];
    if (h1Count === 0) suggestions.push("Add a top-level # Document Title at the beginning.");
    if (hasSkippedLevels) suggestions.push("Fix heading hierarchy to avoid skipping levels (e.g. don't jump from # to ###).");
    if (monolithicBlocks > 0) suggestions.push("Break up large monolithic paragraphs (>600 words) into subheadings or bullet points.");
    if (listCount === 0 && wordCount > 300) suggestions.push("Consider converting sequential items into structured lists.");
    if (totalScore >= 90) suggestions.push("Document is highly structured and ready for optimal LLM context & RAG ingestion.");

    return {
        totalScore,
        grade,
        tierName,
        pillars: [
            { name: "Heading Hierarchy", score: headingScore, maxScore: 30, details: headingDetails.join("; ") },
            { name: "Section Granularity", score: granularityScore, maxScore: 25, details: granularityDetails.join("; ") },
            { name: "Semantic Richness", score: richnessScore, maxScore: 25, details: richnessDetails.join("; ") },
            { name: "Formatting Hygiene", score: hygieneScore, maxScore: 20, details: hygieneDetails.join("; ") },
        ],
        metrics: {
            wordCount,
            charCount,
            estimatedTokens,
            headingsCount: totalHeadings,
            h1Count,
            h2Count,
            h3Count,
            h4PlusCount,
            listsCount: listCount,
            tablesCount: Math.max(0, Math.round(tableCount / 3)),
            codeBlocksCount: codeBlockCount,
            mathCount,
            blockquotesCount: blockquoteCount,
            averageParagraphWords: avgParagraphWords,
            monolithicBlocksCount: monolithicBlocks,
        },
        suggestions,
    };
}

/**
 * Formats Markdown for pristine LLM Context ingestion with an explicit outline and metadata envelope.
 */
export function formatForAIContext(params: {
    content: string;
    fileName: string;
    format?: string;
}): string {
    const { content, fileName, format = "Markdown" } = params;
    const analysis = calculateStructureScore(content);
    
    // Extract outline
    const lines = content.split("\n");
    const outline: string[] = [];
    lines.forEach(line => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const indent = "  ".repeat(match[1].length - 1);
            outline.push(`${indent}- ${match[2].trim()}`);
        }
    });

    const outlineText = outline.length > 0 ? outline.join("\n") : "- [No explicit headings detected]";

    // Clean trailing whitespace and trim excessive breaks
    const cleanContent = content
        .replace(/[ \t]+$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return `<document filename="${fileName}" estimated_tokens="${analysis.metrics.estimatedTokens}" structure_score="${analysis.totalScore}/100 (${analysis.tierName})" format="${format}">
<!-- LocalMD Knowledge Transformation: 100% On-Device, Zero Cloud Telemetry -->
# Document Outline
${outlineText}

# Document Content
${cleanContent}
</document>`;
}
