import React, { useState, useRef } from 'react';
import { ArrowLeft, UploadCloud, MapPin, DollarSign, Calendar, Sparkles, Image as ImageIcon, Plus, Trash } from 'lucide-react';

export const CreatePostScreen = ({ onAddPost, onBackToFeed }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [days, setDays] = useState('3');
  const [nights, setNights] = useState('2');
  const [highlights, setHighlights] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [dayByDay, setDayByDay] = useState([
    { day: 1, title: '', description: '', badges: '' },
    { day: 2, title: '', description: '', badges: '' },
    { day: 3, title: '', description: '', badges: '' }
  ]);

  const handleDaysChange = (newDaysStr) => {
    setDays(newDaysStr);
    const newDaysNum = parseInt(newDaysStr, 10);
    if (isNaN(newDaysNum)) return;
    
    setDayByDay(prev => {
      const updated = [...prev];
      if (updated.length < newDaysNum) {
        for (let i = updated.length + 1; i <= newDaysNum; i++) {
          updated.push({ day: i, title: '', description: '', badges: '' });
        }
      } else if (updated.length > newDaysNum) {
        return updated.slice(0, newDaysNum);
      }
      return updated;
    });
  };

  // File drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleAddMediaUrl = () => {
    if (imageUrl.trim()) {
      setMediaUrls(prev => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveMediaUrl = (index) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) {
      alert('Please fill out the Title, Location, and Description of your trail!');
      return;
    }

    // Fallback image or first image url entered
    const defaultImg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000';
    const finalImageUrl = mediaUrls[0] || imageUrl.trim() || defaultImg;
    const durationString = `${days} Days, ${nights} Nights`;
    const costString = cost.trim() ? (cost.startsWith('$') ? cost : `$${cost} USD`) : '$0 USD';

    const finalDayByDay = dayByDay.map(item => ({
      day: item.day,
      title: item.title || `Day ${item.day} Exploration`,
      description: item.description || '',
      badges: item.badges ? item.badges.split(',').map(b => b.trim()).filter(Boolean) : []
    }));

    onAddPost(title, location, description, costString, durationString, highlights, finalImageUrl, finalDayByDay);
    alert('Success! Your travel experience trail was published to the feed.');
    onBackToFeed();
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] py-12 px-4 sm:px-6" id="create-post-screen-wrapper">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100" id="create-post-container">
        
        {/* Banner/Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white relative">
          <button
            onClick={onBackToFeed}
            className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white flex items-center justify-center cursor-pointer"
            title="Go back to feed"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center pt-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" id="create-post-headline">
              Create Scenic Experience Trail
            </h1>
            <p className="mt-2 text-emerald-100 text-xs sm:text-sm font-semibold max-w-md mx-auto">
              Share details about your treks, costs, stay breakdown, and local sights. Fill in the fields below.
            </p>
          </div>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6" id="trail-post-creation-form">
          
          {/* Section A: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-gray-100 pb-2">
              1. Basic Trail Details
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Trail / Hike Title <span className="text-emerald-500">*</span>
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kyoto Golden Pavilion & Bamboo Pass Route"
                className="w-full text-sm px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Regional Location <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                  <input
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full text-sm pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Estimated Cost Rate
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full text-sm pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Stay Duration & Highlights */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-gray-100 pb-2">
              2. Timing & Highlights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Days Duration 
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                  <select
                    value={days}
                    onChange={(e) => handleDaysChange(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 21].map(d => (
                      <option key={d} value={d}>{d} Days</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Nights Duration
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                  <select
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 20].map(n => (
                      <option key={n} value={n}>{n} Nights</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Top Spot Highlights (Comma Separated)
              </label>
              <input
                type="text"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="e.g. Bamboo Walk, Golden Pavilion, Kinkaku-ji"
                className="w-full text-sm px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
              />
            </div>
          </div>

          {/* Section C: Detailed Route */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-gray-100 pb-2">
              3. Route & Description
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Trail Diary / Description <span className="text-emerald-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what spots you visited, standard travel fees, custom trail warnings, local secrets, and sensory captures..."
                className="w-full text-sm p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-semibold"
              />
            </div>
          </div>

          {/* New Section: Day-by-Day Timeline */}
          <div className="space-y-4 bg-gray-50/60 p-5 sm:p-7 rounded-2xl border border-gray-150">
            <div className="border-b border-gray-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest">
                4. Day-By-Day Curated Timeline ({days} Days)
              </h3>
              <span className="text-[10px] text-gray-400 font-extrabold normal-case leading-relaxed">
                Enter target locations and descriptions for each trail day
              </span>
            </div>

            <div className="space-y-5 mt-4">
              {dayByDay.map((dayItem) => (
                <div key={dayItem.day} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                      {dayItem.day}
                    </span>
                    <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                      Day {dayItem.day} Itinerary Stop
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                        Stop Title / Location Name <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={dayItem.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDayByDay(prev => prev.map(item => item.day === dayItem.day ? { ...item, title: val } : item));
                        }}
                        placeholder={`e.g. Ohara's Rural Charm & Moss Gardens`}
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                        Stop Tags / Badges (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={dayItem.badges}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDayByDay(prev => prev.map(item => item.day === dayItem.day ? { ...item, badges: val } : item));
                        }}
                        placeholder="e.g. Moss Hiking, Temples, Photography"
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                      Day Description / Specific Diary Entry <span className="text-emerald-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={dayItem.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDayByDay(prev => prev.map(item => item.day === dayItem.day ? { ...item, description: val } : item));
                      }}
                      placeholder={`Detail Day ${dayItem.day} route guidance, food stops, or secret panoramic highlights...`}
                      className="w-full text-xs p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-medium leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Media & Attachments */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-gray-100 pb-2">
              4. Media & Graphic Assets
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Cover Photo URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Specify a scenic web layout photo link"
                    className="w-full text-sm pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMediaUrl}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                >
                  Add Media URL
                </button>
              </div>

              {mediaUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs rounded-lg font-mono">
                      <span className="truncate max-w-[200px]">{url}</span>
                      <button type="button" onClick={() => handleRemoveMediaUrl(index)} className="text-emerald-600 hover:text-emerald-800">
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* USABILITY PATTERN: Attach local records or mock drawings */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Drag-and-Drop Image Attachments
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/60' 
                    : 'border-gray-200 hover:border-emerald-400/50 hover:bg-gray-50/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-gray-700">Drag & drop files or click to upload</p>
                <span className="text-[10px] text-gray-400 block mt-1">Upload trail pictures or maps (PNG, JPG, JPEG)</span>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-1.5" id="attachments-previews-list">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-1.5 bg-gray-50 border border-gray-150 rounded-xl text-[10px] text-gray-600 font-mono">
                      <span>{file.name}</span>
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToFeed}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-bold text-xs uppercase tracking-wider transition"
            >
              Cancel Edit
            </button>

            <button
              type="submit"
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition active:scale-[0.98] cursor-pointer"
            >
              Publish Live Trail Post
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
