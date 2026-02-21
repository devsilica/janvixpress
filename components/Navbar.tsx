"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b border-gray-200">

      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/janvi-removebg-preview.png"
            alt="Janvi Xpress"
            width={150}
            height={50}
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8 text-sm font-medium">

          <Link
            href="/"
            className="bg-[#1F7A8C] text-white px-7 py-2 rounded-lg hover:bg-[#176270] transition"
          >
            Home
          </Link>

          <Link
            href="/track"
            className="bg-[#1F7A8C] text-white px-6 py-2 rounded-lg hover:bg-[#176270] transition"
          >
            Track Shipment
          </Link>

          <Link
            href="https://wa.me/+2349048236914/"
            className="bg-[#1F7A8C] text-white px-7 py-2 rounded-lg hover:bg-[#176270] transition"
          >
            Whatsapp
          </Link>

        </nav>

      </div>

    </header>
  );
}