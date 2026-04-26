import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ratelimit } from "@/lib/ratelimit";
import sanitizeHtml from "sanitize-html";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ---------------------------
   SANITIZER
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
       RATE LIMIT
    --------------------------- */
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "127.0.0.1";

    const { success: rateOk } = await ratelimit.limit(ip);

    if (!rateOk) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    /* ---------------------------
       PARSE BODY
    --------------------------- */
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { captchaToken, payload } = body;

    if (!captchaToken) {
      return NextResponse.json(
        { error: "Captcha required" },
        { status: 400 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* ---------------------------
       SANITIZE INPUT
--------------------------- */
    const data = {
      full_name: clean(payload.full_name),
      sender_phone: clean(payload.sender_phone),
      sender_email: clean(payload.sender_email),
      receiver_name: clean(payload.receiver_name),
      receiver_phone: clean(payload.receiver_phone),
      receiver_email: clean(payload.receiver_email),
      receiver_postal_code: clean(payload.receiver_postal_code),
      receiver_address: clean(payload.receiver_address),
      pickup_location: clean(payload.pickup_location),
      destination_country: clean(payload.destination_country),
      package_type: clean(payload.package_type),
      reference_code: clean(payload.reference_code)
    };

    /* ---------------------------
       BASIC VALIDATION
--------------------------- */
    if (!data.full_name || !data.sender_phone || !data.sender_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ---------------------------
       TURNSTILE VERIFY (HARDENED)
--------------------------- */
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY missing");
      return NextResponse.json(
        { error: "Server captcha misconfiguration" },
        { status: 500 }
      );
    }

    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", captchaToken);

    let verify;
    let captchaData;

    try {
      verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData
        }
      );

      captchaData = await verify.json();
    } catch (err) {
      console.error("TURNSTILE FETCH ERROR:", err);
      return NextResponse.json(
        { error: "Captcha service unavailable" },
        { status: 503 }
      );
    }

    console.log("TURNSTILE RESPONSE:", captchaData);

    if (!captchaData || captchaData.success !== true) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 403 }
      );
    }

    /* ---------------------------
       SUPABASE INSERT
--------------------------- */
    const { error } = await supabase
      .from("shipping_requests")
      .insert({
        ...data,
        status: "Pending"
      });

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    /* ---------------------------
       SUCCESS RESPONSE
--------------------------- */
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("UNEXPECTED SERVER ERROR:", err);

    return NextResponse.json(
      {
        error: "Server error",
        debug: err?.message || "unknown"
      },
      { status: 500 }
    );
  }
}
