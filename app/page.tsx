'use client';

import Image from 'next/image';
import { Phone, MessageCircle, Mail, Truck, Package, Lock, FileText, ArrowRight, Plane } from 'lucide-react';
import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";


export default function Home() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/+2349048236914/', '_blank');
  };

  const handleQuote = () => {
    console.log('Get Quote clicked');
  };

  return (
    <main className="w-full overflow-hidden bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-teal/10" style={{ backgroundColor: '#F2EFE6' }}>
        <div className="max-w-7xl mx-auto px-2 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-64 h-64 rounded-xl flex items-center justify-center">
              <Image
                src="/janvi-logo.png"
                alt="JANVI XPRESS Logo"
                width={300}
                height={100}
                className="w-full h-full object-contain p-1"
              />
            </div>
          
          </div>

          <div className="flex items-center gap-4">

            {/* ✅ NEW: Track Shipment button */}
            <Link href="/track">
              <button
                className="hidden md:inline-flex px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ border: '1.5px solid #1F7A8C', color: '#1F7A8C', backgroundColor: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F2EFE6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Track Shipment
              </button>
            </Link>

            <Link href="/quote">
              <button
                onClick={handleQuote}
                className="hidden md:inline-flex px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ backgroundColor: '#1F7A8C', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#165966';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1F7A8C';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get a Quote
              </button>
            </Link>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ border: '1.5px solid #1F7A8C', color: '#1F7A8C', backgroundColor: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F2EFE6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-4 pb-14 md:pt-1 md:pb-20 overflow-hidden" style={{ backgroundColor: '#F2EFE6' }}>
        <div className="absolute inset-0 opacity-30 hidden md:block">
          <Image
            src="/hero-cargo.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
            loading="eager"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(242, 239, 230, 0.95) 0%, rgba(242, 239, 230, 0.9) 100%)' }} />
        </div>

        <div className="absolute inset-0 opacity-40 block md:hidden">
          <Image
            src="/hero-mobile.jpg"
            alt="Background Mobile"
            fill
            className="object-cover"
            priority
            loading="eager"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(242, 239, 230, 0.92) 0%, rgba(242, 239, 230, 0.88) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: '#111827' }}>
                Fast & Reliable Air Cargo Logistics
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-8" style={{ color: '#4B5563' }}>
                Nigeria to UK, USA & Europe
              </p>
              <p className="text-base md:text-lg leading-relaxed mb-10" style={{ color: '#666666' }}>
                Trusted by individuals and small businesses for secure, door-to-door air freight services with smooth customs clearance and transparent communication.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/quote">
                  <button
                    onClick={handleQuote}
                    className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 md:hidden"
                    style={{ backgroundColor: '#1F7A8C' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#165966';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1F7A8C';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Get a Quote
                    <ArrowRight size={20} />
                  </button>
                </Link>

                {/* ✅ NEW: Track Shipment CTA (mobile + desktop) */}
                <Link href="/track">
                  <button
                    className="px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ border: '2px solid #1F7A8C', color: '#1F7A8C', backgroundColor: 'white' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(31, 122, 140, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    Track Shipment
                    <ArrowRight size={20} />
                  </button>
                </Link>

                <button
                  onClick={handleWhatsApp}
                  className="px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{ border: '2px solid #1F7A8C', color: '#1F7A8C', backgroundColor: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(31, 122, 140, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </button>
              </div>

              <p className="text-sm font-medium" style={{ color: '#1F7A8C' }}>
                ✓ Handling international shipments weekly with reliable delivery
              </p>
            </div>

            {/* Right Image */}
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl hidden md:block">
              <Image
                src="/cargo-plane.jpg"
                alt="Professional cargo logistics"
                fill
                className="object-cover"
                priority
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#1F7A8C' }}>250+</div>
              <p className="text-sm md:text-base" style={{ color: '#666666' }}>Successful Shipments</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#1F7A8C' }}>5+</div>
              <p className="text-sm md:text-base" style={{ color: '#666666' }}>Years Experience</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#1F7A8C' }}>99.8%</div>
              <p className="text-sm md:text-base" style={{ color: '#666666' }}>On-Time Delivery</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#1F7A8C' }}>24/7</div>
              <p className="text-sm md:text-base" style={{ color: '#666666' }}>Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#F2EFE6' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#111827' }}>Why Choose JANVI XPRESS</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666666' }}>
              Established trust in international logistics with expertise, reliability, and customer-first service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Features List */}
            <div className="space-y-6">
              {[
                { title: 'Experience in International Shipping', desc: 'Decades of expertise handling shipments to UK, USA, and across Europe' },
                { title: 'Reliability You Can Count On', desc: 'Consistent on-time delivery with professional handling of your cargo' },
                { title: 'Clear Pricing Communication', desc: 'Transparent quotes with no hidden fees or surprise charges' },
                { title: 'Professional Handling', desc: 'Trained team ensuring your packages arrive in perfect condition' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full" style={{ backgroundColor: '#1F7A8C' }}>
                      <span style={{ color: 'white' }} className="text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: '#111827' }}>{item.title}</h3>
                    <p style={{ color: '#666666' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Image */}
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/logistics-team.jpg"
                alt="Professional logistics team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Cards Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16" style={{ color: '#111827' }}>Our Services</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Door-to-Door Pickup', desc: 'Convenient collection from your location with professional handling' },
              { icon: FileText, title: 'Customs Clearance', desc: 'Expert documentation and clearance assistance for smooth delivery' },
              { icon: Lock, title: 'Secure Packaging', desc: 'Industry-standard protective packaging for safe cargo delivery' },
              { icon: Package, title: 'Real-Time Tracking', desc: 'Live updates and consistent communication every step of the way' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="rounded-2xl p-8 transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: '#F2EFE6', border: '1px solid rgba(31, 122, 140, 0.1)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#1F7A8C' }}>
                    <Icon style={{ color: 'white' }} size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>{item.title}</h3>
                  <p style={{ color: '#666666' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#F2EFE6' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16" style={{ color: '#111827' }}>How It Works</h2>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1" style={{ backgroundColor: 'rgba(31, 122, 140, 0.2)' }} />
            
            <div className="grid md:grid-cols-5 gap-6 md:gap-4 relative z-10">
              {[
                { num: '1', title: 'Request a Quote', desc: 'Provide shipment details for an instant quote' },
                { num: '2', title: 'Pickup Scheduled', desc: 'Convenient collection at your location' },
                { num: '3', title: 'Documentation', desc: 'Expert handling of all customs requirements' },
                { num: '4', title: 'Air Shipment', desc: 'Fast international transport' },
                { num: '5', title: 'Delivered Safely', desc: 'Safe delivery to your doorstep' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl mb-6 relative z-20" style={{ backgroundColor: '#1F7A8C', color: 'white' }}>
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#111827' }}>{step.title}</h3>
                  <p className="text-sm" style={{ color: '#666666' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Contact Info */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: '#111827' }}>Get In Touch</h2>
              <p className="text-lg mb-12" style={{ color: '#666666' }}>
                We're here to help with your shipping needs. Reach out through any of these channels.
              </p>

              <div className="space-y-8">
                <a href="tel:" className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-1 group-hover:shadow-lg transition-all" style={{ backgroundColor: '#1F7A8C' }}>
                    <Phone size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#111827' }}>Phone</h3>
                    <p style={{ color: '#666666' }}>+234 (0) 9048236914</p>
                  </div>
                </a>

                <a href="https://wa.me/+2349048236914/" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-1 group-hover:shadow-lg transition-all" style={{ backgroundColor: '#1F7A8C' }}>
                    <MessageCircle size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#111827' }}>WhatsApp</h3>
                    <p style={{ color: '#666666' }}>Available 24/7 for quick responses</p>
                  </div>
                </a>

                <a href="mailto:" className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-1 group-hover:shadow-lg transition-all" style={{ backgroundColor: '#1F7A8C' }}>
                    <Mail size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#111827' }}>Email</h3>
                    <p style={{ color: '#666666' }}>janvixpress247@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/delivery-success.jpg"
                alt="Successful delivery"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#1F7A8C' }}>
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/hero-cargo.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Ship?</h2>
          <p className="text-xl mb-10 text-white/90">
            Get a quote today and experience reliable, professional logistics service
          </p>
          <Link href="/quote">
            <button
              onClick={handleQuote}
              className="px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 inline-flex items-center gap-2 bg-white"
              style={{ color: '#1F7A8C' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Your Free Quote
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12 pb-12" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div>
              <h3 className="font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>

                {/* ✅ UPDATED: Track Shipment points to /track */}
                <li>
                  <Link href="/track" className="hover:text-white transition-colors">
                    Track Shipment
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Support Portal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-white">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-white">Follow Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="https://www.linkedin.com/in/caleb-taiwo-83212a232?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="https://x.com/janvixpress?s=21&t=NvyUSSDedh2ddw87hoZGyg" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://www.facebook.com/share/1GwyMnXboR/?mibextid=wwXIfr" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="https://www.tiktok.com/@janvi.xpress?_r=1&_d=e1h9mh345gb1h7&sec_uid=MS4wLjABAAAAvAKHIXtrnQ2SJ8ophp8BEcP40JVQQ82-3m262KiH2jlxUchCRSxP909onkd7VGhX&share_author_id=7489145088426378245&sharer_language=en&source=h5_m&u_code=ejh1ac3lk4f322&ug_btm=b8727,b0&social_share_type=4&utm_source=copy&sec_user_id=MS4wLjABAAAAvAKHIXtrnQ2SJ8ophp8BEcP40JVQQ82-3m262KiH2jlxUchCRSxP909onkd7VGhX&tt_from=copy&utm_medium=ios&utm_campaign=client_share&enable_checksum=1&user_id=7489145088426378245&share_link_id=75DF2227-62A2-4622-AD18-E4E2C21B181D&share_app_id=1233" className="hover:text-white transition-colors">TikTok</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>© 2026 JANVI XPRESS. All rights reserved.</p>
            <p>Trusted logistics partner for Nigeria, UK, USA & Europe</p>
          </div>
        </div>
      </footer>
    </main>
  );
}