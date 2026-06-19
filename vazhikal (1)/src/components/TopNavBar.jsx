import React, { useState } from 'react';
import { Search, Bell, Sparkles, LogOut } from 'lucide-react';
export const TopNavBar = ({
  currentRole,
  onRoleChange,
  currentScreen,
  onScreenChange,
  onSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'traveller': return 'Traveller Mode';
      case 'agency': return 'Agency Console';
      case 'admin': return 'System Admin';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Interactive Links */}
        <div className="flex items-center space-x-6">
          <button 
            type="button"
            onClick={() => onScreenChange('feed')}
            className="flex items-center space-x-2 text-2xl font-black tracking-tight text-[#ff5a5f] hover:opacity-90 transition-opacity"
            id="header-brand-logo"
          >
            <span>Vazhikal</span>
          </button>
          
          <nav className="hidden md:flex items-center space-x-1" id="desktop-nav-links">
            <button
              onClick={() => { onScreenChange('feed'); }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentScreen === 'feed'
                  ? 'text-[#ff5a5f] bg-[#ff5a5f]/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => onScreenChange('ai-search')}
              className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-1.5 transition-colors ${
                currentScreen === 'ai-search'
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50/50'
              }`}
              id="nav-ai-discover-btn"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>AI Discover</span>
            </button>
          </nav>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSubmitSearch} className="flex-1 max-w-md mx-6 hidden sm:block" id="header-search-form">
          <div className="relative">
            <input
              type="text"
              placeholder="Search destinations, vibes, or agencies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-[#ff5a5f] focus:ring-offset-1 focus:bg-white transition-all"
              id="header-search-input"
            />
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" />
          </div>
        </form>

        {/* Right: Actions, Notifications, Role Badge & Log Out */}
        <div className="flex items-center space-x-3" id="header-actions-group">
          {/* Read-Only Current Role Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-150 rounded-full text-xs font-bold text-gray-600" id="current-role-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{getRoleLabel(currentRole)}</span>
          </div>

          {/* Interactive Sparkles Button for Mobile */}
          <button
            onClick={() => onScreenChange('ai-search')}
            className={`sm:hidden p-2 rounded-full transition-colors ${
              currentScreen === 'ai-search' ? 'bg-amber-100 text-amber-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="AI Search"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </button>

          {/* Notification Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
            id="header-notification-btn"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff5a5f] rounded-full ring-2 ring-white"></span>
          </button>

          {/* Explicit Logout Button */}
          <button
            onClick={() => onScreenChange('onboarding')}
            className="flex items-center space-x-1.5 pl-3 pr-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs sm:text-sm font-black rounded-full transition-colors border border-red-150/40"
            id="header-logout-btn"
            title="Log Out of current session"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="font-extrabold">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
