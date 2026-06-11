import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PropertyGrid from "./components/PropertyGrid";
import PropertyDetail from "./components/PropertyDetail";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import AuthModal from "./components/AuthModal";
import { User, Property, Lead, Booking, Payment, Invoice, Complaint, HousekeepingTask, NotificationLog, Expense } from "./types";
import { PRESET_USERS, INITIAL_PROPERTIES } from "./data/mockData";
import { Sparkles, Phone, ShieldCheck, HeartHandshake, Map, ArrowRight, ChevronDown, Check, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Global Session state
  const [user, setUser] = useState<User | null>(PRESET_USERS[0]); // Default login as Admin Aditya for smooth preview immediately!
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Core business collections
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [referralCodes, setReferralCodes] = useState<any[]>([]);
  const [referralConversions, setReferralConversions] = useState<any[]>([]);

  // Navigation state (e.g. "explore", "customer-dashboard", "admin-dashboard", "crm-pipeline", "staff-tasks")
  const [activeTab, setActiveTab] = useState<string>("explore");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(INITIAL_PROPERTIES[0] || null);

  // FAQ collapse flags
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Secure PMS Admin and Tenant lock system
  const [pmsUnlocked, setPmsUnlocked] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [lockError, setLockError] = useState<string>("");

  // API Sync Loading states
  const [loading, setLoading] = useState(true);

  // Sync state with back-end Express API routes
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProp, resLeads, resBook, resPay, resInv, resComp, resHk, resNot, resExp, resRev, resRC, resConv] = await Promise.all([
        fetch("/api/properties").then((r) => r.json()),
        fetch("/api/leads").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/payments").then((r) => r.json()),
        fetch("/api/invoices").then((r) => r.json()),
        fetch("/api/complaints").then((r) => r.json()),
        fetch("/api/housekeeping").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
        fetch("/api/expenses").then((r) => r.json()),
        fetch("/api/reviews").then((r) => r.json()),
        fetch("/api/referrals/codes").then((r) => r.json()),
        fetch("/api/referrals/conversions").then((r) => r.json()),
      ]);

      setProperties(resProp && resProp.length > 0 ? resProp : INITIAL_PROPERTIES);
      setSelectedProperty(resProp && resProp.length > 0 ? resProp[0] : INITIAL_PROPERTIES[0]);
      setLeads(resLeads || []);
      setBookings(resBook || []);
      setPayments(resPay || []);
      setInvoices(resInv || []);
      setComplaints(resComp || []);
      setHousekeeping(resHk || []);
      setNotifications(resNot || []);
      setExpenses(resExp || []);
      setReviews(resRev || []);
      setReferralCodes(resRC || []);
      setReferralConversions(resConv || []);
    } catch (e) {
      console.error("API Fetch dropped, utilizing initial static structures: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API Call Triggers
  const handleLogin = (selectedUser: User) => {
    setUser(selectedUser);
    if (selectedUser.role === "Admin") {
      setActiveTab("admin-dashboard");
    } else if (selectedUser.role === "Tenant" || selectedUser.role === "Guest") {
      setActiveTab("customer-dashboard");
    } else if (selectedUser.role === "Housekeeping") {
      setActiveTab("staff-tasks");
    } else {
      setActiveTab("explore");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("explore");
    setSelectedProperty(null);
  };

  const handleAddProperty = async (payload: any) => {
    try {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to add property", e);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await fetch(`/api/properties/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      console.error("Failed to delete property", e);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string, notes?: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to update lead status", e);
    }
  };

  const handleGenerateMonthlyRent = async () => {
    try {
      await fetch("/api/invoices/generate-monthly", { method: "POST" });
      await fetchData();
    } catch (e) {
      console.error("Failed to generate rent", e);
    }
  };

  const handleUpdateComplaintStatus = async (compId: string, status: string, assignedTo?: string) => {
    try {
      await fetch(`/api/complaints/${compId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedTo }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to update complaint status", e);
    }
  };

  const handleUpdateHousekeeping = async (taskId: string, status: string, notes?: string) => {
    try {
      await fetch(`/api/housekeeping/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to update housekeeping", e);
    }
  };

  const handleAddHousekeepingTask = async (task: any) => {
    try {
      await fetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to add housekeeping tasks", e);
    }
  };

  const handleAddBooking = async (payload: any) => {
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to create booking", e);
    }
  };

  const handleAddLead = async (payload: any) => {
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to add leads", e);
    }
  };

  const handlePayInvoice = async (invoiceId: string, amount: number, method: string) => {
    try {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: user?.id || "usr-tenant-1",
          tenantName: user?.name || "Rahul Verma",
          amount,
          type: "Rent",
          method,
          invoiceId,
        }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to pay invoices", e);
    }
  };

  const handleRaiseComplaint = async (payload: any) => {
    try {
      await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to raise complaints", e);
    }
  };

  const handlePostComment = async (id: string, authorName: string, text: string) => {
    try {
      await fetch(`/api/complaints/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, authorRole: user?.role || "Tenant", text }),
      });
      await fetchData();
    } catch (e) {
       console.error("Failed to write comment log", e);
    }
  };

  const handleUploadDoc = (field: string, filename: string) => {
     if (user) {
       setUser((prev) => prev ? { ...prev, [field]: filename } : null);
     }
  };

  // Testimonials list
  const TESTIMONIALS = [
    { name: "Mitesh Soni", role: "Software Engineer at EcoSpace", quote: "Spectra Elite #38 has entirely simplified my stay in HSR Layout. The fast fiber WiFi network is robust, and if anything leaks, Ramu fixes it by next afternoon. 5/5 Stars!" },
    { name: "Pooja Hegde", role: "UX Lead at manyata", quote: "I was looking for a modern, secure place in Bangalore. The biometric digital keys and secure girl-occupancy blocks make me absolute comfortable. Highly recommended coliving." }
  ];

  // FAQ lists
  const FAQS = [
    { q: "What does the monthly rent include?", a: "The rental includes high-speed fiber WiFi, common washing machine access, a spacious common kitchen workspace, 2H daily housekeeping, elevator access, 24/7 water and power backup. Note that in line with keeping costs low, there is NO gym, AC, or dining hall." },
    { q: "Is parking space available at Spectra Elite #38?", a: "We provide dedicated TWO WHEELER parking only. There is NO four-wheeler/car parking space available on-site in order to optimize spacing layout." },
    { q: "What room configurations are available?", a: "We offer premium Single and Double sharing rooms. There are strictly NO triple sharing options at Spectra Elite #38 in order to prevent onboarding overcrowding." },
    { q: "How does the Bed-Block Token reservation work?", a: "You can reserve/block your favorite bed instantly by paying a ₹2,050 token (₹2,000 adjusted). This ₹2,000 amount is fully adjustable and will be credited towards your security deposit at structural check-in." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Top Banner indicating sandbox demo role */}
      <div className="bg-emerald-500 text-[#111827] text-center py-1.5 px-4 text-xs font-bold font-sans flex items-center justify-center gap-1.5">
        <Sparkles size={14} className="animate-spin" />
        <span>PREVIEWING WITH PERSISTENT BACKEND: Active sandbox role is </span>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="underline bg-[#111827] text-white px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase font-black"
        >
          {user ? user.role : "GUEST (Click to login/switch)"}
        </button>
      </div>

      <Header
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProperty(null);
        }}
      />

      <main className="flex-grow">
        
        {loading && (
          <div className="py-20 text-center font-mono text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Synchronizing business ledgers & portfolios...</span>
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            
            {/* SUB-PAGE: EXPLORE PROPERTIES & WEBSITE LANDING */}
            {activeTab === "explore" && !selectedProperty && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* Visual Premium Hero Banner Section */}
                <section className="bg-[#111827] text-white py-16 md:py-24 relative overflow-hidden">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="bg-emerald-900/40 border border-[#10B981] text-[#10B981] px-3.5 py-1.5 rounded-full font-bold font-mono text-[10.5px] tracking-widest flex items-center gap-1.5">
                      <ShieldCheck size={14} /> PREMIUM LIVING REDEFINED
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black font-sans tracking-tight leading-none max-w-4xl">
                      Premium Coliving, Airbnb & <span className="text-[#10B981]">Luxury Suites</span>
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-2xl font-sans font-medium">
                      Live close to your workspace, experience daily home-cooked culinary culinary setups, and manage bills instantly on your premium digital ledger.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 font-semibold text-xs text-[#111827] pt-2">
                      <a
                        href="#explore-spaces-grid"
                        className="bg-[#10B981] hover:bg-emerald-500 px-5 py-3 rounded-xl transition-all font-bold block"
                      >
                        Explore Elite Spaces
                      </a>
                      <button
                        onClick={() => setAuthModalOpen(true)}
                        className="bg-slate-800 text-slate-200 hover:text-white px-5 py-3 rounded-xl transition-all font-bold border border-slate-700 block"
                      >
                        Select Simulator Roles
                      </button>
                    </div>
                  </div>
                  {/* Backdrop lights details */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
                </section>

                {/* Core Search & Listings grid */}
                <div id="explore-spaces-grid" className="scroll-mt-16">
                  <PropertyGrid
                    properties={properties}
                    onSelectProperty={(prop) => setSelectedProperty(prop)}
                    onBookVisit={(prop) => {
                      setSelectedProperty(prop);
                      setTimeout(() => {
                        const target = document.getElementById("global-property-search");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }, 200);
                    }}
                  />
                </div>

                {/* Testimonials */}
                <section className="bg-slate-100 py-12 border-y">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
                    <span className="text-xs text-emerald-600 font-mono tracking-widest uppercase font-bold">Trusted by tech professionals</span>
                    <h3 className="text-2xl font-bold text-slate-900 font-sans">Resident Stories</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans">
                      {TESTIMONIALS.map((t, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-xs border text-left flex flex-col justify-between">
                          <p className="text-slate-600 italic text-xs leading-relaxed">"{t.quote}"</p>
                          <div className="mt-4 flex items-center gap-2.5">
                            <span className="p-2 bg-[#10B981] text-white rounded font-mono font-bold text-[10px]">SE</span>
                            <div className="text-xs">
                              <p className="font-extrabold text-slate-900">{t.name}</p>
                              <p className="text-slate-400 text-[10.5px]">{t.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Frequently asked FAQs */}
                <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">
                  <h3 className="text-2xl font-bold text-center text-slate-900 font-sans">Help & FAQs</h3>
                  <div className="space-y-3 font-sans text-xs">
                    {FAQS.map((faq, idx) => (
                      <div key={idx} className="bg-white border rounded-xl overflow-hidden shadow-xs">
                        <button
                          onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                          className="w-full p-4 text-left font-bold text-slate-950 flex justify-between items-center bg-slate-50"
                        >
                          <span>{faq.q}</span>
                          <span className="text-[#10B981] font-bold text-sm">
                            {activeFaq === idx ? "−" : "＋"}
                          </span>
                        </button>
                        {activeFaq === idx && (
                          <div className="p-4 border-t leading-relaxed text-slate-600">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

              </motion.div>
            )}

            {/* SUB-PAGE: PROPERTY DETAIL SCREEN OVERRIDE */}
            {selectedProperty && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <PropertyDetail
                  property={selectedProperty}
                  user={user}
                  onBack={() => setSelectedProperty(null)}
                  onAddBooking={handleAddBooking}
                  onAddLead={handleAddLead}
                  reviews={reviews}
                  fetchData={fetchData}
                />
              </motion.div>
            )}

            {/* GLOBAL SECURE LOCK PAGE SYSTEM */}
            {!pmsUnlocked && ["customer-dashboard", "admin-dashboard", "crm-pipeline"].includes(activeTab) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto my-12"
              >
                <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-8 space-y-6 text-center font-sans">
                  {/* Lock Screen Header */}
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 border border-slate-750 animate-pulse">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-extrabold text-white font-mono tracking-tight">SYSTEM ACCESS LOCKED</h3>
                    <p className="text-xs text-slate-400 font-sans max-w-xs leading-normal">
                      Security protocol active for Spectra Elite #38. Unauthorized access is strictly logged.
                    </p>
                  </div>

                  {/* Digital PIN Code Display */}
                  <div className="space-y-1">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center tracking-widest text-2xl font-mono text-emerald-400 font-black h-16">
                      {enteredPin.split("").map((_char, index) => (
                        <span key={index} className="mx-1">•</span>
                      ))}
                      {enteredPin === "" && <span className="text-slate-600 text-sm font-normal">ENTER 4-DIGIT PIN</span>}
                    </div>
                    {lockError && (
                      <p className="text-rose-400 text-[11px] font-mono font-bold">{lockError}</p>
                    )}
                  </div>

                  {/* Tactile Numerical Keypad Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setLockError("");
                          if (enteredPin.length < 4) setEnteredPin(prev => prev + num);
                        }}
                        className="py-3.5 bg-slate-850 hover:bg-slate-750 text-white font-mono font-extrabold text-lg rounded-xl border border-slate-750 active:scale-95 transition-all"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setEnteredPin("");
                        setLockError("");
                      }}
                      className="py-3.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-bold text-xs rounded-xl border border-rose-900/65 active:scale-95 transition-all text-center uppercase"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLockError("");
                        if (enteredPin.length < 4) setEnteredPin(prev => prev + "0");
                      }}
                      className="py-3.5 bg-slate-850 hover:bg-slate-755 text-white font-mono font-extrabold text-lg rounded-xl border border-slate-755 active:scale-95 transition-all"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (enteredPin === "3838") {
                          setPmsUnlocked(true);
                          setLockError("");
                        } else {
                          setLockError("ACCESS DENIED: INVALID KEYCODE");
                          setEnteredPin("");
                        }
                      }}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-extrabold text-xs rounded-xl border border-emerald-500 active:scale-95 transition-all uppercase"
                    >
                      Verify
                    </button>
                  </div>

                  {/* Custom help hint footer */}
                  <div className="text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 text-[11px] font-sans">
                    <p className="text-emerald-400 font-bold font-mono">💡 Physical Security Notice</p>
                    <p className="text-slate-400 leading-normal">
                      The default digital security passkey for access to Spectra Elite #38 systems is <b className="text-[#10B981] font-mono">3838</b>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("explore")}
                    className="text-xs text-slate-500 hover:text-slate-300 underline block mx-auto font-mono"
                  >
                    ← Return to Residence Portal
                  </button>
                </div>
              </motion.div>
            )}

            {/* SUB-PAGE: TENANT GUEST DASHBOARD PORTAL */}
            {activeTab === "customer-dashboard" && pmsUnlocked && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CustomerDashboard
                  user={user}
                  bookings={bookings}
                  invoices={invoices}
                  complaints={complaints}
                  onPayInvoice={handlePayInvoice}
                  onRaiseComplaint={handleRaiseComplaint}
                  onAddComment={handlePostComment}
                  onUploadDoc={handleUploadDoc}
                  reviews={reviews}
                  referralCodes={referralCodes}
                  referralConversions={referralConversions}
                  fetchData={fetchData}
                />
              </motion.div>
            )}

            {/* SUB-PAGE: PROPERTY MANAGEMENT CMS & CRM OVERVIEW */}
            {(activeTab === "admin-dashboard" || activeTab === "crm-pipeline") && pmsUnlocked && user?.role === "Admin" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AdminDashboard
                  user={user}
                  properties={properties}
                  leads={leads}
                  bookings={bookings}
                  payments={payments}
                  invoices={invoices}
                  complaints={complaints}
                  housekeeping={housekeeping}
                  expenses={expenses}
                  notifications={notifications}
                  onAddProperty={handleAddProperty}
                  onDeleteProperty={handleDeleteProperty}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onGenerateMonthlyRent={handleGenerateMonthlyRent}
                  onUpdateComplaintStatus={handleUpdateComplaintStatus}
                  onUpdateHousekeeping={handleUpdateHousekeeping}
                  onAddHousekeepingTask={handleAddHousekeepingTask}
                  reviews={reviews}
                  referralCodes={referralCodes}
                  referralConversions={referralConversions}
                  fetchData={fetchData}
                  onAddLead={handleAddLead}
                  parentActiveTab={activeTab}
                />
              </motion.div>
            )}

            {/* SUB-PAGE: FIELD HOUSEKEEPING DUTIES ROSTER */}
            {activeTab === "staff-tasks" && user?.role === "Housekeeping" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StaffDashboard
                  user={user}
                  housekeeping={housekeeping}
                  onUpdateHousekeeping={handleUpdateHousekeeping}
                />
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      {/* STICKY BOTTOM NAVIGATION BAR FOR MOBILE / HANDHELDS */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] text-white border-t border-slate-800 p-3 flex justify-around items-center z-30 shadow-lg font-mono text-[10px] uppercase tracking-wider font-extrabold">
        <button
          onClick={() => { setActiveTab("explore"); setSelectedProperty(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === "explore" ? "text-[#10B981]" : "text-slate-400"}`}
        >
          <span>Explore</span>
        </button>
        <button
          onClick={() => {
            if (!user) {
              setAuthModalOpen(true);
            } else {
              if (user.role === "Admin") setActiveTab("admin-dashboard");
              else if (user.role === "Housekeeping") setActiveTab("staff-tasks");
              else setActiveTab("customer-dashboard");
            }
          }}
          className="flex flex-col items-center gap-1 text-[#10B981] bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          <span>Dashboard</span>
        </button>
        <a
          href="https://wa.me/919000120002"
          target="_blank"
          referrerPolicy="no-referrer"
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <span>WhatsApp Help</span>
        </a>
      </div>

      <Footer />

      {/* AUTH CONTROLS MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />

    </div>
  );
}
