import jsPDF from "jspdf";

function addWrappedText(
	doc,
	text,
	x,
	y,
	maxWidth,
	lineHeight = 6,
	fontSize = 10
) {
	doc.setFontSize(fontSize);
	const lines = doc.splitTextToSize(text, maxWidth);
	lines.forEach((line) => {
		doc.text(line, x, y);
		y += lineHeight;
	});
	return y;
}

export function buildChecklistPdf({
	title = "E-commerce Code Review Report",
	project = "Safety",
	generatedAt = new Date(),
	sections = [],
	appendixText = "",
} = {}) {
	const doc = new jsPDF();
	let y = 20;

	// Header
	doc.setFont("helvetica", "bold");
	doc.setFontSize(18);
	doc.text(title, 20, y);

	y += 8;
	doc.setFontSize(11);
	doc.setFont("helvetica", "normal");
	doc.text(`Project: ${project}`, 20, y);
	y += 6;
	doc.text(`Generated: ${generatedAt.toLocaleString()}`, 20, y);

	// Line
	y += 6;
	doc.setDrawColor(200, 200, 200);
	doc.line(20, y, 190, y);
	y += 8;

	// Body sections
	sections.forEach((section, idx) => {
		if (y > 270) {
			doc.addPage();
			y = 20;
		}
		doc.setFont("helvetica", "bold");
		doc.setFontSize(14);
		doc.text(section.title, 20, y);
		y += 8;
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		(section.items || []).forEach((item) => {
			if (y > 280) {
				doc.addPage();
				y = 20;
			}
			const status =
				item.status === true ? "✅" : item.status === false ? "❌" : "⚠️";
			const head = `${status} ${item.priority?.toUpperCase() || "REQUIRED"} - ${
				item.text
			}`;
			y = addWrappedText(doc, head, 20, y, 170, 6, 10) + 2;
			if (item.suggestion) {
				y =
					addWrappedText(
						doc,
						`Suggestion: ${item.suggestion}`,
						26,
						y,
						164,
						6,
						9
					) + 4;
			}
		});
		// spacing between sections
		y += 2;
	});

	// Appendix
	if (appendixText) {
		if (y > 260) {
			doc.addPage();
			y = 20;
		}
		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text("Appendix: Project review (Required first)", 20, y);
		y += 8;
		doc.setFont("helvetica", "normal");
		y = addWrappedText(doc, appendixText, 20, y, 170, 6, 9);
	}

	return doc.output("arraybuffer");
}

