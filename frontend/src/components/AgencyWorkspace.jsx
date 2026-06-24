import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Compass, 
  DollarSign, 
  Grid, 
  BarChart3, 
  Settings as SettingsIcon, 
  Calendar,
  Sparkles,
  Inbox,
  TrendingUp,
  MapPin,
  CheckCircle2,
  PlusCircle
} from 'lucide-react';
export const AgencyWorkspace = ({
  packages,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
  onCreatePostClick,
  agencyName,
}) => {



  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('inventory');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);

  // Form State for creating/editing packages
  const [formTitle, setFormTitle] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('7 Days, 6 Nights');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Feed/Form loading for edit
  const handleLoadEdit = (pkg) => {
    setEditingPkgId(pkg.id);
    setFormTitle(pkg.title);
    setFormDestination(pkg.destination);
    setFormPrice(pkg.price.toString());
    setFormDuration(pkg.duration);
    setFormDescription(pkg.description);
    setFormImageUrl(pkg.imageUrl || '');
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPkgId(null);
    setFormTitle('');
    setFormDestination('');
    setFormPrice('1500');
    setFormDuration('7 Days, 6 Nights');
    setFormDescription('');
    setFormImageUrl('');
    setIsDialogOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formDestination || !formPrice) return;

    try {
    if (editingPkgId) {
      // Find original and update
      const orig = packages.find(p => p.id === editingPkgId);
      if (orig) {
        const updated = {
          ...orig,
          title: formTitle,
          destination: formDestination,
          price: Number(formPrice),
          duration: formDuration,
          description: formDescription,
          imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000'
        };
        await onEditPackage(updated);
      }
    } else {
      // Create new
      const newPkg = {
        id: 'pkg_gen_' + Date.now(),
        title: formTitle,
        destination: formDestination,
        duration: formDuration,
        agencyName: 'Gulliver Travels Ltd. (Workspace)',
        isVerifiedAgency: true,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000',
        imageAlt: formTitle || 'Scenic tropical beach shoreline',
        price: Number(formPrice),
        description: formDescription || 'An incredible curated journey designed directly on our professional Workspace Dashboard.',
        inclusions: [
          'First-class standard accommodation passes',
          'Premium dining vouchers',
          '24/7 client assistant hotline checks'
        ],
        dayByDay: [
          {
            day: 1,
            title: 'Welcome & Resort Settlement',
            description: 'Check into the premium resort suites, collect details, and attend user introductions.',
            badges: ['Resort Stay', 'Welcomes']
          }
        ],
        stayNameText: 'Grand Sands Resort',
        stayDescText: 'World class beachfront infinity view suites.',
        stayRating: 5.0,
        stayReviewsCount: 14,
        stayValue: 650,
        status: 'active'

      };
      await onAddPackage(newPkg);
    }

    setIsDialogOpen(false);
    } catch {
      // The shared API error banner in App provides the detailed failure state.
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="agency-workspace-screen" data-agency-workspace>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="workspace-two-column-split">
        
        {/* LEFT COLUMN: Sidebar Navigation Panel (Clean Light Card context) */}
        <div className="lg:col-span-1 bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between shadow-sm h-fit" id="agency-left-sidebar">
          <div className="space-y-6">
            {/* Host Metadata */}
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-black text-xl shadow-sm border border-emerald-100">
                G
              </div>
              <h4 className="mt-3 font-extrabold text-gray-800 text-sm truncate leading-none">{agencyName || packages?.[0]?.agencyName || 'Agency Workspace'}</h4>

              <span className="text-[10px] text-gray-400 font-extrabold tracking-wide uppercase">Agency Workspace</span>

              
              {/* SHOW ACCOUNT STATS: Verification timestamp and start tracking info */}
              <div className="mt-3.5 py-2.5 px-3.5 bg-gray-50 rounded-xl text-[10px] text-left text-gray-500 font-semibold space-y-1 block border border-gray-100 leading-snug">
                <p>📍 Started: <span className="font-extrabold text-gray-800">June 15, 2026</span></p>
                <p>🛡️ Verified Code: <span className="font-extrabold text-emerald-600">VAZ-2026-98</span></p>
                <p>Status: <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] border border-emerald-100">Licensed & Active</span></p>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2" id="agency-sidemenu">
              <button
                onClick={() => setActiveWorkspaceTab('inventory')}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-3 transition-colors ${
                  activeWorkspaceTab === 'inventory'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Compass className="w-4.5 h-4.5" />
                <span>Inventory Management</span>
              </button>

              <button
                onClick={() => onCreatePostClick?.()}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-3 transition-colors ${
                  'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                }`}
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Create Post (Trail)</span>
              </button>


              <button
                onClick={() => setActiveWorkspaceTab('bookings')}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-3 transition-colors ${
                  activeWorkspaceTab === 'bookings'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Plus className="w-4.5 h-4.5 rotate-45" />
                <span>Customer Bookings</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('analytics')}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-3 transition-colors ${
                  activeWorkspaceTab === 'analytics'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4.5 h-4.5" />
                <span>Analytics Insights</span>
              </button>
            </nav>
          </div>

          {/* Floating Workspace CTA - REMOVED the redundant duplicate create list option */}
          <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center text-[10px] text-gray-400 font-semibold leading-normal font-mono">
             <span>Vazhikal Agency Control Panel v1.4</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Workspaces Panels */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between" id="agency-workspace-contents">
          
          {/* PANELS TAB 1: Inventory List */}
          {activeWorkspaceTab === 'inventory' && (
            <div className="space-y-6" id="panel-inventory">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Inventory Management</h2>
                  <p className="text-sm text-gray-400 font-medium">Manage and monitor your active travel packages in real-time.</p>
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow' flex items-center space-x-1.5 active:scale-95 transition"
                  id="btn-agency-create"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Create New Package</span>
                </button>
              </div>

              {/* Status Inventory Table */}
              <div className="overflow-x-auto border border-gray-50 rounded-2xl shadow-inner scrollbar-thin" id="inventory-data-table">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-black uppercase tracking-wider select-none">
                      <th className="py-4 px-5">Package Name</th>
                      <th className="py-4 px-5">Destination</th>
                      <th className="py-4 px-5">Price Rate</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-5 font-bold text-gray-900">{pkg.title}</td>
                        <td className="py-4 px-5">
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />
                            {pkg.destination}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold">${pkg.price} USD</td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleLoadEdit(pkg)}
                              className="p-1 px-2.5 border border-gray-100 bg-white hover:bg-gray-50 rounded text-gray-600 flex items-center space-x-1"
                              title="Edit listing details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">Edit</span>
                            </button>
                            <button
                              onClick={() => onDeletePackage(pkg.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                              title="Delete listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {packages.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                          Your active listings database is empty. Click Create above!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANELS TAB 2: Bookings (Pris-tine interactive UI) */}
          {activeWorkspaceTab === 'bookings' && (
            <div className="space-y-5" id="panel-bookings">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Customer Bookings</h2>
                <p className="text-sm text-gray-400 font-medium font-semibold">Monitor passenger requests and direct inquiries.</p>
              </div>

              <div className="border border-gray-100 rounded-2xl p-6 text-center space-y-4" id="bookings-queue-empty">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">No Pending Customer Inquiries</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mt-1">Inquiries submitted on the Package Details view will instantly register inside this queue panel.</p>
                </div>
              </div>
            </div>
          )}

          {/* PANELS TAB 3: Analytics (Nice clean graphs and metrics) */}
          {activeWorkspaceTab === 'analytics' && (
            <div className="space-y-6" id="panel-analytics">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Analytics Insights</h2>
                <p className="text-sm text-gray-400 font-medium">Explore conversion metrics, page views, and ticket indexes.</p>
              </div>

              {/* Data Cards Grid bento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="analytics-grid">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Sales Turnover</span>
                  <span className="block text-2xl font-mono font-black text-gray-900 mt-1">$42,950</span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center mt-1">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +18% from last month
                  </span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Active Views</span>
                  <span className="block text-2xl font-mono font-black text-gray-900 mt-1">11,402</span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center mt-1">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +24% from last week
                  </span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Verified Badges</span>
                  <span className="block text-sm font-semibold text-emerald-600 mt-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1 shrink-0" />
                    Status: Certified ✓
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE PACKAGE OVERLAY Modal Dialog FOR WORKSPACE */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200" id="agency-creation-dialog">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {editingPkgId ? 'Edit Package Listing' : 'List New Travel Package'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Create gorgeous premium packages matching dynamic templates to be instantly rendered in the marketplace search pools.
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-4" id="pkg-editor-form">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Package Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 5-Day Alpine Chalet Getaway"
                  id="form-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Destination Spot</label>
                  <input
                    type="text"
                    required
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Kyoto, Japan"
                    id="form-destination"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Price (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 1950"
                      id="form-price"
                    />
                    <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Duration</label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50"
                  placeholder="e.g. 4 Days, 3 Nights"
                  id="form-duration"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Cover Image (URL)</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  id="form-image-url"
                />
                <span className="text-[9px] text-gray-400 block mt-1">Specify any web layout photo URL, or leave blank to load our scenic beach preset.</span>
              </div>

              {/* MEDIA ATTACHMENTS OPTION WHILE PACKAGE IS BEING CREATED */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Package Media Items</label>
                
                {/* Drag and Drop area for attachments */}
                <div 
                  className="border-2 border-dashed border-gray-200 hover:border-emerald-500/50 bg-white rounded-xl p-4 text-center cursor-pointer transition"
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      alert(`Successfully drafted media file: "${e.dataTransfer.files[0].name}" for attachment in package!`);
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        alert(`Successfully selected ${e.target.files.length} custom brochure pictures for this package!`);
                      }
                    };
                    input.click();
                  }}
                >
                  <p className="text-[10px] text-gray-500 font-bold">Drag & drop files or click to add media assets</p>
                  <span className="text-[8px] text-gray-400 block">Brochures, scenic shots, itinerary outlines (PDF, PNG, JPG)</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Description Summary</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize key features, luxury stay features, and gourmet highlights..."
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="form-description"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                  id="btn-save-pack"
                >
                  {editingPkgId ? 'Update Listing' : 'Publish Active Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
