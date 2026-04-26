import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ratelimit } from "@/lib/ratelimit";
import sanitizeHtml from "sanitize-html";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ---------------------------
   INPUT SANITIZER
--------------------------- */

function clean(input: unknown) {
  if (typeof input !== "string") return "";
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

export async function POST(req: Request) {
  try {

    /* ---------------------------
       RATE LIMITING
    --------------------------- */

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    /* ---------------------------
       PARSE REQUEST
    --------------------------- */

    const body = await req.json();
    const { captchaToken, payload } = body;

    if (!captchaToken) {
      return NextResponse.json(
        { error: "Captcha required" },
        { status: 400 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    /* ---------------------------
       SANITIZE INPUT
    --------------------------- */

    const full_name = clean(payload.full_name);
    const sender_phone = clean(payload.sender_phone);
    const sender_email = clean(payload.sender_email);
    const receiver_name = clean(payload.receiver_name);
    const receiver_phone = clean(payload.receiver_phone);
    const receiver_email = clean(payload.receiver_email);
    const receiver_postal_code = clean(payload.receiver_postal_code);
    const receiver_address = clean(payload.receiver_address);
    const pickup_location = clean(payload.pickup_location);
    const destination_country = clean(payload.destination_country);
    const package_type = clean(payload.package_type);
    const reference_code = clean(payload.reference_code);

    /* ---------------------------
       SERVER VALIDATION
    --------------------------- */

    if (!full_name || full_name.length > 100) {
      return NextResponse.json(
        { error: "Invalid sender name" },
        { status: 400 }
      );
    }

    if (!sender_phone || sender_phone.length < 6) {
      return NextResponse.json(
        { error: "Invalid sender phone number" },
        { status: 400 }
      );
    }

    if (!sender_email || !sender_email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid sender email" },
        { status: 400 }
      );
    }

    if (!receiver_name || receiver_name.length > 100) {
      return NextResponse.json(
        { error: "Invalid receiver name" },
        { status: 400 }
      );
    }

    if (!receiver_phone || receiver_phone.length < 6) {
      return NextResponse.json(
        { error: "Invalid receiver phone number" },
        { status: 400 }
      );
    }

    if (!receiver_address || receiver_address.length < 5) {
      return NextResponse.json(
        { error: "Invalid receiver address" },
        { status: 400 }
      );
    }

    if (!pickup_location || pickup_location.length < 2) {
      return NextResponse.json(
        { error: "Invalid pickup location" },
        { status: 400 }
      );
    }

    if (!destination_country) {
      return NextResponse.json(
        { error: "Destination country required" },
        { status: 400 }
      );
    }

    if (!package_type) {
      return NextResponse.json(
        { error: "Package type required" },
        { status: 400 }
      );
    }

    /* ---------------------------
       CAPTCHA VERIFICATION
    --------------------------- */

    const verify = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: captchaToken
        })
      }
    );

    const captchaData = await verify.json();

    if (!captchaData.success) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 403 }
      );
    }

    /* ---------------------------
       SAFE DATABASE INSERT
    --------------------------- */

    const { error } = await supabase
      .from("shipping_requests")
      .insert({
        full_name,
        sender_phone,
        sender_email,
        receiver_name,
        receiver_phone,
        receiver_email,
        receiver_postal_code,
        receiver_address,
        pickup_location,
        destination_country,
        package_type,
        reference_code,
        status: "Pending"
      });

    if (error) {
      console.error("Database error:", error);

   return NextResponse.json(
  { error: error.message, details: error },
  { status: 500 }
);
    }

    /* ---------------------------
       SUCCESS RESPONSE
    --------------------------- */

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Server error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
