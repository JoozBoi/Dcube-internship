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
  Compass
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
}) => {
  const [activeTab, setActiveTab] = useState('experiences');

  // Filter lists based on Top Nav search input query
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPackages = packages.filter(pkg => 
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.agencyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle mock sharing
  const handleShare = (title) => {
    navigator.clipboard.writeText(window.location.href);
    alert(`Successfully copied sharing link for "${title}" to clipboard!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="discover-feed-container">
      
      {/* Dynamic Header Prompt for AI generation */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-[#ff5a5f]/10 p-6 rounded-3xl border border-teal-100 flex flex-col md:flex-row items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-800 text-base">Feeling Uninspired? Explore Custom Trails</h4>
            <p className="text-sm text-gray-500 font-medium">Use our customized server-side GenAI planner to map your dream destinations.</p>
          </div>
        </div>
        <button
          onClick={() => onScreenChange('ai-search')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl flex items-center space-x-2 shadow hover:shadow-md transition-all active:scale-95"
          id="cta-jump-ai-discover"
        >
          <span>Ask Gemini AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Mode Controllers / Segmented Tabs */}
      <div className="flex border-b border-gray-100 mb-8 p-1 bg-gray-50 rounded-2xl" id="feed-tab-controllers">
        <button
          onClick={() => setActiveTab('experiences')}
          className={`flex-1 text-center py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'experiences'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          id="btn-experiences-tab"
        >
          <Compass className="w-4.5 h-4.5 text-[#ff5a5f]" />
          <span>Experience Trails ({filteredPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 text-center py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'packages'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          id="btn-packages-tab"
        >
          <Award className="w-4.5 h-4.5 text-indigo-500" />
          <span>Agency Packages ({filteredPackages.length})</span>
        </button>
      </div>

      {/* Grid Content rendering */}
      {activeTab === 'experiences' ? (
        // EXPERIENCES SECTION
        <div className="space-y-8" id="experiences-feed-list">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No matching community experience posts found.
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isSaved = savedPostIds.includes(post.id);
              return (
                <div 
                  key={post.id} 
                  className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex hover:shadow-md transition-all"
                  id={`post-card-${post.id}`}
                >
                  {/* Voting Sidebar Left */}
                  <div className="bg-gray-50/50 w-14 sm:w-16 flex flex-col items-center py-6 px-1 border-r border-gray-50/70" id="sidebar-votes">
                    <button
                      type="button"
                      onClick={() => onVotePost(post.id, 'up')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        post.userVote === 'up' ? 'bg-[#ff5a5f]/15 text-[#ff5a5f]' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title="Upvote Post"
                    >
                      <ChevronUp className="w-6 h-6" />
                    </button>
                    <span className={`text-sm font-black my-1.5 font-mono ${
                      post.votes > 300 
                        ? 'text-coral-500 font-extrabold text-[#ff5a5f]' 
                        : 'text-gray-700'
                    }`}>
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
                      <ChevronDown className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Right post contents */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
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
                            <span className="text-xs text-gray-400 font-medium">{post.timeAgo}</span>
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
                        className="text-left"
                      >
                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-snug hover:text-[#ff5a5f] transition-colors">
                          {post.title}
                        </h3>
                      </button>

                      <p className="text-gray-500 text-sm mt-3.5 leading-relaxed truncate-3-lines mb-6">
                        {post.description}
                      </p>

                      {/* BENTO STYLE GRID BOX DETAIL MARGINS */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-100/30 rounded-2xl mb-6 text-xs font-medium text-gray-500">
                        {/* Cost Box */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Estimated Cost</span>
                          <span className="text-sm font-bold text-gray-800 flex items-center">
                            <DollarSign className="w-4 h-4 text-emerald-500 mr-0.5" />
                            {post.cost}
                          </span>
                        </div>
                        {/* Duration Box */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Duration</span>
                          <span className="text-sm font-bold text-gray-800 flex items-center">
                            <Calendar className="w-4 h-4 text-[#ff5a5f] mr-1" />
                            {post.duration}
                          </span>
                        </div>
                        {/* Highlights List Box */}
                        <div className="flex flex-col space-y-1.5 sm:col-span-1">
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Top Highlights</span>
                          <div className="flex flex-wrap gap-1">
                            {post.highlights.slice(0, 2).map((hl, k) => (
                              <span key={k} className="px-2 py-0.5 bg-white border border-gray-100 text-[10px] font-bold text-gray-600 rounded">
                                {hl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cover Photo */}
                      <div 
                        className="relative rounded-2xl overflow-hidden cursor-pointer group mb-6"
                        onClick={() => onPostSelect(post.id)}
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.imageAlt}
                          className="w-full h-64 object-cover object-center group-hover:scale-101 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                      </div>
                    </div>

                    {/* Bottom Action controllers */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                      <button
                        onClick={() => onPostSelect(post.id)}
                        className="text-xs font-black text-[#ff5a5f] flex items-center space-x-1 hover:space-x-2 transition-all"
                      >
                        <span>Analyze Details & Full Itinerary</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => onPostSelect(post.id)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 text-xs font-semibold"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.commentsCount} Comments</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.title)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                          title="Share post Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleSavePost(post.id)}
                          className={`p-1.5 rounded-lg hover:bg-gray-50 ${
                            isSaved ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'
                          }`}
                          title={isSaved ? 'Remove Bookmark' : 'Add Bookmark'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
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
            <div className="text-center py-12 text-gray-400 col-span-2">
              No matching travel packages found.
            </div>
          ) : (
            filteredPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                id={`package-card-${pkg.id}`}
              >
                {/* Image & Badges */}
                <div className="relative">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.imageAlt}
                    className="w-full h-48 object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  {pkg.isVerifiedAgency && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full shadow flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1 text-yellow-100 animate-spin-slow" />
                      Verified Agency Package
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-3 py-1 bg-black/75 backdrop-blur-sm text-white text-xs font-black rounded-full">
                    {pkg.duration}
                  </span>
                </div>

                {/* Info Contents */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{pkg.destination}</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 leading-snug tracking-tight hover:text-indigo-600 transition-colors mb-3">
                      {pkg.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing row & Action */}
                  <div className="border-t border-gray-50 pt-4 mt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Starting From</span>
                      <span className="text-xl font-black text-gray-900 font-mono">
                        ${pkg.price} <span className="text-xs font-normal text-gray-500">USD</span>
                      </span>
                    </div>
                    <button
                      onClick={() => onPackageSelect(pkg.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                      id={`btn-view-pkg-${pkg.id}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
