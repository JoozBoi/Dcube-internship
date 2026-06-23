import React, { useState } from 'react';
import { Sparkles, MapPin, DollarSign, Calendar, Eye, Compass, Loader2, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
export const AISearchScreen = ({
  onAddCustomAIPost,
  onPostSelect,
}) => {
  const [vibeInput, setVibeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [successSaved, setSuccessSaved] = useState(false);

  // Preset quick vibe options matching Screen 4
  const quickPresets = [
    'Kyoto Moss Gardens and Tea Ceremony',
    'Highland Alpine Hut Wanderer Trails',
    'Volcanic Costa Rica Jungle Safaris',
    'Secret Coastal Greek Island Lagoons'
  ];

  const handleSelectPreset = (preset) => {
    setVibeInput(preset);
  };

  const handleGenerateAISearch = async (e) => {
    e.preventDefault();
    if (!vibeInput.trim()) return;

    setIsLoading(true);
    setErrorText('');
    setGeneratedResult(null);
    setSuccessSaved(false);

    try {
      const response = await fetch('/api/gemini/inspire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vibe: vibeInput }),
      });

      if (!response.ok) {
        throw new Error('API server failed to generate custom itinerary details.');
      }

      const val = await response.json();
      setGeneratedResult(val);

    } catch (err) {
      console.error(err);
      setErrorText(err.message || 'Server error. Please check your config parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register AI Post to Global Feed
  const handleSaveAndShareToFeed = () => {
    if (!generatedResult) return;

    const newPost = {
      id: generatedResult.id || 'ai-post-' + Date.now(),
      author: 'Gemini Travel Curator',
      authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      timeAgo: 'Just now',
      location: generatedResult.location || 'Custom Destination',
      title: generatedResult.title || 'Curated Escape',
      description: generatedResult.description || 'Custom generated itinerary.',
      cost: generatedResult.cost || '$800 USD',
      duration: generatedResult.duration || '3 Days, 2 Nights',
      highlights: generatedResult.highlights || ['Premium Sights', 'Custom Itinerary'],
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1500', // Default gorgeous nature banner
      imageAlt: 'Scenic natural wilderness landscape',
      votes: 12,
      commentsCount: 0,
      comments: [],
      difficulty: generatedResult.difficulty || 'Easy',
      dayByDay: generatedResult.dayByDay || []
    };

    onAddCustomAIPost(newPost);
    setSuccessSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="ai-search-view">
      
      {/* Slogan & header wrapper */}
      <div className="text-center space-y-4 mb-10 p-6 bg-gradient-to-b from-[#9ff5b5]/40 to-transparent rounded-3xl" id="ai-intro-banner">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto text-amber-500 shadow-sm border border-emerald-100">
          <Sparkles className="w-8 h-8 animate-pulse text-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
          AI-Powered Travel Discovery
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto font-medium leading-relaxed">
          Unlock highly customized, secret pathways matching your specific style, or select quick presets to map global wonders.
        </p>
      </div>

      {/* Interactive Search Console */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md mb-10" id="ai-search-console">
        <form onSubmit={handleGenerateAISearch} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Where do you want to go? Tell us your vibe..."
              value={vibeInput}
              onChange={(e) => setVibeInput(e.target.value)}
              className="w-full pl-6 pr-32 py-4 border border-gray-200 rounded-2xl text-sm sm:text-base bg-gray-50/50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:ring-offset-1 transition-all font-semibold"
              id="ai-vibe-query-input"
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
              id="btn-trigger-ai-curate"
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Sparkles className="w-4.5 h-4.5 text-yellow-250 fill-yellow-200" />
              )}
              <span>{isLoading ? 'Curating...' : 'Inspire Me'}</span>
            </button>
          </div>

          {/* Quick preset vibes */}
          <div className="space-y-2">
            <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Example Vibe Prompts</span>
            <div className="flex flex-wrap gap-2" id="preset-slug-container">
              {quickPresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${
                    vibeInput === preset 
                      ? 'bg-teal-600 text-white border-teal-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* ERROR CORRECTION STATUS */}
      {errorText && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-3xl text-red-700 mb-8 max-w-md mx-auto text-center" id="ai-error-indicator">
          <p className="text-xs font-black">AI Server Error</p>
          <p className="text-xs text-red-500 mt-1">{errorText}</p>
        </div>
      )}

      {/* LOADING SHIMMER SKELETON LOADER */}
      {isLoading && (
        <div className="space-y-6 animate-pulse" id="ai-shimmer-skeleton">
          <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      )}

      {/* AI CURATION RENDER CARD */}
      {generatedResult && (
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-200" id="ai-result-panel">
          
          {/* Header element */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white relative">
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider">Server-side AI Curation</span>
            </div>

            <div className="flex items-center space-x-1 px-2.5 py-1 bg-white/20 backdrop-blur border border-white/10 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 max-w-xs">
              <MapPin className="w-3.5 h-3.5 text-yellow-300" />
              <span>{generatedResult.location}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
              {generatedResult.title}
            </h2>
            
            <p className="text-emerald-100 text-xs sm:text-sm font-medium">
              Curated specifically in response to your query preference: "{vibeInput}"
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Attribute bento ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-semibold text-gray-500">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase">Estimated Cost</span>
                <span className="text-sm font-black text-gray-800 flex items-center">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  {generatedResult.cost}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase">Duration</span>
                <span className="text-sm font-black text-gray-800 flex items-center">
                  <Calendar className="w-4 h-4 text-emerald-600 mr-1" />
                  {generatedResult.duration}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase">Difficulty Range</span>
                <span className="text-sm font-black text-indigo-700 block">
                  {generatedResult.difficulty}
                </span>
              </div>
            </div>

            {/* AI description report */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest text-emerald-600">Platform Evaluation</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{generatedResult.description}</p>
            </div>

            {/* Highlights bullet chips */}
            {generatedResult.highlights && (
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Key Spot Highlights</span>
                <div className="flex flex-wrap gap-1.5">
                  {generatedResult.highlights.map((hl, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-800 rounded-md">
                      {hl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Day By Day itinerary timeline */}
            {generatedResult.dayByDay && (
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest text-emerald-700">Detailed Day-By-Day Itinerary</h4>
                <div className="relative border-l border-emerald-100 pl-4 space-y-6 ml-1.5">
                  {generatedResult.dayByDay.map((dayObj, index) => (
                    <div key={index} className="relative select-none">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-50"></div>
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-black text-gray-900">Day {dayObj.day}: {dayObj.title}</h5>
                        <div className="flex gap-1">
                          {dayObj.badges?.map((bg, k) => (
                            <span key={k} className="px-1.5 py-0.5 bg-gray-50 text-[9px] text-gray-500 rounded uppercase">#{bg}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed mt-1">{dayObj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save & Registration action bar */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
              {!successSaved ? (
                <button
                  type="button"
                  onClick={handleSaveAndShareToFeed}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition"
                  id="btn-register-ai-itinerary"
                >
                  <Compass className="w-5 h-5 animate-spin-slow" />
                  <span>Register & Share to Community Feed</span>
                </button>
              ) : (
                <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-center justify-center space-x-2 animate-in slide-in-from-bottom duration-150">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-bold">Plan successfully published! You can now view and comment on it in the core feed.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
