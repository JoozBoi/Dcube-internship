import React, { useState, useRef } from 'react';
import { Eye, EyeOff, AlertTriangle, UploadCloud, CheckCircle, Smartphone, Mail, ShieldAlert } from 'lucide-react';
export const OnboardingScreen = ({
  onAuthenticate,
  onAddVerificationSubmission,
}) => {
  const [activeTab, setActiveTab] = useState('traveller');
  
  // Traveller Form State
  const [travellerUsername, setTravellerUsername] = useState('SaraWanderer');
  const [travellerEmail, setTravellerEmail] = useState('sara@example.com');
  const [travellerPassword, setTravellerPassword] = useState('secret123');
  const [showTravellerPassword, setShowTravellerPassword] = useState(false);

  // Agency Form State
  const [agencyCompanyName, setAgencyCompanyName] = useState('Gulliver Travels Ltd.');
  const [agencyEmail, setAgencyEmail] = useState('verify@gullivertravels.com');
  const [agencyPhone, setAgencyPhone] = useState('+1 (555) 234-5678');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [agencySubmitted, setAgencySubmitted] = useState(false);
  const fileInputRef = useRef(null);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('admin@vazhikal.io');
  const [adminKey, setAdminKey] = useState('99238382');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Handle Drag-and-Drop for files verification
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

  // Submit Agency Application
  const handleAgencySubmit = (e) => {
    e.preventDefault();
    if (!agencyCompanyName || !agencyEmail || !agencyPhone) {
      alert('Please fill out all required credentials');
      return;
    }

    const newApproval = {
      id: 'av_gen_' + Date.now(),
      companyName: agencyCompanyName,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      email: agencyEmail,
      phone: agencyPhone,
      filesCount: uploadedFiles.length || 1,
      status: 'pending'
    };

    onAddVerificationSubmission(newApproval);
    setAgencySubmitted(true);
  };

  // Submit Traveller Auth
  const handleTravellerSubmit = (e) => {
    e.preventDefault();
    onAuthenticate('traveller');
  };

  // Submit Admin key auth
  const handleAdminVerify = (e) => {
    e.preventDefault();
    if (adminKey === '99238382') {
      onAuthenticate('admin');
    } else {
      setAdminError('Invalid administration credentials security key');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#9ff5b5]/30" id="onboarding-page-bg">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100" id="auth-card-container">
        {/* Card Header styling */}
        <div className="p-8 text-center border-b border-gray-50 bg-gradient-to-br from-emerald-50/50 to-teal-50" id="auth-card-header">
          <h1 className="text-3xl font-black tracking-tight text-gray-800" id="auth-main-heading">
            Welcome to <span className="text-[#ff5a5f]">Vazhikal</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
            Select your role to unlock customized tools, itineraries, and secure moderation logs.
          </p>

          {/* Interactive Toggle Control Tabs */}
          <div className="mt-8 flex bg-gray-100 p-1.5 rounded-2xl relative" id="role-tabs-selector">
            <button
              onClick={() => { setActiveTab('traveller'); setAdminError(''); }}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'traveller'
                  ? 'bg-white text-[#ff5a5f] shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-traveller-btn"
            >
              Traveller
            </button>
            <button
              onClick={() => { setActiveTab('agency'); setAdminError(''); }}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'agency'
                  ? 'bg-white text-emerald-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-agency-btn"
            >
              Travel Agency
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setAdminError(''); }}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-white text-amber-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-admin-btn"
            >
              Administrator
            </button>
          </div>
        </div>

        {/* Form contents based on selection */}
        <div className="p-8" id="auth-forms-content">
          
          {/* TAB 1: Traveller Account Setup */}
          {activeTab === 'traveller' && (
            <form onSubmit={handleTravellerSubmit} className="space-y-5" id="form-traveller">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={travellerUsername}
                  onChange={(e) => setTravellerUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a5f] transition-all bg-gray-50/50"
                  placeholder="e.g. wanderlust99"
                  id="traveller-username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={travellerEmail}
                  onChange={(e) => setTravellerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a5f] transition-all bg-gray-50/50"
                  placeholder="e.g. wanderer@vazhikal.com"
                  id="traveller-email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showTravellerPassword ? 'text' : 'password'}
                    required
                    value={travellerPassword}
                    onChange={(e) => setTravellerPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a5f] transition-all bg-gray-50/50"
                    placeholder="Enter password"
                    id="traveller-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTravellerPassword(!showTravellerPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showTravellerPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#ff5a5f] text-white font-semibold rounded-xl shadow-md hover:bg-[#eb4b50] hover:shadow-lg active:scale-[0.98] transition-all"
                  id="btn-traveller-submit"
                >
                  Enter Platform as Traveller
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Travel Agency Credentials Uploader */}
          {activeTab === 'agency' && (
            <div className="space-y-6" id="form-agency">
              {!agencySubmitted ? (
                <form onSubmit={handleAgencySubmit} className="space-y-4">
                  {/* Warning/Pending status bar */}
                  <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3 text-amber-800" id="agency-welcome-alert">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs font-medium leading-relaxed">
                      <span className="font-bold">Pending Verification status.</span> You can submit license files below to verify your corporate status and unlock your workspace console.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      required
                      value={agencyCompanyName}
                      onChange={(e) => setAgencyCompanyName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
                      placeholder="e.g. Wanderlust Travels Inc."
                      id="agency-company"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={agencyEmail}
                        onChange={(e) => setAgencyEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
                        placeholder="agency@domain.com"
                        id="agency-contact-email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={agencyPhone}
                        onChange={(e) => setAgencyPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
                        placeholder="+1 (555) 000-0000"
                        id="agency-contact-phone"
                      />
                    </div>
                  </div>

                  {/* USABILITY PATTERN: Interactive Drag and Drop Attachment zone */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Verification Documents</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        isDragging 
                          ? 'border-emerald-500 bg-emerald-50/60' 
                          : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50/30'
                      }`}
                      id="agency-uploader-zone"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Drag & drop files here or click to browse</p>
                      <p className="text-xs text-gray-400 mt-1">Upload tourism registration registry license records (PDF, PNG, JPG)</p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-1.5 max-h-24 overflow-y-auto" id="agency-uploaded-files-list">
                        <div className="text-xs font-bold text-gray-500">Selected Documents:</div>
                        {uploadedFiles.map((file, i) => (
                          <div key={i} className="flex items-center justify-between px-2.5 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600">
                            <span className="truncate">{file.name}</span>
                            <span className="text-gray-400 text-[10px]">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
                    id="btn-agency-submit"
                  >
                    Submit Verification Details
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4" id="agency-success-feedback">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Verification Application Submitted!</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Our admin team is reviewing your agency details. You can proceed directly to preview the corporate environment.
                  </p>
                  <button
                    onClick={() => onAuthenticate('agency')}
                    className="mt-2 py-2.5 px-6 bg-emerald-600 text-white font-semibold rounded-xl shadow hover:bg-emerald-700 transition"
                    id="btn-agency-enter"
                  >
                    Access Workspace anyway
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Professional Administrator Screen */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminVerify} className="space-y-5" id="form-admin">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-2 text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs font-medium leading-relaxed">
                  <span className="font-bold text-amber-900">Admin Clearance Required.</span> Use key <span className="font-mono bg-white/75 px-1 py-0.5 border border-amber-200/50 rounded font-bold text-gray-700">99238382</span> to simulate system login capabilities.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Admin Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-gray-50/50"
                    placeholder="admin@vazhikal.io"
                    id="admin-email"
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Secret Security Key</label>
                <div className="relative">
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    required
                    value={adminKey}
                    onChange={(e) => { setAdminKey(e.target.value); setAdminError(''); }}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-gray-50/50 text-center font-mono tracking-wider text-lg"
                    placeholder="••••••••"
                    id="admin-key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showAdminKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {adminError && <p className="text-red-500 text-xs mt-1.5 font-semibold text-center">{adminError}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-amber-600 text-white font-semibold rounded-xl shadow-md hover:bg-amber-700 transition"
                  id="btn-admin-submit"
                >
                  Authenticate Admin clearance
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
