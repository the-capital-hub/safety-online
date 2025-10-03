import { NextResponse } from "next/server";
import { buildChecklistPdf } from "@/lib/reports/checklist.js";

export async function POST(req) {
	try {
		const body = await req.json();
		const { title, project, sections, appendixText } = body || {};
		const buffer = buildChecklistPdf({
			title: title || "E-commerce Code Review Report",
			project: project || "Safety",
			sections: Array.isArray(sections) ? sections : [],
			appendixText: appendixText || "",
			generatedAt: new Date(),
		});

		return new NextResponse(Buffer.from(buffer), {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="checklist-report.pdf"`,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to generate report" },
			{ status: 500 }
		);
	}
}

