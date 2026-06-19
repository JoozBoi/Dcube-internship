import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  XSquare, 
  ShieldAlert, 
  Clock, 
  Users, 
  Flag, 
  FileCheck,
  ThumbsUp,
  TrendingUp,
  Activity
} from 'lucide-react';
export const AdminPortal = ({
  verifications,
  flaggedPosts,
  commentReports,
  onApproveVerification,
  onRemoveFlaggedPost,
  onIgnoreFlaggedPost,
  onRemoveCommentReport,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState('moderation');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="admin-portal-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="admin-columns-split">
        
        {/* Left Navigation Rails panel */}
        <div className="lg:col-span-1 bg-gray-950 text-gray-400 rounded-3xl p-6 flex flex-col justify-between shadow-lg" id="admin-left-sidebar">
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-800">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h4 className="mt-3 font-extrabold text-white text-sm">Clearance Agent</h4>
              <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest">Admin Control Node</span>
            </div>

            <nav className="space-y-1.5" id="admin-sidemenu">
              <button
                onClick={() => setActiveAdminTab('moderation')}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-3 transition-colors ${
                  activeAdminTab === 'moderation'
                    ? 'bg-[#ff5a5f] text-white shadow-sm'
                    : 'hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Flag className="w-4.5 h-4.5" />
                <span>Moderation Queue</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('dashboard')}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-3 transition-colors ${
                  activeAdminTab === 'dashboard'
                    ? 'bg-[#ff5a5f] text-white shadow-sm'
                    : 'hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Activity className="w-4.5 h-4.5" />
                <span>System Analytics</span>
              </button>
            </nav>
          </div>

          <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 text-center text-xs">
            <Clock className="w-5 h-5 text-red-400 mx-auto mb-1 animate-pulse" />
            <h5 className="font-extrabold text-white">Security Log</h5>
            <span className="text-[10px] block text-gray-500 mt-1 leading-normal font-mono">24 Queue Tasks Left</span>
          </div>
        </div>

        {/* Right Active Workspace Screen */}
        <div className="lg:col-span-3 space-y-8" id="admin-portal-contents">
          
          {/* TAB 1: Moderation Queue */}
          {activeAdminTab === 'moderation' && (
            <div className="space-y-8" id="moderation-workspace">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Moderation Queue</h1>
                <p className="text-sm text-gray-400 font-medium">Clear review queues, resolve agency applications, and remove reported comments.</p>
              </div>

              {/* SECTION A: Agency Verifications */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center justify-between border-b border-gray-55 pb-4">
                  <span className="flex items-center">
                    <FileCheck className="w-5 h-5 mr-2 text-indigo-500" />
                    Pending Agency Verifications
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-600 font-bold rounded-full">
                    {verifications.filter(v => v.status === 'pending').length} Actions Required
                  </span>
                </h3>

                <div className="space-y-4" id="agency-verification-cards">
                  {verifications.map((item) => (
                    <div 
                      key={item.id} 
                      className={`border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        item.status === 'approved' ? 'bg-emerald-50/20 border-emerald-100' :
                        item.status === 'rejected' ? 'bg-red-50/20 border-red-100' : 'bg-gray-50/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-black text-gray-800">{item.companyName}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                            item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status === 'pending' ? 'Pending Review' : item.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                          Submitted on {item.submittedAt} • Files attached: {item.filesCount} • Phone: {item.phone}
                        </p>
                        <p className="text-xs text-indigo-600 font-bold">Contact Email: {item.email}</p>
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => onApproveVerification(item.id, 'rejected')}
                            className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-500 border border-red-100 text-xs font-bold rounded-lg transition"
                          >
                            Reject Details
                          </button>
                          <button
                            onClick={() => onApproveVerification(item.id, 'approved')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            <span>Approve & Verify</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {verifications.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs">All pending registration logs are cleared.</div>
                  )}
                </div>
              </div>

              {/* SECTION B: Flagged Posts */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center justify-between border-b border-gray-55 pb-4">
                  <span className="flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-[#ff5a5f]" />
                    Flagged Post Reports
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-red-50 text-red-600 font-bold rounded-full">
                    {flaggedPosts.length} Incidents
                  </span>
                </h3>

                <div className="space-y-4" id="flagged-post-cards-list">
                  {flaggedPosts.map((incident) => (
                    <div key={incident.id} className="border border-gray-100 bg-gray-50/10 p-5 rounded-2xl flex flex-col justify-between gap-4">
                      <div>
                        {/* Reported details head */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-black text-gray-700">@{incident.username}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{incident.timeAgo}</span>
                          </div>
                          
                          <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider rounded">
                            {incident.type} Violation
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed italic bg-white p-3.5 border border-gray-50 rounded-xl">
                          "{incident.content}"
                        </p>
                      </div>

                      {/* Flag actions row */}
                      <div className="flex items-center justify-end space-x-2 pt-1 border-t border-gray-50/50">
                        <button
                          onClick={() => onIgnoreFlaggedPost(incident.id)}
                          className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] sm:text-xs font-bold rounded-lg transition"
                        >
                          Ignore Report
                        </button>
                        <button
                          onClick={() => onRemoveFlaggedPost(incident.id)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-sm flex items-center transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Remove Content</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {flaggedPosts.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">Congrats! No reported incidents to verify.</div>
                  )}
                </div>
              </div>

              {/* SECTION C: Flagged Comments */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center justify-between border-b border-gray-55 pb-4">
                  <span className="flex items-center">
                    <Flag className="w-5 h-5 mr-2 text-amber-500" />
                    Comment Moderation logs
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-amber-55 text-amber-700 font-bold rounded-full">
                    {commentReports.length} Active Records
                  </span>
                </h3>

                <div className="space-y-4" id="comment-incident-cards">
                  {commentReports.map((report) => (
                    <div key={report.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 flex flex-col justify-between gap-3">
                      <div>
                        {/* Report statistics and links */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-600">
                            User: <span className="font-extrabold text-gray-900">@{report.username}</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 font-black tracking-wide rounded-full animate-pulse">
                            🚨 {report.reportsCount} Reports
                          </span>
                        </div>
                        <p className="text-[10px] text-indigo-500 font-bold mb-2">In reply to post: "{report.postTitle}"</p>
                        <p className="text-gray-600 text-xs p-3 bg-white border border-gray-50 rounded-lg italic">
                          "{report.text}"
                        </p>
                      </div>

                      {/* Comment moderation button line */}
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => onRemoveCommentReport(report.id, false)}
                          className="px-3.5 py-1.5 border border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] sm:text-xs font-bold rounded-lg transition"
                        >
                          Keep Comment
                        </button>
                        <button
                          onClick={() => onRemoveCommentReport(report.id, true)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow transition"
                        >
                          Delete Comment
                        </button>
                      </div>
                    </div>
                  ))}
                  {commentReports.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs">No pending reported comment blocks found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: System Dashboard (Beautiful analytics) */}
          {activeAdminTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200" id="admin-analytics-dashboard">
              <div>
                <h1 className="text-3xl font-black text-gray-900">System Analytics</h1>
                <p className="text-sm text-gray-400 font-medium">Observe overall platform status and operations.</p>
              </div>

              {/* Data widget boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="dashboard-metric-grids">
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Active Users</span>
                  <span className="block text-3xl font-mono font-black text-gray-800 mt-2">14,204</span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center mt-2">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +9% this week
                  </span>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Platform Integrity Rate</span>
                  <span className="block text-3xl font-mono font-black text-gray-800 mt-2">99.84%</span>
                  <span className="text-xs text-indigo-600 font-bold flex items-center mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />
                    Secure Status Online
                  </span>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Reports Clearance Index</span>
                  <span className="block text-3xl font-mono font-black text-gray-800 mt-2">100.0%</span>
                  <span className="text-xs text-blue-600 font-bold flex items-center mt-2">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                    Max Coverage
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
