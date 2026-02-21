"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type TrackingRow = {
  reference_code: string;
  full_name: string | null;
  phone: string | null;

  sender_phone: string | null;
  sender_email: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_email: string | null;
  receiver_postal_code: string | null;
  receiver_address: string | null;

  pickup_location: string | null;
  destination_country: string | null;
  package_type: string | null;
  status: string | null;
  created_at: string | null;
};

const BRAND = {
  teal: "#1F7A8C",
  tealHover: "#176270",
  cream: "#F2EFE6",
  dark: "#111827",
};

const STATUS_FLOW = [
  "Pending",
  "Contacted",
  "Confirmed",
  "Dispatched",
  "In Transit",
  "Delivered",
] as const;

const STATUS_HELP: Record<(typeof STATUS_FLOW)[number], string> = {
  Pending: "We’ve received your request. Awaiting confirmation.",
  Contacted: "Our team has reached out to confirm details.",
  Confirmed: "Your shipment has been confirmed and scheduled.",
  Dispatched: "Your package has left the origin location.",
  "In Transit": "Your package is currently on its way to destination.",
  Delivered: "Shipment has been delivered successfully.",
};

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function formatDate(dt: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeRef(s: string) {
  return s.trim().replace(/\s+/g, "").toUpperCase();
}

/** ✅ Frontend masking helpers (Option A) */
function maskPhone(phone: string | null) {
  if (!phone) return "—";
  const p = phone.replace(/\s+/g, "");
  if (p.length <= 4) return "****";
  const last4 = p.slice(-4);
  return `${p.slice(0, 3)}****${last4}`;
}

function maskEmail(email: string | null) {
  if (!email) return "—";
  const e = email.trim();
  const [user, domain] = e.split("@");
  if (!domain) return "—";
  const u = user || "";
  const maskedUser =
    u.length <= 2 ? `${u[0] ?? ""}***` : `${u.slice(0, 2)}***${u.slice(-1)}`;
  return `${maskedUser}@${domain}`;
}

function shortName(name: string | null) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

/** Don’t show full address publicly */
function safeAddress(addr: string | null) {
  if (!addr) return "—";
  return "Address on file (contact support)";
}

function Icon({
  name,
  className = "",
}: {
  name:
    | "search"
    | "check"
    | "dot"
    | "box"
    | "phone"
    | "pin"
    | "plane"
    | "clock"
    | "mail"
    | "user";
  className?: string;
}) {
  const common = {
    className: cls("inline-block", className),
    style: {
      width: "18px",
      height: "18px",
      maxWidth: "18px",
      maxHeight: "18px",
      flex: "0 0 auto",
    } as React.CSSProperties,
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 2,
  };

  switch (name) {
    case "search":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.3-4.3m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case "dot":
      return (
        <svg
          className={cls("inline-block", className)}
          style={{
            width: "18px",
            height: "18px",
            maxWidth: "18px",
            maxHeight: "18px",
            flex: "0 0 auto",
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="6" />
        </svg>
      );
    case "box":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8l-9 5-9-5m18 0l-9-5-9 5m18 0v8l-9 5-9-5V8"
          />
        </svg>
      );
    case "phone":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .6 2.9a2 2 0 01-.5 2.1L8 10.9a16 16 0 007.1 7.1l2.2-1.2a2 2 0 012.1-.5c.9.3 1.9.5 2.9.6a2 2 0 011.7 2z"
          />
        </svg>
      );
    case "pin":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21s7-4.4 7-11a7 7 0 10-14 0c0 6.6 7 11 7 11z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 21l1.5-6 9-6-9 1.5L3 5l1-2 9.5 5.5L22 7l-8 8-1.5 6-2-.5z"
          />
        </svg>
      );
    case "clock":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "mail":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l8 7 8-7" />
        </svg>
      );
    case "user":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      );
  }
}

function StatusTimeline({ status }: { status: string | null }) {
  const currentIndex = useMemo(() => {
    const idx = STATUS_FLOW.indexOf((status || "Pending") as any);
    return idx === -1 ? 0 : idx;
  }, [status]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-black/60">
            Shipment status
          </p>
          <h3 className="mt-1 text-xl md:text-2xl font-bold" style={{ color: BRAND.dark }}>
            {STATUS_FLOW[currentIndex]}
          </h3>
          <p className="mt-1 text-sm text-black/70">{STATUS_HELP[STATUS_FLOW[currentIndex]]}</p>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "rgba(31, 122, 140, 0.12)",
            color: BRAND.teal,
          }}
        >
          Live Tracking
        </span>
      </div>

      {/* Vertical stepper */}
      <div className="mt-6 space-y-6">
        {STATUS_FLOW.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;

          return (
            <div key={s} className="flex items-start gap-4">
              <div className="relative flex flex-col items-center">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: done ? BRAND.teal : "white",
                    border: done
                      ? `2px solid ${BRAND.teal}`
                      : active
                      ? `2px solid ${BRAND.teal}`
                      : "2px solid rgba(0,0,0,0.20)",
                    boxShadow: active ? "0 0 0 6px rgba(31,122,140,0.12)" : "none",
                    color: done ? "white" : BRAND.teal,
                  }}
                >
                  {done ? (
                    <Icon name="check" className="h-4 w-4" />
                  ) : (
                    <span
                      className="rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: active ? BRAND.teal : "rgba(0,0,0,0.25)",
                      }}
                    />
                  )}
                </div>

                {i < STATUS_FLOW.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      height: 34,
                      marginTop: 6,
                      backgroundColor: i < currentIndex ? BRAND.teal : "rgba(0,0,0,0.14)",
                      borderRadius: 999,
                    }}
                  />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-black">{s}</p>
                <p className="mt-0.5 text-xs text-black/60">{STATUS_HELP[s]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState<TrackingRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRow(null);

    const code = normalizeRef(ref);
    if (!code || code.length < 6) {
      setError("Enter a valid tracking code (minimum 6 characters).");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("track_shipment", {
        p_reference_code: code,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("No shipment found for that tracking code. Please confirm and try again.");
        return;
      }

      setRow(data[0] as TrackingRow);
    } catch (err: any) {
      setError(err?.message || "Something went wrong while tracking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const senderPhone = row?.sender_phone ?? row?.phone ?? null;
  const senderEmail = row?.sender_email ?? null;

  /** ✅ Masked public display */
  const publicSenderPhone = maskPhone(senderPhone);
  const publicReceiverPhone = maskPhone(row?.receiver_phone ?? null);
  const publicSenderEmail = maskEmail(senderEmail);
  const publicReceiverEmail = maskEmail(row?.receiver_email ?? null);
  const publicReceiverName = shortName(row?.receiver_name ?? null);
  const publicAddress = safeAddress(row?.receiver_address ?? null);

  return (
    <div style={{ backgroundColor: BRAND.cream }} className="min-h-screen">
      <div className="sticky top-0 z-20 border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(31,122,140,0.12)", color: BRAND.teal }}
              aria-hidden="true"
            >
              <Icon name="box" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">JANVI EXPRESS</p>
              <p className="text-xs text-black/60">Shipment Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/quote"
              className="rounded-xl px-3 py-2 text-sm font-semibold border border-black/10 bg-white hover:bg-black/5"
            >
              Get a Quote
            </Link>
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm font-semibold"
              style={{ backgroundColor: BRAND.teal, color: "white" }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Track your shipment</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold" style={{ color: BRAND.dark }}>
              Enter your tracking code to view real-time status.
            </h1>
            <p className="mt-2 text-sm text-black/70">
              Use the tracking code provided after confirmation. This helps you stay updated from dispatch to delivery.
            </p>

            <form onSubmit={handleTrack} className="mt-6">
              <label className="block text-sm font-semibold text-black">Tracking Code</label>

              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                    <Icon name="search" className="h-5 w-5" />
                  </span>
                  <input
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    placeholder="e.g. JX-2026-8F3K21"
                    className="w-full rounded-xl border border-black/10 bg-white px-10 py-3 text-sm font-semibold text-black outline-none ring-0 focus:border-black/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cls("rounded-xl px-6 py-3 text-sm font-semibold transition", loading && "opacity-70")}
                  style={{ backgroundColor: BRAND.teal, color: "white" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.tealHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.teal;
                  }}
                >
                  {loading ? "Tracking..." : "Track"}
                </button>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </form>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Shipment summary</p>

            {!row ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-black/5 p-4">
                <p className="text-sm font-semibold text-black">No shipment loaded yet</p>
                <p className="mt-1 text-xs text-black/60">
                  Enter a valid tracking code to view shipment details and status timeline.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-black/60">Tracking Code</p>
                      <p className="text-sm font-bold text-black">{row.reference_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-black/60">Created</p>
                      <p className="text-sm font-semibold text-black">{formatDate(row.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Pickup</p>
                    <p className="mt-1 text-sm font-semibold text-black">{row.pickup_location || "—"}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Destination</p>
                    <p className="mt-1 text-sm font-semibold text-black">{row.destination_country || "—"}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Package</p>
                    <p className="mt-1 text-sm font-semibold text-black">{row.package_type || "—"}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Receiver Name</p>
                    <p className="mt-1 text-sm font-semibold text-black">{publicReceiverName}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Sender Phone</p>
                    <p className="mt-1 text-sm font-semibold text-black">{publicSenderPhone}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Receiver Phone</p>
                    <p className="mt-1 text-sm font-semibold text-black">{publicReceiverPhone}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Sender Email</p>
                    <p className="mt-1 text-sm font-semibold text-black">{publicSenderEmail}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Receiver Email</p>
                    <p className="mt-1 text-sm font-semibold text-black">{publicReceiverEmail}</p>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Postal Code</p>
                    <p className="mt-1 text-sm font-semibold text-black">{row.receiver_postal_code || "—"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Receiver Address</p>
                  <p className="mt-1 text-sm font-semibold text-black">{publicAddress}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 md:mt-8">
          <StatusTimeline status={row?.status || null} />
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-black">Need help with your shipment?</p>
              <p className="text-sm text-black/70">
                Contact Janvi operations for clarification on status, delivery, or pickup details.
              </p>
            </div>

            <a
              href="https://wa.me/+2349048236914"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
              style={{ backgroundColor: BRAND.teal, color: "white" }}
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}