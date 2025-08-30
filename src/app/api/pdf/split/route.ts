import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pageRanges = formData.get("pageRanges") as string; // e.g., "1-3,5,7-9"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    // Parse page ranges
    let pagesToExtract: number[] = [];

    if (pageRanges) {
      const ranges = pageRanges.split(",");
      for (const range of ranges) {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map((n) => parseInt(n.trim()));
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) {
              pagesToExtract.push(i - 1); // Convert to 0-based index
            }
          }
        } else {
          const pageNum = parseInt(range.trim());
          if (pageNum >= 1 && pageNum <= totalPages) {
            pagesToExtract.push(pageNum - 1); // Convert to 0-based index
          }
        }
      }
    } else {
      // If no ranges specified, split into individual pages
      pagesToExtract = Array.from({ length: totalPages }, (_, i) => i);
    }

    // Remove duplicates and sort
    pagesToExtract = [...new Set(pagesToExtract)].sort((a, b) => a - b);

    if (pagesToExtract.length === 0) {
      return NextResponse.json(
        { error: "No valid pages to extract" },
        { status: 400 }
      );
    }

    // If only one page range or continuous pages, create single PDF
    if (pagesToExtract.length === totalPages || isConsecutive(pagesToExtract)) {
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="split-${file.name}"`,
          "X-Page-Count": pagesToExtract.length.toString(),
        },
      });
    } else {
      // Create multiple PDFs (one per page/range)
      const splitPdfs = [];

      for (const pageIndex of pagesToExtract) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        splitPdfs.push({
          name: `page-${pageIndex + 1}-${file.name}`,
          data: Buffer.from(pdfBytes),
        });
      }

      // For multiple files, we'd need to create a ZIP
      // For now, return info about what would be created
      return NextResponse.json({
        message: "Multiple page split",
        files: splitPdfs.map((pdf) => ({
          name: pdf.name,
          size: pdf.data.length,
        })),
        note: "In production, this would return a ZIP file with all split PDFs",
      });
    }
  } catch (error) {
    console.error("Split error:", error);
    return NextResponse.json({ error: "Failed to split PDF" }, { status: 500 });
  }
}

function isConsecutive(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1] + 1) {
      return false;
    }
  }
  return true;
}
