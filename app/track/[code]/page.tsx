"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type TrackingRow = {
  reference_code: string;
  full_name: string | null;
  sender_phone: string | null;
  sender_email: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_email: string | null;
  pickup_location: string | null;
  destination_country: string | null;
  package_type: string | null;
  status: string | null;
  created_at: string | null;
};

const STATUS_FLOW = [
  "Pending",
  "Contacted",
  "Confirmed",
  "Dispatched",
  "In Transit",
  "Delivered",
];

const STATUS_HELP: Record<string, string> = {
  Pending: "We’ve received your request.",
  Contacted: "Our team contacted you to confirm details.",
  Confirmed: "Shipment has been confirmed and scheduled.",
  Dispatched: "Shipment has left the origin location.",
  "In Transit": "Shipment is currently moving to destination.",
  Delivered: "Shipment delivered successfully.",
};

const BRAND = {
  teal: "#1F7A8C",
  cream: "#F2EFE6",
  dark: "#0f172a",
};

function normalizeRef(s: string) {
  return s.trim().replace(/\s+/g, "").toUpperCase();
}

function maskPhone(phone: string | null) {
  if (!phone) return "—";
  const p = phone.replace(/\s+/g, "");
  if (p.length <= 4) return "****";
  const last4 = p.slice(-4);
  return `${p.slice(0, 3)}****${last4}`;
}

function maskEmail(email: string | null) {
  if (!email) return "—";
  const [user, domain] = email.split("@");
  if (!domain) return "—";
  return `${user.slice(0, 2)}***@${domain}`;
}

function formatDate(dt: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString();
}

function ShipmentTimeline({ status }: { status: string | null }) {

  const currentIndex = STATUS_FLOW.indexOf(status || "Pending");

  return (
    <div className="bg-white border rounded-2xl p-8 mt-10">

      <div className="flex items-center justify-between mb-8">

        <div>
          <p className="text-xs font-bold uppercase text-gray-500">
            Shipment Status
          </p>

          <h3 className="text-2xl font-bold text-gray-900">
            {STATUS_FLOW[currentIndex]}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {STATUS_HELP[STATUS_FLOW[currentIndex]]}
          </p>
        </div>

        <span
          className="px-3 py-1 text-xs font-semibold rounded-full"
          style={{
            backgroundColor: "rgba(31,122,140,0.12)",
            color: BRAND.teal
          }}
        >
          Live Tracking
        </span>

      </div>

      <div className="space-y-8">

        {STATUS_FLOW.map((step, i) => {

          const done = i < currentIndex;
          const active = i === currentIndex;

          return (

            <div key={step} className="flex gap-4">

              <div className="flex flex-col items-center">

                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    border: `2px solid ${BRAND.teal}`,
                    backgroundColor: done
                      ? BRAND.teal
                      : active
                      ? "white"
                      : "#e5e7eb",
                    color: done ? "white" : BRAND.teal,
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {done ? "✓" : ""}
                </div>

                {i !== STATUS_FLOW.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      height: 40,
                      backgroundColor: done
                        ? BRAND.teal
                        : "#e5e7eb",
                    }}
                  />
                )}

              </div>

              <div>

                <p className="font-semibold text-gray-900">
                  {step}
                </p>

                <p className="text-sm text-gray-500">
                  {STATUS_HELP[step]}
                </p>

              </div>

            </div>

          );
        })}

      </div>

    </div>
  );
}

export default function TrackPage() {

  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState<TrackingRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const code =
    typeof params?.code === "string"
      ? normalizeRef(params.code)
      : "";

  useEffect(() => {

    if (!code) return;

    async function fetchShipment() {

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("shipping_requests")
        .select("*")
        .eq("reference_code", code)
        .single();

      if (error || !data) {
        setError("Shipment not found.");
        setRow(null);
      } else {
        setRow(data);
      }

      setLoading(false);
    }

    fetchShipment();

  }, [code]);

  return (

    <div style={{ backgroundColor: BRAND.cream }} className="min-h-screen flex flex-col">

      {/* NAVBAR */}

      <header className="bg-white border-b border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center font-bold text-[#1F7A8C]">
              JX
            </div>
            <span className="font-bold text-lg text-black">
              Janvi Xpress
            </span>
          </div>

          <nav className="flex gap-6 text-sm font-medium text-black/70">
            <Link href="/">Home</Link>
            <Link href="/quote">Get Quote</Link>
            <Link href="/track">Track</Link>
          </nav>

        </div>
      </header>

      {/* CONTENT */}

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">

        <h1 className="text-3xl font-bold text-slate-900">
          Shipment Tracking
        </h1>

        <p className="text-black/60 mt-2">
          Tracking Code: <span className="font-semibold">{code}</span>
        </p>

        {loading && (
          <p className="mt-6 font-semibold">Loading shipment...</p>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {row && (
          <>
            <div className="grid md:grid-cols-2 gap-5 mt-8">

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Pickup</p>
                <p className="font-semibold">{row.pickup_location}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Destination</p>
                <p className="font-semibold">{row.destination_country}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Package</p>
                <p className="font-semibold">{row.package_type}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Receiver</p>
                <p className="font-semibold">{row.receiver_name}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Sender Phone</p>
                <p className="font-semibold">{maskPhone(row.sender_phone)}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Receiver Phone</p>
                <p className="font-semibold">{maskPhone(row.receiver_phone)}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Sender Email</p>
                <p className="font-semibold">{maskEmail(row.sender_email)}</p>
              </div>

              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-black/50">Receiver Email</p>
                <p className="font-semibold">{maskEmail(row.receiver_email)}</p>
              </div>

            </div>

            <ShipmentTimeline status={row.status} />

            <div className="mt-6 text-sm text-black/60">
              Shipment created: {formatDate(row.created_at)}
            </div>
          </>
        )}

      </main>

      {/* FOOTER */}

    </div>
  );
}