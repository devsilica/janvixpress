// app/api/admin/waybill/[referenceCode]/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Page 2 shipper (admin copy)
const SHIPPER = {
  org: "Janvi Xpress",
  name: "Caleb Taiwo",
  address: "18 Sam Carol Osunlola Street 102214 Lagos Nigeria",
  phone: "+2349048236914",
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ referenceCode: string }> }
) {
  try {
    const { referenceCode: raw } = await ctx.params;
    const referenceCode = decodeURIComponent(raw).trim();

    const { data: r, error } = await supabase
      .from("shipping_requests")
      .select("*")
      .eq("reference_code", referenceCode)
      .maybeSingle();

    if (error || !r) {
      return NextResponse.json(
        { error: "Not found", searched: referenceCode },
        { status: 404 }
      );
    }

    const dateStr = r.created_at
      ? new Date(r.created_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const senderName = (r.full_name ?? "—").toString();

    const barcodePng = await bwipjs.toBuffer({
      bcid: "code128",
      text: referenceCode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // =============================
    // Load Logo (jl.png)
    // =============================
    const logoPath = path.join(process.cwd(), "public", "jl.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    // =============================
    // PAGE 1
    // =============================
    const p1 = pdfDoc.addPage([595.28, 841.89]);

    // Watermark (centered, faint)
    const watermarkDims = logoImage.scale(0.9);
    p1.drawImage(logoImage, {
      x: 170,
      y: 250,
      width: watermarkDims.width,
      height: watermarkDims.height,
      opacity: 0.06,
      rotate: degrees(45),
    });

    // Top right logo
    const logoDims = logoImage.scale(0.25);
    p1.drawImage(logoImage, {
      x: 300,
      y: 730,
      width: logoDims.width,
      height: logoDims.height,
    });

    p1.drawText("JANVI XPRESS", { x: 40, y: 800, size: 18, font });
    p1.drawText(`Date: ${dateStr}`, { x: 40, y: 780, size: 10, font });

    // FROM (sender name twice + Nigeria only)
    p1.drawText("FROM:", { x: 40, y: 740, size: 11, font });
    p1.drawText(senderName, { x: 40, y: 725, size: 11, font });
    p1.drawText(senderName, { x: 40, y: 710, size: 11, font });
    p1.drawText("NIGERIA", { x: 40, y: 695, size: 10, font });

    // TO
    p1.drawText("TO:", { x: 40, y: 660, size: 11, font });
    p1.drawText(`${r.receiver_name ?? "-"}`, { x: 40, y: 645, size: 11, font });
    p1.drawText(`${r.destination_country ?? "-"}`, { x: 40, y: 630, size: 10, font });
     p1.drawText(
      `${r.receiver_postal_code ?? "-"}`,
      { x: 40, y: 615, size: 10, font }                     
    );
    
 
    p1.drawText( `${r.receiver_address ?? "-"}`,
      { x: 40, y: 600, size: 10, font }
       );

    p1.drawText("TRACKING CODE", { x: 40, y: 565, size: 10, font });
    p1.drawText(`${referenceCode}`, { x: 40, y: 540, size: 22, font });

    p1.drawText(`Pickup: ${r.pickup_location ?? "-"}`, { x: 40, y: 505, size: 10, font });
    p1.drawText(`Package Type: ${r.package_type ?? "-"}`, { x: 40, y: 490, size: 10, font });
    p1.drawText(`Weight: ${r.weight ?? "-"} kg`, { x: 40, y: 475, size: 10, font });

    // Barcode lower third
    const barcode1 = await pdfDoc.embedPng(barcodePng);
    const b1 = barcode1.scale(0.9);
    p1.drawImage(barcode1, { x: 40, y: 310, width: b1.width, height: b1.height });

    // =============================
    // PAGE 2 (Admin Copy)
    // =============================
    const p2 = pdfDoc.addPage([595.28, 841.89]);

    // Watermark page 2
    p2.drawImage(logoImage, {
      x: 80,
      y: 250,
      width: watermarkDims.width,
      height: watermarkDims.height,
      opacity: 0.05,
      rotate: degrees(45),
    });

    p2.drawImage(logoImage, {
      x: 300,
      y: 730,
      width: logoDims.width,
      height: logoDims.height,
    });

    p2.drawText("JANVI XPRESS - WAYBILL DOC", { x: 40, y: 800, size: 16, font });
    p2.drawText("Not to be attached to package - Hand to Courier", {
      x: 40,
      y: 780,
      size: 10,
      font,
    });
    p2.drawText(`Date: ${dateStr}`, { x: 40, y: 760, size: 10, font });

    p2.drawText("SHIPPER:", { x: 40, y: 725, size: 11, font });
    p2.drawText(`${SHIPPER.name} (${SHIPPER.org})`, { x: 40, y: 710, size: 11, font });
    p2.drawText(`${SHIPPER.address}`, { x: 40, y: 695, size: 10, font });
    p2.drawText(`Phone: ${SHIPPER.phone}`, { x: 40, y: 680, size: 10, font });

    p2.drawText("RECEIVER:", { x: 40, y: 640, size: 11, font });
    p2.drawText(`${r.receiver_name ?? "-"}`, { x: 40, y: 625, size: 11, font });
    p2.drawText(`${r.receiver_address ?? "-"}`, { x: 40, y: 610, size: 10, font });
    p2.drawText(`${r.destination_country ?? "-"}`, { x: 40, y: 595, size: 10, font });
    p2.drawText(`Phone: ${r.receiver_phone ?? "-"}`, { x: 320, y: 625, size: 10, font });
    p2.drawText(`Email: ${r.receiver_email ?? "-"}`, { x: 320, y: 610, size: 10, font });

    const content = (r.notes ?? "-") as string;
    p2.drawText(`Content/Notes: ${content}`, { x: 40, y: 560, size: 10, font });
    p2.drawText(`Delivery Speed: ${r.delivery_speed ?? "-"}`, { x: 40, y: 545, size: 10, font });

    const barcode2 = await pdfDoc.embedPng(barcodePng);
    const b2 = barcode2.scale(1.0);
    p2.drawImage(barcode2, { x: 15, y: 300, width: b2.width, height: b2.height });

    const bytes = await pdfDoc.save();
    const body = new Uint8Array(bytes).buffer;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="janvi-waybill-${referenceCode}.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}