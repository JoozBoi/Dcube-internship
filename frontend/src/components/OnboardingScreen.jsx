import React, { useState, useRef } from 'react';
import { Eye, EyeOff, AlertTriangle, UploadCloud, CheckCircle, Smartphone, Mail, ShieldAlert, Key, UserPlus, LogIn, Lock, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export const OnboardingScreen = ({
  users = [],
  onRegisterUser,
  verifications = [],
  onAuthenticate,
  onAddVerificationSubmission,
}) => {
  const [activeTab, setActiveTab] = useState('traveller'); // traveller, agency, admin
  const [isLoggingIn, setIsLoggingIn] = useState(true); // login vs signup

  // Unified Login State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email OR username
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Traveller Signup State
  const [travellerUsername, setTravellerUsername] = useState('');
  const [travellerEmail, setTravellerEmail] = useState('');
  const [travellerPassword, setTravellerPassword] = useState('');
  const [showTravellerPassword, setShowTravellerPassword] = useState(false);

  // Agency Signup State
  const [agencyVerifyId, setAgencyVerifyId] = useState(''); // Email or Company Name to find approval
  const [agencyUsername, setAgencyUsername] = useState('');
  const [agencyPassword, setAgencyPassword] = useState('');
  const [showAgencyPassword, setShowAgencyPassword] = useState(false);
  const [agencyRegisterError, setAgencyRegisterError] = useState('');
  const [agencyRegisterSuccess, setAgencyRegisterSuccess] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Agency Verification Application State (to submit documents to admin)
  const [applyCompanyName, setApplyCompanyName] = useState('Everest Trekkers Co.');
  const [applyEmail, setApplyEmail] = useState('info@everesttrekkers.np');
  const [applyPhone, setApplyPhone] = useState('+977-1-443213');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const fileInputRef = useRef(null);

  // Admin Login State
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
  const handleAgencyApplySubmit = (e) => {
    e.preventDefault();
    if (!applyCompanyName || !applyEmail || !applyPhone) {
      alert('Please fill out all required credentials');
      return;
    }

    const newApproval = {
      id: 'av_gen_' + Date.now(),
      companyName: applyCompanyName,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      email: applyEmail,
      phone: applyPhone,
      filesCount: uploadedFiles.length || 1,
      status: 'pending'
    };

    onAddVerificationSubmission(newApproval);
    setApplySubmitted(true);
  };

  // Perform Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (activeTab === 'admin') {
      if (adminKey === '99238382') {
        onAuthenticate({ username: 'Administrator', email: adminEmail, role: 'admin' });
      } else {
        setLoginError('Invalid administration credentials secret key.');
      }
      return;
    }

    try {
      const user = await api.login({ identifier: loginIdentifier, password: loginPassword, role: activeTab });
      onAuthenticate(user);
    } catch (error) {
      setLoginError(error.message || `Invalid username/email or password for the ${activeTab === 'traveller' ? 'Traveller' : 'Agency'} role.`);
    }
  };

  // Traveler Signup Submit
  const handleTravellerSignUp = async (e) => {
    e.preventDefault();
    if (!travellerUsername.trim() || !travellerEmail.trim() || !travellerPassword.trim()) {
      alert('Please fill out all details');
      return;
    }

    // Register user locally in App state
    const newUser = {
      username: travellerUsername,
      email: travellerEmail,
      password: travellerPassword,
      role: 'traveller'
    };
    try {
      const createdUser = await onRegisterUser(newUser);
      onAuthenticate(createdUser);
    } catch (error) {
      setLoginError(error.message || 'Could not create your account.');
      return;
    }

    // Prompt user to log in and switch back to Login view
    setSignupSuccess(`Account created successfully for ${travellerUsername}! Please enter your password to log in.`);
    setLoginIdentifier(travellerUsername);
    setLoginPassword('');
    setIsLoggingIn(true);

    // Clear registration inputs
    setTravellerUsername('');
    setTravellerEmail('');
    setTravellerPassword('');
  };

  // Agency Signup Submit (verify if approved)
  const handleAgencySignUp = async (e) => {
    e.preventDefault();
    setAgencyRegisterError('');
    setAgencyRegisterSuccess('');

    if (!agencyVerifyId.trim() || !agencyUsername.trim() || !agencyPassword.trim()) {
      alert('Please fill out all details');
      return;
    }

    const testId = agencyVerifyId.trim().toLowerCase();

    // Check if there is an approved verification
   const verifiedItem = verifications.find(v =>
  v.status === 'approved' &&
  (v.agencyEmail?.toLowerCase() === testId ||
   v.companyName?.toLowerCase() === testId)
);

    if (!verifiedItem) {
      setAgencyRegisterError(
        "Refused: No approved agency license verification was found for this Company Email or Name. If your status is still pending, please wait for the Admin's clearance or apply below."
      );
      return;
    }

    // Register approved agency
    const newUser = {
      username: agencyUsername,
      email: verifiedItem.agencyEmail,
      password: agencyPassword,
      role: 'agency',
      companyName: verifiedItem.companyName
    };

    try {
      const createdUser = await onRegisterUser(newUser);
      onAuthenticate(createdUser);
    } catch (error) {
      setAgencyRegisterError(error.message || 'Could not create the agency account.');
      return;
    }

    // Prompt user to log in and switch back to Login view
    setSignupSuccess(`Successfully registered Everest Trekker platform credentials for "${verifiedItem.companyName}"! Please enter your password to log in.`);
    setLoginIdentifier(verifiedItem.agencyEmail);
    setLoginPassword('');
    setIsLoggingIn(true);

    // Clear registration inputs
    setAgencyVerifyId('');
    setAgencyUsername('');
    setAgencyPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#9ff5b5]/10" id="onboarding-page-bg">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 my-8" id="auth-card-container">
        
        {/* Card Header styling */}
        <div className="p-8 text-center border-b border-gray-50 bg-gradient-to-br from-emerald-50/20 to-teal-50/30" id="auth-card-header">
          <h1 className="text-3xl font-black tracking-tight text-gray-800 animate-in fade-in" id="auth-main-heading">
            Welcome to <span className="text-emerald-600">Vazhikal</span>
          </h1>
          <p className="mt-2 text-sm text-gray-505 font-medium leading-relaxed">
            Discover agency listings or community reviews. Select your channel below:
          </p>

          {/* Interactive Toggle Control Tabs */}
          <div className="mt-8 flex bg-gray-100 p-1.5 rounded-2xl relative" id="role-tabs-selector">
            <button
              onClick={() => { setActiveTab('traveller'); setLoginError(''); setSignupSuccess(''); }}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'traveller'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-traveller-btn"
            >
              Traveller
            </button>
            <button
              onClick={() => { setActiveTab('agency'); setLoginError(''); setSignupSuccess(''); }}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'agency'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-agency-btn"
            >
              Travel Agency
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setLoginError(''); setSignupSuccess(''); }}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-admin-btn"
            >
              Administrator
            </button>
          </div>
        </div>

        {/* Form Content body */}
        <div className="p-8" id="auth-forms-content">
          
          {/* TAB 1 & 2: LOGIN VIEW (Default for travellers and agencies, only one for admins) */}
          {isLoggingIn ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                <LogIn className="w-3.5 h-3.5" />
                <span>{activeTab === 'admin' ? 'Security Entry Control' : `${activeTab} login portal`}</span>
              </div>

              {loginError && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-start space-x-2 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-start space-x-2 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 font-bold shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {activeTab === 'admin' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-2 text-amber-800">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs font-medium leading-relaxed">
                      <span className="font-bold">Admin Portal simulated access.</span> Enter key <span className="font-mono bg-white px-1.5 py-0.5 border border-amber-200 rounded font-bold text-gray-700">99238382</span> below to pass authentication clearance checks.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Secret Verification Key</label>
                    <div className="relative">
                      <input
                        type={showAdminKey ? 'text' : 'password'}
                        required
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        className="absolute right-3.5 top-3.5 text-gray-400"
                      >
                        {showAdminKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTab === 'agency' && (
                    <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl flex items-start space-x-2 text-sky-800 text-xs">
                      <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        Verify license with our admin, and then click <span className="font-bold underline cursor-pointer" onClick={() => setIsLoggingIn(false)}>Sign Up</span>. Default approved account email: <span className="font-mono bg-white/75 px-1 py-0.5 rounded border leading-none">info@everesttrekkers.np</span> (pwd: <span className="font-mono">agency123</span>) is preloaded.
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Username or Email Address
                    </label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter registered username or email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400"
                        title="Toggle password view"
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 px-6 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] ${
                  activeTab === 'traveller' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  activeTab === 'agency' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Let's Enter Vazhikal Site
              </button>

              {activeTab !== 'admin' && (
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 font-semibold select-none">
                    Don't have a secure workspace yet?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsLoggingIn(false); setLoginError(''); setSignupSuccess(''); }}
                      className={`font-black underline transition-colors ${
                        activeTab === 'traveller' ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-600 hover:text-emerald-750'
                      }`}
                    >
                      Sign Up / Register Account
                    </button>
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* REGISTRATION / SIGNUP VIEW */
            <div className="space-y-6" id="signup-form-container">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register a free {activeTab} account</span>
              </div>

              {/* TRAVELLER SIGNUP FORM */}
              {activeTab === 'traveller' && (
                <form onSubmit={handleTravellerSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Username</label>
                    <input
                      type="text"
                      required
                      value={travellerUsername}
                      onChange={(e) => setTravellerUsername(e.target.value)}
                      placeholder="e.g. SaraWanderer"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={travellerEmail}
                      onChange={(e) => setTravellerEmail(e.target.value)}
                      placeholder="e.g. sara@example.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showTravellerPassword ? 'text' : 'password'}
                        required
                        value={travellerPassword}
                        onChange={(e) => setTravellerPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTravellerPassword(!showTravellerPassword)}
                        className="absolute right-3.5 top-3 text-gray-400"
                      >
                        {showTravellerPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all"
                  >
                    Confirm Registration & Log In
                  </button>
                </form>
              )}

              {/* AGENCY SIGNUP FORM (Approved Verification is strictly Required) */}
              {activeTab === 'agency' && (
                <div className="space-y-6">
                  {agencyRegisterSuccess && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-start space-x-2.5 text-xs font-semibold">
                      <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
                      <span>{agencyRegisterSuccess}</span>
                    </div>
                  )}

                  {agencyRegisterError ? (
                    <div className="p-4 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl flex flex-col space-y-3 text-xs leading-relaxed">
                      <div className="flex items-start space-x-2 font-semibold text-amber-900">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                        <span>Agency Account Registration Refused</span>
                      </div>
                      <p>{agencyRegisterError}</p>
                      <button
                        type="button"
                        onClick={() => setAgencyRegisterError('')}
                        className="py-1 px-3 bg-white hover:bg-gray-50 border border-amber-200 rounded-lg text-[10px] uppercase font-extrabold text-amber-800 w-fit"
                      >
                        Try Different Email or Name
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAgencySignUp} className="space-y-4">
                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 leading-relaxed font-medium">
                        To sign up, you must use a Company Name or Email pre-approved in the Admin panel.
                        For example, use <span className="font-bold underline">Everest Trekkers Co.</span> or <span className="font-bold underline">info@everesttrekkers.np</span> (Wait—if it is pending, approve it in the Admin console first).
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Verified Email or Company Name</label>
                        <input
                          type="text"
                          required
                          value={agencyVerifyId}
                          onChange={(e) => setAgencyVerifyId(e.target.value)}
                          placeholder="e.g. info@everesttrekkers.np"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Desired Username</label>
                          <input
                            type="text"
                            required
                            value={agencyUsername}
                            onChange={(e) => setAgencyUsername(e.target.value)}
                            placeholder="e.g. EverestHQ"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Desired Password</label>
                          <div className="relative">
                            <input
                              type={showAgencyPassword ? 'text' : 'password'}
                              required
                              value={agencyPassword}
                              onChange={(e) => setAgencyPassword(e.target.value)}
                              placeholder="Choose password"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowAgencyPassword(!showAgencyPassword)}
                              className="absolute right-3.5 top-3 text-gray-400"
                            >
                              {showAgencyPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all"
                      >
                        Register Verified Agency Credentials
                      </button>
                    </form>
                  )}

                  {/* DOCUMENT VERIFICATION APPLICATION SUBMITTER */}
                  <div className="pt-6 border-t border-gray-150">
                    <h4 className="text-sm font-black uppercase text-gray-800 tracking-wider mb-2">Apply for Verification Credentialing</h4>
                    <p className="text-xs text-gray-400 font-semibold mb-4 leading-relaxed">
                      If your travel agency does not have approved credentials yet, submit your commercial license files below. Approvals can be instantly granted inside our simulated Administrator Portal.
                    </p>

                    {!applySubmitted ? (
                      <form onSubmit={handleAgencyApplySubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Agency Company Name</label>
                          <input
                            type="text"
                            required
                            value={applyCompanyName}
                            onChange={(e) => setApplyCompanyName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
                            placeholder="e.g. Everest Trekkers Co."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Contact Email</label>
                            <input
                              type="email"
                              required
                              value={applyEmail}
                              onChange={(e) => setApplyEmail(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
                              placeholder="info@everesttrekkers.np"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Phone Number</label>
                            <input
                              type="text"
                              required
                              value={applyPhone}
                              onChange={(e) => setApplyPhone(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
                              placeholder="+977-1-443213"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Verification Attachment License</label>
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
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              multiple
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-xs font-semibold text-gray-700">Drag & drop files or click to browse</p>
                            <span className="text-[10px] text-gray-400 block mt-1">Upload tourism registration records (PDF, PNG, JPG)</span>
                          </div>

                          {uploadedFiles.length > 0 && (
                            <div className="mt-3 space-y-1.5" id="uploaded-files-preview">
                              {uploadedFiles.map((f, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-1 bg-gray-50 border rounded text-[10px] text-gray-600">
                                  <span>{f.name}</span>
                                  <span>{(f.size / 1024).toFixed(1)} KB</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold hover:bg-emerald-100 rounded-xl transition text-xs"
                        >
                          Submit Verification Documents (Pending Approval)
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2">
                        <CheckCircle className="w-7 h-7 mx-auto text-emerald-600" />
                        <h5 className="font-extrabold text-sm text-gray-800">Verification Submitted!</h5>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                          Your records were sent to the Secure Moderator Queue. Switch to <span className="font-bold underline text-amber-700 cursor-pointer" onClick={() => setActiveTab('admin')}>Administrator tab</span>, login to verify yours, and then sign up!
                        </p>
                        <button
                          type="button"
                          onClick={() => setApplySubmitted(false)}
                          className="text-[10px] font-black underline uppercase text-emerald-700 block mx-auto"
                        >
                          Apply for another brand
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ROUTE BACK TO SIGN IN PAGE */}
              <div className="text-center pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-semibold select-none">
                  Already registered your access profile?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLoggingIn(true); setAgencyRegisterError(''); setSignupSuccess(''); }}
                    className={`font-black underline transition-colors ${
                      activeTab === 'traveller' ? 'text-emerald-600 hover:text-emerald-750' : 'text-emerald-600 hover:text-emerald-750'
                    }`}
                  >
                    Return to Sign In / Login
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
