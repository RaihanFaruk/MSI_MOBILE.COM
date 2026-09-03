"use client";

import React, { useState } from "react";
import { Header } from "@/components/header/Header";
import { CategoryNav } from "@/components/header/CategoryNav";
import { Footer } from "@/components/footer/Footer";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Product Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || "Message sent successfully!");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setErrorMsg(data.message || "Failed to submit message. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again or reach us via phone.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Header />
        <CategoryNav />

        {/* Hero Banner */}
        <div className="bg-gradient-to-b from-navy-dark via-slate-900 to-navy-dark text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>We Are Here to Help 7 Days a Week</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Get in Touch with Our Tech Team
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Have questions about device specifications, warranties, or your online order? Reach out
              via our hotline, email, or send a direct message below.
            </p>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Phone Hotline</h2>
              <p className="text-xs text-slate-600 font-medium">+880 1999-MSIMOB</p>
              <p className="text-[11px] text-slate-400">+880 1711-223344 (WhatsApp)</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Email Support</h2>
              <p className="text-xs text-slate-600 font-medium">support@msimobile.com.bd</p>
              <p className="text-[11px] text-slate-400">sales@msimobile.com.bd</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Physical Store</h2>
              <p className="text-xs text-slate-600 font-medium">Shop #402, Level 4, Block B</p>
              <p className="text-[11px] text-slate-400">Jamuna Future Park, Kuril, Dhaka</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Store Hours</h2>
              <p className="text-xs text-slate-600 font-medium">10:00 AM - 9:00 PM</p>
              <p className="text-[11px] text-slate-400">Online Delivery: 24/7 Active</p>
            </div>
          </div>
        </div>

        {/* Main Section: Form & Map */}
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  Send a Message
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  How can we assist you today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Fill out the form below and our customer care team will respond within 2-4 hours.
                </p>
              </div>

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      aria-label="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanvir Hasan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      aria-label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tanvir@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      aria-label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      aria-label="Message Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Product Inquiry">Product Inquiry & Specs</option>
                      <option value="Order Tracking">Order Tracking Status</option>
                      <option value="Warranty Claim">Official Warranty & Repair</option>
                      <option value="EMI Support">0% EMI Facility Query</option>
                      <option value="Corporate / Wholesale">Corporate / Bulk Purchase</option>
                      <option value="Other">Other Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    aria-label="Your Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what product or order details you need help with..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark active:scale-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Store Map & Direct Help (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Google Map Embed */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs overflow-hidden space-y-3">
                <div className="flex items-center justify-between px-2 pt-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                    <span>Store Location (Jamuna Future Park)</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Open Today
                  </span>
                </div>
                <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 relative">
                  <iframe
                    title="MSI MOBILE.COM Store Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.0980922849187!2d90.42302307593673!3d23.815110686292524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c64c103a8093%3A0xd660a4f50365294a!2sJamuna%20Future%20Park!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="text-[11px] text-slate-500 px-2 pb-1">
                  📍 Ka-244, Kuril, Pragati Sarani, Dhaka-1229. Escalator/Lift available to Level 4 Block B.
                </p>
              </div>

              {/* Instant WhatsApp Support Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Need Instant Support?</h4>
                    <p className="text-xs text-emerald-100">Chat with a sales specialist on WhatsApp</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/8801711223344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-xs transition-all"
                >
                  Chat on WhatsApp (+880 1711-223344)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
