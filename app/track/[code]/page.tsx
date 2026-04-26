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
  <div className="min-h-screen bg-[#F2EFE6] flex flex-col">

    {/* HEADER */}
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F7A8C]/10 flex items-center justify-center font-bold text-[#1F7A8C]">
            JX
          </div>
          <span className="font-bold text-lg">Janvi Xpress</span>
        </div>

        <nav className="flex gap-6 text-sm text-black/70 font-medium">
          <Link href="/">Home</Link>
          <Link href="/quote">Get Quote</Link>
          <Link href="/track">Track</Link>
        </nav>

      </div>
    </header>

    {/* MAIN */}
    <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">

      {/* TITLE BLOCK */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Shipment Tracking
        </h1>

        <p className="text-black/60 mt-2">
          Tracking Code:{" "}
          <span className="font-mono font-semibold text-[#1F7A8C]">
            {code}
          </span>
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white border rounded-xl p-6">
          <p className="font-medium text-black/70">Loading shipment details...</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {row && (
        <>

          {/* STATUS HERO CARD */}
          <div className="bg-white rounded-2xl border p-8 shadow-sm mb-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs uppercase text-black/50 font-semibold">
                  Current Status
                </p>

                <h2 className="text-2xl font-bold text-[#1F7A8C] mt-1">
                  {row.status || "Pending"}
                </h2>

                <p className="text-sm text-black/60 mt-1">
                  {STATUS_HELP[row.status || "Pending"]}
                </p>
              </div>

              <div className="px-4 py-2 rounded-full text-sm font-semibold bg-[#1F7A8C]/10 text-[#1F7A8C]">
                Live Tracking
              </div>

            </div>

          </div>

          {/* INFO GRID */}
          <div className="grid md:grid-cols-2 gap-4">

            {[
              ["Pickup Location", row.pickup_location],
              ["Destination", row.destination_country],
              ["Package Type", row.package_type],
              ["Receiver", row.receiver_name],
              ["Sender Phone", maskPhone(row.sender_phone)],
              ["Receiver Phone", maskPhone(row.receiver_phone)],
              ["Sender Email", maskEmail(row.sender_email)],
              ["Receiver Email", maskEmail(row.receiver_email)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
              >
                <p className="text-xs text-black/50">{label}</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {value || "—"}
                </p>
              </div>
            ))}

          </div>

          {/* TIMELINE */}
          <div className="mt-10">
            <ShipmentTimeline status={row.status} />
          </div>

          {/* FOOT NOTE */}
          <p className="text-sm text-black/50 mt-6">
            Created: {formatDate(row.created_at)}
          </p>

        </>
      )}

    </main>
  </div>
);
