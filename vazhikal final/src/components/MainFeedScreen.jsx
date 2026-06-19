import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Award, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  Compass,
  User,
  Send,
  Settings,
  ChevronRight,
  Star,
  Lock,
  CheckCircle,
  PlusCircle,
  Undo
} from 'lucide-react';

export const MainFeedScreen = ({
  posts,
  packages,
  onVotePost,
  onPostSelect,
  onPackageSelect,
  onScreenChange,
  savedPostIds,
  onToggleSavePost,
  searchTerm,
  currentRole,
  onAddPost,
  onRatePackage, // Passed dynamically or handled locally in fallbacks
}) => {
  const [activeTab, setActiveTab] = useState('packages'); // packages, experiences
  
  // Dashboard states
  const [dashboardFilter, setDashboardFilter] = useState('all'); // all, saved-posts, saved-packages, agencies-contacted, edit-profile
  const [profileName, setProfileName] = useState('Sara Wanderer');
  const [profileEmail, setProfileEmail] = useState('sara@example.com');
  const [profilePassword, setProfilePassword] = useState('secret123');
  const [profileBio, setProfileBio] = useState('Lover of mountain passes, remote temple hikes, and authentic experiences.');
  const [isSavedAlert, setIsSavedAlert] = useState('');

  // Sample dynamic local ratings fallback if not registered globally
  const [localRatings, setLocalRatings] = useState({});

  const handleRate = (pkgId, rating) => {
    setLocalRatings(prev => ({
      ...prev,
      [pkgId]: rating
    }));
    if (onRatePackage) {
      onRatePackage(pkgId, rating);
    }
  };

  // Filter posts based on search AND dashboard left-side selected filter
  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dashboardFilter === 'saved-posts') {
      return matchesSearch && savedPostIds.includes(p.id);
    }
    return matchesSearch;
  });

  // Filter packages based on search AND dashboard left-side selected filter
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For demo purposes, we treat balm-adventure-valley & swiss-alps-discovery as bookmarked if dashboardFilter is active
    if (dashboardFilter === 'saved-packages') {
      return matchesSearch && (pkg.id === 'bali-wellness-discovery' || pkg.id === 'swiss-alps-discovery');
    }
    return matchesSearch;
  });

  // Handle mock sharing
  const handleShare = (title) => {
    navigator.clipboard.writeText(window.location.href);
    alert(`Successfully copied sharing link for "${title}" to clipboard!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="discover-feed-container">
      
      {/* Upper header section with "Post Trail" button on top right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4" id="feed-header-wrapper">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Explore <span className="text-emerald-600">Vazhikal</span> Trails
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-semibold mt-1">
            Browse through local itineraries, high-quality agency packages, and community reviews.
          </p>
        </div>

        {/* POST BUTTON: ON THE TOP RIGHT SIDE */}
        {currentRole === 'traveller' && (
          <button
            onClick={() => onScreenChange('create-post')}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer self-stretch sm:self-center"
            id="nav-post-experience-trail-btn"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Post Experiential Trail</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="home-layouts-split">
        
        {/* DASHBOARD ON THE LEFT SIDE */}
        <div className="lg:col-span-1 space-y-6" id="left-hand-user-dashboard-rail">
          
          {/* Dashboard Section A: User Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm" id="dashboard-user-card">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 mb-3 font-semibold">
                <User className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-800 text-sm leading-none">{profileName}</h4>
              <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-100/30 mt-2 inline-block">
                Registered Traveller
              </span>
            </div>
            
            <div className="pt-3.5 space-y-2.5 text-xs text-gray-500 font-medium">
              <p className="leading-tight text-center italic text-gray-400">
                "{profileBio}"
              </p>
              <div className="border-t border-gray-50 pt-3">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Authorized Email</span>
                <span className="font-bold text-gray-700">{profileEmail}</span>
              </div>
            </div>
          </div>

          {/* Dashboard Section B: Interactive Console Access */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-1.5" id="navigator-console-card">
            <h5 className="font-black text-[10px] text-gray-400 uppercase tracking-wider px-2 mb-2">Navigator Dashboard</h5>
            
            <button
              onClick={() => {
                setDashboardFilter('all');
                setActiveTab('packages');
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center space-x-2.5 text-xs font-bold leading-none ${
                dashboardFilter === 'all' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>All Active Feeds</span>
            </button>

            <button
              onClick={() => {
                setDashboardFilter('saved-posts');
                setActiveTab('experiences');
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center justify-between text-xs font-bold leading-none ${
                dashboardFilter === 'saved-posts' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Bookmark className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>Saved Posts</span>
              </span>
              <span className="bg-indigo-50 text-indigo-600 font-black px-1.5 py-0.5 rounded text-[10px]">
                {savedPostIds.length}
              </span>
            </button>

            <button
              onClick={() => {
                setDashboardFilter('saved-packages');
                setActiveTab('packages');
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center justify-between text-xs font-bold leading-none ${
                dashboardFilter === 'saved-packages' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Bookmark className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Saved Packages</span>
              </span>
              <span className="bg-amber-50 text-amber-600 font-black px-1.5 py-0.5 rounded text-[10px]">
                2
              </span>
            </button>

            <button
              onClick={() => {
                setDashboardFilter('edit-profile');
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center justify-between text-xs font-bold leading-none ${
                dashboardFilter === 'edit-profile' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4 shrink-0 text-gray-400" />
                <span>Edit Account Info</span>
              </span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </button>

            <button
              onClick={() => {
                setDashboardFilter('agencies-contacted');
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center justify-between text-xs font-bold leading-none ${
                dashboardFilter === 'agencies-contacted' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Send className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Agencies Contacted</span>
              </span>
              <span className="bg-emerald-50 text-emerald-600 font-black px-1.5 py-0.5 rounded text-[10px]">
                2 Active
              </span>
            </button>

          </div>

          <div className="bg-slate-900 text-slate-400 p-4 rounded-2xl border border-slate-800 text-center text-xs">
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1 animate-pulse" />
            <h6 className="font-extrabold text-white">Vazhikal Guarantee</h6>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-normal">
              100% verified agency operations licensed under federal tourism registries.
            </p>
          </div>
        </div>

        {/* RIGHT AREA WITH FEEDS OR DETAILS */}
        <div className="lg:col-span-3 space-y-6" id="right-side-feed-viewport">
          
          {/* PROFILE EDIT FORM VIEW */}
          {dashboardFilter === 'edit-profile' ? (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6" id="edit-profile-view">
              <div>
                <h3 className="text-xl font-black text-gray-950">Update Account & Credentials</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Amend secure login coordinates or travel profile biographics.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                alert('Account coordinates successfully updated and deployed to Vazhikal node!');
                setDashboardFilter('all');
              }} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Passanger Username</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Email Coordinator</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Login Secret Passcode</label>
                  <input
                    type="password"
                    required
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Passanger Short Bio</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full text-xs p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-semibold leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDashboardFilter('all')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-600"
                  >
                    Cancel Update
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                  >
                    Save Secret Credentials
                  </button>
                </div>
              </form>
            </div>
          ) : dashboardFilter === 'agencies-contacted' ? (
            /* AGENCIES CONTACTED VIEW */
            <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6" id="agencies-contacted-view">
              <div>
                <h3 className="text-xl font-black text-gray-950">Agencies Contact Coordinates</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Review active support tickets, pricing bids, and verify licenses.</p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-800">Everest Trekkers Co.</h4>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black tracking-widest uppercase px-2 py-0.5 rounded mt-1.5 inline-block border border-emerald-100">Licensed Agent</span>
                    <p className="text-xs text-gray-500 mt-2">Ticket: <span className="font-semibold text-gray-700 font-mono">#92849</span> • Query: booking availability for spring trail group.</p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Awaiting Bid</span>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-800">Alpine Escapes Ltd.</h4>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black tracking-widest uppercase px-2 py-0.5 rounded mt-1.5 inline-block border border-emerald-100">Licensed Agent</span>
                    <p className="text-xs text-gray-500 mt-2">Ticket: <span className="font-semibold text-gray-700 font-mono">#92812</span> • Query: luxury chalet upgrade rates.</p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Replied (Price Match)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDashboardFilter('all')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-extrabold text-gray-600 rounded-xl"
              >
                Return to main feed
              </button>
            </div>
          ) : (
            /* ACTIVE FEEDS (COMPASS / EXPERIENCE FEEDS) */
            <div className="space-y-6" id="feeds-wrapper-area">
              
              {dashboardFilter !== 'all' && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-semibold">
                    Dashboard view filter active: <span className="font-bold underline uppercase tracking-tight">{dashboardFilter.replace('-', ' ')}</span>
                  </span>
                  <button
                    onClick={() => setDashboardFilter('all')}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-black flex items-center gap-1"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>Clear Filter</span>
                  </button>
                </div>
              )}

              {/* Main Mode Controllers / Segmented Tabs with Priority for Agencies */}
              <div className="flex border-b border-gray-100 p-1 bg-gray-100/50 rounded-2xl" id="feed-tab-controllers">
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`flex-1 text-center py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === 'packages'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/20'
                  }`}
                  id="btn-packages-tab"
                >
                  <Award className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                  <span>Agency Packages ({filteredPackages.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('experiences')}
                  className={`flex-1 text-center py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === 'experiences'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/20'
                  }`}
                  id="btn-experiences-tab"
                >
                  <Compass className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Experience Trails ({filteredPosts.length})</span>
                </button>
              </div>

              {/* Grid Content rendering */}
              {activeTab === 'experiences' ? (
                // EXPERIENCES SECTION
                <div className="space-y-6" id="experiences-feed-list">
                  
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 text-xs">
                      No matching community experience posts found for your filter.
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const isSaved = savedPostIds.includes(post.id);
                      return (
                        <div 
                          key={post.id} 
                          className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden flex hover:shadow-md transition-all flex-col sm:flex-row"
                          id={`post-card-${post.id}`}
                        >
                          {/* Voting Sidebar Left */}
                          <div className="bg-gray-50/50 w-full sm:w-16 flex sm:flex-col items-center justify-between sm:justify-start py-3 sm:py-6 px-4 sm:px-1 border-b sm:border-b-0 sm:border-r border-gray-100" id="sidebar-votes">
                            <button
                              type="button"
                              onClick={() => onVotePost(post.id, 'up')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                post.userVote === 'up' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title="Upvote Post"
                            >
                              <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <span className="text-xs sm:text-sm font-black my-0.5 sm:my-1.5 font-mono text-gray-700">
                              {post.votes}
                            </span>
                            <button
                              type="button"
                              onClick={() => onVotePost(post.id, 'down')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                post.userVote === 'down' ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title="Downvote Post"
                            >
                              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                          </div>

                          {/* Right post contents */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              {/* Author row & location pill */}
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={post.authorAvatar}
                                    alt={post.author}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <h5 className="font-bold text-gray-800 text-sm leading-none">{post.author}</h5>
                                    <span className="text-[10px] text-gray-400 font-semibold">{post.timeAgo}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{post.location}</span>
                                </div>
                              </div>

                              {/* Post Title */}
                              <button
                                onClick={() => onPostSelect(post.id)}
                                className="text-left w-full"
                              >
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug hover:text-emerald-600 transition-colors">
                                  {post.title}
                                </h3>
                              </button>

                              <p className="text-gray-500 text-xs sm:text-sm mt-3 leading-relaxed mb-4 line-clamp-3">
                                {post.description}
                              </p>

                              {/* BENTO STYLE GRID BOX DETAIL MARGINS */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-100/30 rounded-2xl mb-4 text-xs font-medium text-gray-500">
                                {/* Cost Box */}
                                <div className="flex flex-col space-y-1">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estimated Cost</span>
                                  <span className="text-sm font-black text-emerald-700 flex items-center">
                                    {post.cost}
                                  </span>
                                </div>
                                {/* Duration Box */}
                                <div className="flex flex-col space-y-1">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Duration</span>
                                  <span className="text-sm font-bold text-gray-800 flex items-center">
                                    <Calendar className="w-4 h-4 text-emerald-600 mr-1 shrink-0" />
                                    {post.duration}
                                  </span>
                                </div>
                                {/* Highlights List Box */}
                                <div className="flex flex-col space-y-1 sm:col-span-1 col-span-2">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Top Highlights</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {post.highlights.slice(0, 2).map((hl, k) => (
                                      <span key={k} className="px-2 py-0.5 bg-white border border-gray-150 text-[10px] font-bold text-gray-600 rounded">
                                        {hl}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Cover Photo */}
                              {post.imageUrl && (
                                <div 
                                  className="relative rounded-2xl overflow-hidden cursor-pointer group mb-4"
                                  onClick={() => onPostSelect(post.id)}
                                >
                                  <img
                                    src={post.imageUrl}
                                    alt={post.imageAlt || post.title}
                                    className="w-full h-48 object-cover object-center group-hover:scale-101 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                                </div>
                              )}
                            </div>

                            {/* Bottom Action controllers */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                              <button
                                onClick={() => onPostSelect(post.id)}
                                className="text-xs font-black text-emerald-600 flex items-center space-x-1 hover:space-x-2 transition-all cursor-pointer"
                              >
                                <span>View Full Itinerary</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => onPostSelect(post.id)}
                                  className="flex items-center space-x-1 px-2.5 py-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 text-xs font-semibold"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{post.commentsCount}</span>
                                </button>
                                <button
                                  onClick={() => handleShare(post.title)}
                                  className="p-1 px-2 hover:bg-gray-50 rounded text-gray-400 hover:text-gray-900"
                                  title="Share Post link"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onToggleSavePost(post.id)}
                                  className={`p-1.5 rounded-lg hover:bg-gray-50 ${
                                    isSaved ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'
                                  }`}
                                  title={isSaved ? 'Remove Bookmark' : 'Add Bookmark'}
                                >
                                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-650 text-indigo-600' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                // PACKAGES SECTION
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="packages-grid-list">
                  {filteredPackages.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 col-span-2 bg-white border rounded-2xl text-xs">
                      No matching travel packages found for your filter selector.
                    </div>
                  ) : (
                    filteredPackages.map((pkg) => {
                      const dynamicRating = localRatings[pkg.id] || pkg.stayRating || pkg.rating || 4.8;
                      const dynamicReviews = (pkg.stayReviewsCount || pkg.reviewsCount || 12) + (localRatings[pkg.id] ? 1 : 0);

                      return (
                        <div 
                          key={pkg.id}
                          className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          id={`package-card-${pkg.id}`}
                        >
                          {/* Image & Badges */}
                          <div className="relative">
                            <img
                              src={pkg.imageUrl}
                              alt={pkg.imageAlt || pkg.title}
                              className="w-full h-44 object-cover object-center"
                              referrerPolicy="no-referrer"
                            />
                            {pkg.isVerifiedAgency && (
                              <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow flex items-center">
                                <Award className="w-3 h-3 mr-1" />
                                Licensed Agency Package
                              </span>
                            )}
                            <span className="absolute bottom-3 right-3 px-3 py-1 bg-black/75 backdrop-blur-sm text-white text-[10px] font-black rounded-full">
                              {pkg.duration}
                            </span>
                          </div>

                          {/* Info Contents */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-[10px] font-black w-fit uppercase mb-2">
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                <span>{pkg.destination}</span>
                              </div>
                              
                              <h3 className="text-base font-black text-gray-900 leading-snug hover:text-indigo-600 transition-colors mb-2.5">
                                {pkg.title}
                              </h3>

                              {/* ADD INTERACTIVE RATING SYSTEM FOR AGENCIES PACKAGES */}
                              <div className="flex items-center space-x-1 mb-3 border-y border-gray-100/50 py-1.5">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((starVal) => {
                                    const isFilled = starVal <= Math.round(dynamicRating);
                                    return (
                                      <button
                                        key={starVal}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRate(pkg.id, starVal);
                                        }}
                                        className="focus:outline-none hover:scale-110 transition-transform p-0.5"
                                        title={`Rate this tour ${starVal} Star`}
                                      >
                                        <Star className={`w-3.5 h-3.5 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                      </button>
                                    );
                                  })}
                                </div>
                                <span className="text-xs font-black text-gray-800">{dynamicRating.toFixed(1)}</span>
                                <span className="text-[10px] text-gray-400 font-semibold font-mono">({dynamicReviews} votes)</span>
                              </div>

                              <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4">
                                {pkg.description}
                              </p>
                            </div>

                            {/* Pricing row & Action */}
                            <div className="border-t border-gray-100 pt-3.5 mt-2 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Direct Agency Rate</span>
                                <span className="text-base font-black text-gray-900 font-mono">
                                  ${pkg.price} <span className="text-[10px] font-normal text-gray-500">USD</span>
                                </span>
                              </div>
                              <button
                                onClick={() => onPackageSelect(pkg.id)}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                                id={`btn-view-pkg-${pkg.id}`}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
