"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
export const dynamic = "force-dynamic";

type ShippingRequest = {
  id: string;
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
  destination_city?: string | null;
  package_type: string | null;
  status: string | null;

  reference_code: string | null;

  created_at: string;
};

const STATUS = ["Pending", "Contacted", "Confirmed", "Dispatched", "In Transit", "Delivered"] as const;

const BRAND = {
  teal: "#1F7A8C",
  cream: "#F2EFE6",
  white: "#FFFFFF",
  ink: "#0B0F14",
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  Pending: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  Contacted: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  Confirmed: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  Dispatched: { bg: "#F3E8FF", text: "#6B21A8", dot: "#A855F7" },
  Delivered: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  "In Transit": { bg: "#E0F2FE", text: "#075985", dot: "#0284C7" },
};

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function ShellCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cls("rounded-2xl border shadow-sm", className)}
      style={{ backgroundColor: BRAND.white, borderColor: BRAND.teal + "20" }}
    >
      {children}
    </div>
  );
}

function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "shrink-0 rounded-full px-3 py-2 text-xs font-extrabold border transition",
        active ? "shadow-sm" : "opacity-90"
      )}
      style={{
        borderColor: BRAND.teal + (active ? "50" : "25"),
        backgroundColor: active ? BRAND.teal + "12" : BRAND.white,
        color: "black",
      }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || statusColors.Pending;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.dot }} />
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return iso;
  }
}

function MobileRequestCards({
  items,
  isUpdatingId,
  onUpdateStatus,
}: {
  items: ShippingRequest[];
  isUpdatingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  return (
    <div className="space-y-3 md:hidden">
      {items.map((r) => {
        const status = r.status ?? "Pending";
        const updating = isUpdatingId === r.id;

        const senderPhone = r.sender_phone ?? r.phone ?? "—";
        const senderEmail = r.sender_email ?? "—";

        const receiverName = r.receiver_name ?? "—";
        const receiverPhone = r.receiver_phone ?? "—";
        const receiverEmail = r.receiver_email ?? "—";

        const postal = r.receiver_postal_code ?? "—";

        return (
          <ShellCard key={r.id} className="p-4">
            {/* Top line */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold uppercase" style={{ color: BRAND.teal }}>
                  Tracking Code • {r.reference_code ?? "—"}
                </div>

                <div className="mt-1 text-base font-extrabold text-black truncate">
                  {r.full_name ?? "Unknown customer"}
                </div>

                <div className="mt-1 text-xs font-semibold text-black/70 truncate">
                  Receiver: {receiverName}
                </div>

                <div className="mt-1 text-xs font-semibold text-black/70 truncate">
                  Sender: {senderPhone} • {senderEmail}
                </div>
                <div className="mt-1 text-xs font-semibold text-black/70 truncate">
                  Receiver: {receiverPhone} • {receiverEmail}
                </div>
              </div>

              <div className="shrink-0">
                <StatusBadge status={status} />
              </div>
            </div>

            {/* Details row */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border px-3 py-2" style={{ borderColor: BRAND.teal + "18" }}>
                <div className="text-[11px] font-extrabold uppercase" style={{ color: BRAND.teal }}>
                  Pickup
                </div>
                <div className="mt-1 text-xs font-semibold text-black truncate">{r.pickup_location ?? "—"}</div>
              </div>

              <div className="rounded-xl border px-3 py-2" style={{ borderColor: BRAND.teal + "18" }}>
                <div className="text-[11px] font-extrabold uppercase" style={{ color: BRAND.teal }}>
                  Destination
                </div>
                <div className="mt-1 text-xs font-semibold text-black truncate">{r.destination_country ?? "—"}</div>
              </div>

              <div className="rounded-xl border px-3 py-2" style={{ borderColor: BRAND.teal + "18" }}>
                <div className="text-[11px] font-extrabold uppercase" style={{ color: BRAND.teal }}>
                  Postal Code
                </div>
                <div className="mt-1 text-xs font-semibold text-black truncate">{postal}</div>
              </div>

              <div className="rounded-xl border px-3 py-2" style={{ borderColor: BRAND.teal + "18" }}>
                <div className="text-[11px] font-extrabold uppercase" style={{ color: BRAND.teal }}>
                  Package
                </div>
                <div className="mt-1 text-xs font-semibold text-black truncate">{r.package_type ?? "—"}</div>
              </div>
            </div>

            {/* Receiver Address */}
            <div className="mt-3 rounded-xl border px-3 py-2" style={{ borderColor: BRAND.teal + "18" }}>
              <div className="text-[11px] font-extrabold uppercase" style={{ color: BRAND.teal }}>
                Receiver Address
              </div>
              <div className="mt-1 text-xs font-semibold text-black">{r.receiver_address ?? "—"}</div>
            </div>

            {/* Footer actions */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-black/70">
                {r.created_at ? `Created: ${formatDate(r.created_at)}` : ""}
              </div>

              <div className="min-w-40]">
                <select
                  value={status}
                  disabled={updating}
                  onChange={(e) => onUpdateStatus(r.id, e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-xs font-extrabold text-black outline-none disabled:opacity-60"
                  style={{
                    borderColor: BRAND.teal + "30",
                    backgroundColor: updating ? BRAND.teal + "12" : BRAND.white,
                  }}
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Waybill download (mobile) */}
            {r.reference_code && (
              <a
                href={`/api/admin/waybill/${encodeURIComponent(r.reference_code)}`}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border px-3 py-3 text-xs font-extrabold hover:opacity-90"
                style={{ borderColor: BRAND.teal + "35", backgroundColor: BRAND.white, color: "black" }}
                target="_blank"
                rel="noreferrer"
              >
                Download Waybill PDF
              </a>
            )}

            {updating && (
              <div className="mt-2 text-[11px] font-bold" style={{ color: BRAND.teal }}>
                Updating…
              </div>
            )}
          </ShellCard>
        );
      })}

      {items.length === 0 && (
        <ShellCard className="p-10 text-center">
          <div className="text-sm font-extrabold" style={{ color: BRAND.teal }}>
            No requests found
          </div>
          <div className="mt-2 text-xs font-semibold text-black/70">Try changing status filter or search.</div>
        </ShellCard>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [requests, setRequests] = useState<ShippingRequest[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [mobileFilter, setMobileFilter] = useState<string>("All");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setErr(null);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();

if (userErr || !user) {
  router.replace("/admin/login");
  return;
}

      const { data, error } = await supabase
        .from("shipping_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setErr(error.message);
        setRequests([]);
      } else {
        setRequests((data ?? []) as ShippingRequest[]);
      }

      setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const effectiveFilter = useMemo(() => {
    return mobileFilter !== "All" ? mobileFilter : filter;
  }, [mobileFilter, filter]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return requests.filter((r) => {
      const status = r.status ?? "Pending";
      const okStatus = effectiveFilter === "All" ? true : status === effectiveFilter;

      const senderPhone = (r.sender_phone ?? r.phone ?? "").toLowerCase();
      const receiverPhone = (r.receiver_phone ?? "").toLowerCase();
      const receiverPostal = (r.receiver_postal_code ?? "").toLowerCase();
      const receiverAddress = (r.receiver_address ?? "").toLowerCase();

      const senderEmail = (r.sender_email ?? "").toLowerCase();
      const receiverEmail = (r.receiver_email ?? "").toLowerCase();
      const receiverName = (r.receiver_name ?? "").toLowerCase();

      const okQ =
        !query ||
        (r.full_name ?? "").toLowerCase().includes(query) ||
        receiverName.includes(query) ||
        senderPhone.includes(query) ||
        senderEmail.includes(query) ||
        receiverPhone.includes(query) ||
        receiverEmail.includes(query) ||
        receiverPostal.includes(query) ||
        receiverAddress.includes(query) ||
        (r.reference_code ?? "").toLowerCase().includes(query) ||
        (r.destination_country ?? "").toLowerCase().includes(query);

      return okStatus && okQ;
    });
  }, [requests, q, effectiveFilter]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => (r.status ?? "Pending") === "Pending").length;
    const contacted = requests.filter((r) => (r.status ?? "Pending") === "Contacted").length;
    const completed = requests.filter((r) => (r.status ?? "Pending") === "Delivered").length;
    return { total, pending, contacted, completed };
  }, [requests]);

  async function updateStatus(id: string, status: string) {
    setIsUpdating(id);

    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    const { error } = await supabase.from("shipping_requests").update({ status }).eq("id", id);

    if (error) {
      setErr(error.message);

      const { data } = await supabase
        .from("shipping_requests")
        .select("*")
        .order("created_at", { ascending: false });

      setRequests((data ?? []) as ShippingRequest[]);
    }

    setIsUpdating(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen text-black" style={{ backgroundColor: BRAND.cream }}>
      {/* Compact Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: BRAND.white, borderBottomColor: BRAND.teal + "20" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                Janvi Admin
              </div>
              <div className="text-sm font-extrabold text-black truncate">Shipping Requests</div>
            </div>

            <button
              onClick={signOut}
              className="rounded-xl px-3 py-2 text-xs font-extrabold border transition hover:opacity-90 active:opacity-80"
              style={{ borderColor: BRAND.teal + "35", color: "black", backgroundColor: BRAND.white }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Sticky mobile controls */}
        <div className="md:hidden border-t" style={{ borderTopColor: BRAND.teal + "15" }}>
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, email, tracking code..."
              className="w-full rounded-xl border px-4 py-3 text-sm font-semibold text-black placeholder:text-black/60 outline-none"
              style={{ borderColor: BRAND.teal + "30", backgroundColor: BRAND.white }}
            />

            <div className="flex gap-2 overflow-x-auto pb-1">
              <Pill active={mobileFilter === "All"} onClick={() => setMobileFilter("All")}>
                All ({stats.total})
              </Pill>
              <Pill active={mobileFilter === "Pending"} onClick={() => setMobileFilter("Pending")}>
                Pending ({stats.pending})
              </Pill>
              <Pill active={mobileFilter === "Contacted"} onClick={() => setMobileFilter("Contacted")}>
                Contacted ({stats.contacted})
              </Pill>
              <Pill active={mobileFilter === "Delivered"} onClick={() => setMobileFilter("Delivered")}>
                Delivered ({stats.completed})
              </Pill>
            </div>

            {err && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-bold text-black">
                {err}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5">
        {/* Desktop controls */}
        <div className="hidden md:block space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <ShellCard className="p-5">
              <div className="text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                Total
              </div>
              <div className="mt-1 text-3xl font-extrabold" style={{ color: BRAND.teal }}>
                {stats.total}
              </div>
            </ShellCard>
            <ShellCard className="p-5">
              <div className="text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                Pending
              </div>
              <div className="mt-1 text-3xl font-extrabold" style={{ color: "#F59E0B" }}>
                {stats.pending}
              </div>
            </ShellCard>
            <ShellCard className="p-5">
              <div className="text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                Contacted
              </div>
              <div className="mt-1 text-3xl font-extrabold" style={{ color: "#3B82F6" }}>
                {stats.contacted}
              </div>
            </ShellCard>
            <ShellCard className="p-5">
              <div className="text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                Delivered
              </div>
              <div className="mt-1 text-3xl font-extrabold" style={{ color: "#10B981" }}>
                {stats.completed}
              </div>
            </ShellCard>
          </div>

          <ShellCard className="p-4">
            <div className="grid grid-cols-[1fr_260px] gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, phones, emails, tracking code..."
                className="w-full rounded-xl border px-4 py-3 text-sm font-semibold text-black placeholder:text-black/60 outline-none"
                style={{ borderColor: BRAND.teal + "30" }}
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm font-extrabold text-black outline-none"
                style={{
                  borderColor: BRAND.teal + "30",
                  backgroundColor: BRAND.teal + "08",
                }}
              >
                <option value="All">All statuses</option>
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {err && (
              <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-bold text-black">
                {err}
              </div>
            )}
          </ShellCard>
        </div>

        {/* CONTENT */}
        {loading ? (
          <ShellCard className="p-10 text-center font-extrabold">Loading…</ShellCard>
        ) : (
          <>
            <MobileRequestCards items={filtered} isUpdatingId={isUpdating} onUpdateStatus={updateStatus} />

            {/* Desktop table */}
            <div className="hidden md:block">
              <ShellCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-black">
                    <thead style={{ backgroundColor: BRAND.teal + "10" }}>
                      <tr className="border-b" style={{ borderBottomColor: BRAND.teal + "20" }}>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Tracking Code
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Customer
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Sender Email
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Sender Phone
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Receiver Name
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Receiver Phone
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Receiver Email
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Postal Code
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Receiver Address
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Destination
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Update
                        </th>
                        {/* Waybill column */}
                        <th className="px-6 py-4 text-xs font-extrabold uppercase" style={{ color: BRAND.teal }}>
                          Waybill
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((r) => {
                        const status = r.status ?? "Pending";
                        const updating = isUpdating === r.id;
                        const senderPhone = r.sender_phone ?? r.phone ?? "-";

                        return (
                          <tr key={r.id} className="border-b" style={{ borderBottomColor: BRAND.teal + "10" }}>
                            <td className="px-6 py-4 font-extrabold" style={{ color: BRAND.teal }}>
                              {r.reference_code ?? "-"}
                            </td>
                            <td className="px-6 py-4 font-semibold">{r.full_name ?? "-"}</td>
                            <td className="px-6 py-4 font-semibold">{r.sender_email ?? "-"}</td>
                            <td className="px-6 py-4 font-semibold">{senderPhone}</td>
                            <td className="px-6 py-4 font-semibold">{r.receiver_name ?? "-"}</td>
                            <td className="px-6 py-4 font-semibold">{r.receiver_phone ?? "-"}</td>
                            <td className="px-6 py-4 font-semibold">{r.receiver_email ?? "-"}</td>
                            <td className="px-6 py-4 font-semibold">{r.receiver_postal_code ?? "-"}</td>
                            <td className="px-6 py-4 font-semibold max-w-[360px]">
                              <div className="truncate">{r.receiver_address ?? "-"}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold">{r.destination_country ?? "-"}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={status}
                                onChange={(e) => updateStatus(r.id, e.target.value)}
                                disabled={updating}
                                className="rounded-xl border px-3 py-2 text-xs font-extrabold text-black outline-none disabled:opacity-60"
                                style={{
                                  borderColor: BRAND.teal + "30",
                                  backgroundColor: updating ? BRAND.teal + "12" : BRAND.white,
                                }}
                              >
                                {STATUS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Waybill download (desktop) */}
                            <td className="px-6 py-4">
                              {r.reference_code ? (
                                <a
                                  href={`/api/admin/waybill/${encodeURIComponent(r.reference_code)}`}
                                  className="inline-flex items-center rounded-xl border px-3 py-2 text-xs font-extrabold hover:opacity-90"
                                  style={{ borderColor: BRAND.teal + "35", backgroundColor: BRAND.white, color: "black" }}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Download PDF
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-black/60">No code</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={13} className="px-6 py-12 text-center font-extrabold" style={{ color: BRAND.teal }}>
                            No requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filtered.length > 0 && (
                  <div
                    className="px-6 py-4 text-center text-xs font-bold border-t"
                    style={{ borderTopColor: BRAND.teal + "10" }}
                  >
                    Showing {filtered.length} of {requests.length} requests
                  </div>
                )}
              </ShellCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}