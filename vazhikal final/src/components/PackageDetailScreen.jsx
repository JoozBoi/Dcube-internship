import React, { useState } from 'react';
import { ArrowLeft, Check, Star, ShieldCheck, Mail, Bookmark, Calendar, Globe, Send, CheckCircle2 } from 'lucide-react';
export const PackageDetailScreen = ({
  pkg,
  onBackToFeed,
  isSavedPkg,
  onToggleSavePkg,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [querySent, setQuerySent] = useState(false);

  const handleContactAgencySubmit = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setQuerySent(true);
    setTimeout(() => {
      // Simulate close after feedback
      setTimeout(() => {
        setIsModalOpen(false);
        setQuerySent(false);
        setUserQuery('');
      }, 2000);
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" id="package-detail-screen">
      {/* Back button */}
      <button
        onClick={onBackToFeed}
        className="mb-6 flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        id="btn-back-to-feed-pkg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery Feed</span>
      </button>

      {/* Large visual landing banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-[21/9] mb-8 border border-gray-100 bg-gray-100" id="package-hero-banner">
        <img
          src={pkg.imageUrl}
          alt={pkg.imageAlt}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
        
        {/* Info inside banner wrapper */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
          <div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded">
              Verified Agency Escapes
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2.5">
              {pkg.title}
            </h1>
            <p className="text-gray-200 text-xs sm:text-sm font-medium mt-1.5 flex items-center">
              <Globe className="w-4 h-4 mr-1 text-emerald-400" />
              <span>{pkg.destination}</span>
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20 shrink-0">
            <span className="block text-[10px] text-gray-300 font-extrabold uppercase">Travel Period</span>
            <span className="text-sm font-bold">{pkg.duration}</span>
          </div>
        </div>
      </div>

      {/* Grid Content Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="package-columns-wrapper">
        
        {/* Left Side: Overviews, Timeline, and Included Items */}
        <div className="lg:col-span-2 space-y-8" id="left-package-details">
          {/* Package narrative */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-gray-900">About the Journey</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{pkg.description}</p>
          </div>

          {/* Day By Day path snippet */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-gray-900">Daily Experiences Overview</h3>
            <div className="relative border-l border-emerald-100 pl-4 space-y-6 ml-2" id="package-day-snippet">
              {pkg.dayByDay.map((day, ix) => (
                <div key={ix} className="relative select-none">
                  {/* node visual */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-50"></div>
                  <h4 className="text-sm font-black text-gray-800">
                    Day {day.day}: {day.title}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed mt-1">{day.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert(`Showing details for all ${pkg.duration} packages`)}
              className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 text-xs font-black text-gray-700 rounded-xl transition"
              id="btn-expand-full-itinerary"
            >
              View full {pkg.dayByDay.length}-day custom itinerary
            </button>
          </div>

          {/* Bento boxes: What's included + Stay Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="package-bento-boxes">
            {/* Box 1: What's Included */}
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-md font-black text-gray-900 mb-4 tracking-tight">What\'s Included</h4>
                <ul className="space-y-3" id="package-checklists">
                  {pkg.inclusions.map((inc, index) => (
                    <li key={index} className="flex items-start text-xs text-gray-500 leading-relaxed font-semibold">
                      <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Box 2: Premium Stay details */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] px-2 py-0.5 bg-indigo-100 text-indigo-700 font-extrabold rounded uppercase tracking-wider">
                    Luxury Hotel Stay
                  </span>
                  <div className="flex items-center text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                    <span>{pkg.stayRating}</span>
                  </div>
                </div>

                <h4 className="text-base font-black text-gray-900 mb-1 leading-snug">{pkg.stayNameText}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{pkg.stayDescText}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100/30 flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>Estimated accommodation value:</span>
                <span className="font-extrabold text-gray-800">${pkg.stayValue} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar interactive booking selector */}
        <div className="lg:col-span-1" id="package-sidebar-booking">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md sticky top-20" id="sticky-booking-card">
            
            <div className="mb-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Starting Package Cost</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-3xl font-black text-gray-900 font-mono">${pkg.price}</span>
                <span className="text-sm font-semibold text-gray-400">/ person</span>
              </div>
              <p className="text-gray-400 text-[10px] mt-1 leading-relaxed">Includes all hospitality resort vouchers, taxes, and high-end transports.</p>
            </div>

            <hr className="border-gray-50 my-5" />

            {/* Corporate Agency Host Card */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-sm relative">
                {pkg.agencyName[0]}
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white">
                  <ShieldCheck className="w-3 h-3 text-yellow-101" />
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Organized By</span>
                <span className="block text-sm font-extrabold text-gray-800 truncate leading-none mt-0.5">{pkg.agencyName}</span>
                <span className="text-[10px] text-emerald-600 font-bold">100% Verified Agency License ✓</span>
              </div>
            </div>

            {/* Transaction Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98"
                id="btn-contact-booking-agency"
              >
                <Mail className="w-4.5 h-4.5" />
                <span>Contact Organizer Agency</span>
              </button>

              <button
                onClick={() => onToggleSavePkg(pkg.id)}
                className={`w-full py-3 border text-sm font-extrabold rounded-2xl flex items-center justify-center space-x-2 transition bg-white ${
                  isSavedPkg
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-500/5'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
                id="btn-toggle-bookmark-pkg"
              >
                <Bookmark className={`w-4.5 h-4.5 ${isSavedPkg ? 'fill-emerald-600' : ''}`} />
                <span>{isSavedPkg ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Booking/Contact Agency Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200" id="contact-agency-modal">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-gray-50">
            <h3 className="text-xl font-black text-gray-900 mb-2">Inquire About Package</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Ask <span className="font-bold text-gray-700">{pkg.agencyName}</span> about customization, private departures, or group discount rates.
            </p>

            {!querySent ? (
              <form onSubmit={handleContactAgencySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">What is your question?</label>
                  <textarea
                    required
                    rows={4}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="e.g. Hello, we are a family of four. Are there private dates available for September departures?..."
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:ring-offset-1 transition"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4 animate-in zoom-in duration-200">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Message submitted! The travel agency will reach out to you at your account email setup shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
