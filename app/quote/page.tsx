"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

function makeReferenceCode() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JX-${year}-${rand}`;
}

export default function QuotePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      full_name: String(form.get("full_name")),
      phone: String(form.get("phone")),
      pickup_location: String(form.get("pickup_location")),
      destination_country: String(form.get("destination_country")),
      package_type: String(form.get("package_type")),
      reference_code: makeReferenceCode(),
      status: "Pending",
    };

    const { error } = await supabase
      .from("shipping_requests")
      .insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(payload.reference_code);
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <main className="min-h-screen bg-[#F2EFE6] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/janvi-removebg-preview.png"
            alt="Janvi Xpress Logo"
            width={200}
            height={80}
            priority
          />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#1F7A8C]">
            Request a Shipping Quote
          </h1>
          <p className="mt-4 text-neutral-700 max-w-2xl mx-auto">
            Fast, secure and reliable air cargo from Nigeria to the UK, USA & Europe.
            Submit your shipment details and our team will contact you shortly.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-neutral-200">
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">

            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-neutral-900">
                Full Name *
              </label>
              <input
                name="full_name"
                required
                className="w-full border border-neutral-300 rounded-xl p-3 text-neutral-900 bg-white focus:ring-2 focus:ring-[#1F7A8C] outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-neutral-900">
                Phone *
              </label>
              <input
                name="phone"
                required
                className="w-full border border-neutral-300 rounded-xl p-3 text-neutral-900 bg-white focus:ring-2 focus:ring-[#1F7A8C] outline-none"
              />
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-neutral-900">
                Pickup Location *
              </label>
              <input
                name="pickup_location"
                required
                className="w-full border border-neutral-300 rounded-xl p-3 text-neutral-900 bg-white focus:ring-2 focus:ring-[#1F7A8C] outline-none"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-neutral-900">
                Destination Country *
              </label>
              <input
                name="destination_country"
                required
                className="w-full border border-neutral-300 rounded-xl p-3 text-neutral-900 bg-white focus:ring-2 focus:ring-[#1F7A8C] outline-none"
              />
            </div>

            {/* Package Type */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-neutral-900">
                Package Type *
              </label>
              <input
                name="package_type"
                required
                className="w-full border border-neutral-300 rounded-xl p-3 text-neutral-900 bg-white focus:ring-2 focus:ring-[#1F7A8C] outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1F7A8C] text-white py-4 rounded-xl font-semibold hover:bg-[#176270] transition duration-200"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-6 text-red-600 text-sm text-center">{error}</p>
          )}

          {success && (
            <div className="mt-6 bg-green-50 p-4 rounded-lg text-green-700 text-center">
              Request submitted successfully.
              <br />
              Your reference code: <strong>{success}</strong>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
