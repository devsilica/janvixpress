"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import Navbar from "@/components/Navbar";

function makeReferenceCode() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JX-${year}-${rand}`;
}

export default function QuotePage() {

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    setError(null);
    setSuccess(null);
    setCopied(false);
    setLoading(true);

    if (!captchaToken) {
      setError("Please complete the security verification.");
      setLoading(false);
      return;
    }

    const form = new FormData(e.currentTarget);

    const reference_code = makeReferenceCode();

    const payload = {
      full_name: String(form.get("full_name")),
      phone: String(form.get("sender_phone")),
      sender_phone: String(form.get("sender_phone")),
      sender_email: String(form.get("sender_email")),
      receiver_name: String(form.get("receiver_name")),
      receiver_phone: String(form.get("receiver_phone")),
      receiver_email: String(form.get("receiver_email") ?? ""),
      receiver_postal_code: String(form.get("receiver_postal_code")),
      receiver_address: String(form.get("receiver_address")),
      pickup_location: String(form.get("pickup_location")),
      destination_country: String(form.get("destination_country")),
      package_type: String(form.get("package_type")),
      reference_code,
      status: "Pending",
    };

    const res = await fetch("/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload,
        captchaToken
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess(reference_code);
    setLoading(false);
    (e.target as HTMLFormElement).reset();
    setCaptchaToken(null);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F2EFE6] px-4 py-16">

        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#1F7A8C]">
              Request a Shipping Quote
            </h1>

            <p className="mt-3 text-gray-600">
              Fill in your shipment details and our team will contact you shortly.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Secure form • Your information is protected
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-10">

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">

              <input
                name="full_name"
                placeholder="Full Name"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="sender_phone"
                placeholder="Sender Phone"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="sender_email"
                type="email"
                placeholder="Sender Email"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="pickup_location"
                placeholder="Pickup Location"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="destination_country"
                placeholder="Destination Country"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="package_type"
                placeholder="Package Type"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="receiver_name"
                placeholder="Receiver Name"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="receiver_phone"
                placeholder="Receiver Phone"
                required
                className="border p-3 rounded-xl"
              />

              <input
                name="receiver_email"
                type="email"
                placeholder="Receiver Email"
                className="border p-3 rounded-xl"
              />

              <input
                name="receiver_postal_code"
                placeholder="Receiver Postal Code"
                required
                className="border p-3 rounded-xl"
              />

              <textarea
                name="receiver_address"
                placeholder="Receiver Address"
                required
                rows={3}
                className="border p-3 rounded-xl md:col-span-2"
              />

              {/* CAPTCHA */}
              <div className="md:col-span-2 flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="md:col-span-2 bg-[#1F7A8C] text-white py-4 rounded-xl disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>

            </form>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 mt-4 text-center">
                {error}
              </p>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-6 text-center">

                <p className="font-semibold text-green-600">
                  Request submitted successfully
                </p>

                <div className="mt-3 text-xl font-mono font-bold">
                  {success}
                </div>

                <button
                  onClick={() => handleCopy(success)}
                  className="mt-4 bg-[#1F7A8C] text-white px-6 py-3 rounded-xl"
                >
                  {copied ? "Copied ✅" : "Copy Tracking Code"}
                </button>

              </div>
            )}

          </div>

        </div>

      </main>
    </>
  );
}