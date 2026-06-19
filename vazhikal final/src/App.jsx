import React, { useState } from 'react';
import { 
  initialPosts, 
  initialPackages, 
  initialVerifications, 
  initialFlaggedPosts, 
  initialCommentReports 
} from './data';
import { TopNavBar } from './components/TopNavBar';
import { OnboardingScreen } from './components/OnboardingScreen';
import { MainFeedScreen } from './components/MainFeedScreen';
import { DetailScreen } from './components/DetailScreen';
import { PackageDetailScreen } from './components/PackageDetailScreen';
import { AgencyWorkspace } from './components/AgencyWorkspace';
import { AdminPortal } from './components/AdminPortal';
import { AISearchScreen } from './components/AISearchScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { ShieldAlert, Info, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation & Role states
  const [currentRole, setCurrentRole] = useState('traveller');
  const [currentScreen, setCurrentScreen] = useState('onboarding');

  // Registered accounts for testing dynamic login/signup
  const [users, setUsers] = useState([
    { username: 'SaraWanderer', email: 'sara@example.com', password: 'secret123', role: 'traveller' },
    { username: 'admin', email: 'admin@vazhikal.io', password: '99238382', role: 'admin' },
    { username: 'EverestTrek', email: 'info@everesttrekkers.np', password: 'agency123', role: 'agency', companyName: 'Everest Trekkers Co.' },
  ]);

  // Unified global registers
  const [posts, setPosts] = useState(initialPosts);
  const [packages, setPackages] = useState(initialPackages);
  
  // Moderation queues
  const [verifications, setVerifications] = useState(initialVerifications);
  const [flaggedPosts, setFlaggedPosts] = useState(initialFlaggedPosts);
  const [commentReports, setCommentReports] = useState(initialCommentReports);

  // Detail & Selection states
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  // Saved bookmark sets
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [savedPackageIds, setSavedPackageIds] = useState([]);

  // Search filter query
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Role Change Handler
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    setSearchTerm('');
    // Automatically transition to proper views to preview their custom space!
    if (role === 'traveller') {
      setCurrentScreen('feed');
    } else if (role === 'agency') {
      setCurrentScreen('feed'); // Or keep inside the feed but they can discover of course
    } else if (role === 'admin') {
      setCurrentScreen('feed');
    }
  };

  // 2. Voting Logic on experience feed
  const handleVotePost = (id, direction) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;

      let scoreDelta = 0;
      let newVoteState = direction;

      if (p.userVote === direction) {
        // Toggle off
        scoreDelta = direction === 'up' ? -1 : 1;
        newVoteState = undefined;
      } else {
        // Toggle on or switch direction
        if (p.userVote === 'up') scoreDelta = -2;
        else if (p.userVote === 'down') scoreDelta = 2;
        else scoreDelta = direction === 'up' ? 1 : -1;
      }

      return {
        ...p,
        votes: p.votes + scoreDelta,
        userVote: newVoteState
      };
    }));
  };

  // 3. Discussion comments management
  const handleAddComment = (postId, text, replyToCommentId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const newC = {
        id: 'comm_' + Date.now(),
        author: currentRole === 'admin' ? 'System Administrator' : currentRole === 'agency' ? 'Host Agent' : 'Sojourn Explorer',
        authorAvatar: currentRole === 'admin' 
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' 
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text,
        timeAgo: 'Just now',
        votes: 0,
        isVerified: currentRole === 'admin' || currentRole === 'agency'
      };

      let nextComments = [...p.comments];

      if (replyToCommentId) {
        // Find comment parent
        nextComments = nextComments.map(c => {
          if (c.id !== replyToCommentId) return c;
          return {
            ...c,
            replies: [...(c.replies || []), newC]
          };
        });
      } else {
        nextComments.unshift(newC);
      }

      return {
        ...p,
        commentsCount: p.commentsCount + 1,
        comments: nextComments
      };
    }));
  };

  const handleDeleteComment = (postId, commentId, replyToCommentId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      let nextComments = [...p.comments];
      let removedCount = 0;

      if (replyToCommentId) {
        nextComments = nextComments.map(c => {
          if (c.id !== replyToCommentId) return c;
          const origLen = c.replies?.length || 0;
          const filteredReplies = (c.replies || []).filter(r => r.id !== commentId);
          removedCount = origLen - filteredReplies.length;
          return {
            ...c,
            replies: filteredReplies
          };
        });
      } else {
        const origLen = nextComments.length;
        nextComments = nextComments.filter(c => c.id !== commentId);
        removedCount = origLen - nextComments.length;
      }

      return {
        ...p,
        commentsCount: Math.max(0, p.commentsCount - removedCount),
        comments: nextComments
      };
    }));
  };

  // 4. Verification and Submission arrays
  const handleAddVerification = (item) => {
    setVerifications(prev => [item, ...prev]);
  };

  const handleApproveVerification = (id, status) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  // 5. Moderation Reports
  const handleAddFlaggedPost = (postId, content) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const incident = {
      id: 'fp_gen_' + Date.now(),
      username: post.author,
      userAvatar: post.authorAvatar,
      timeAgo: 'Just now',
      type: 'Spam',
      content: `[Reported content from: "${post.title}"] - ${content.slice(0, 80)}...`
    };

    setFlaggedPosts(prev => [incident, ...prev]);
  };

  const handleRemoveFlaggedPost = (id) => {
    // Determine user of reported incident and scrub them
    const incident = flaggedPosts.find(f => f.id === id);
    if (incident) {
      setPosts(prev => prev.filter(p => p.author !== incident.username));
    }
    setFlaggedPosts(prev => prev.filter(f => f.id !== id));
  };

  const handleIgnoreFlaggedPost = (id) => {
    setFlaggedPosts(prev => prev.filter(f => f.id !== id));
  };

  const handleRemoveCommentReport = (reportId, deleteComment) => {
    const r = commentReports.find(x => x.id === reportId);
    if (r && deleteComment) {
      // Deletes the matching comment from target Post
      setPosts(prev => prev.map(p => {
        if (p.id !== r.postId) return p;
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== r.id && c.author !== r.username),
          commentsCount: Math.max(0, p.commentsCount - 1)
        };
      }));
    }
    setCommentReports(prev => prev.filter(x => x.id !== reportId));
  };

  // 6. Packages Inventory Editing in Corporate Workspace
  const handleAddPackage = (pkg) => {
    setPackages(prev => [pkg, ...prev]);
  };

  const handleEditPackage = (updatedPkg) => {
    setPackages(prev => prev.map(p => p.id === updatedPkg.id ? updatedPkg : p));
  };

  const handleDeletePackage = (id) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  // 7. Add Custom AI generated Post to the feed
  const handleAddCustomAIPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  // Bookmark Toggle
  const handleToggleSavePost = (id) => {
    setSavedPostIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSavePkg = (id) => {
    setSavedPackageIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddPost = (title, location, description, cost, duration, highlights, imageUrl, dayByDay = []) => {
    const newPost = {
      id: 'custom-post-' + Date.now(),
      author: currentRole === 'traveller' ? 'Sara Wanderer' : 'Vazhikal Member',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timeAgo: 'Just now',
      location: location || 'Anywhere',
      title: title,
      description: description,
      cost: cost || '$0 USD',
      duration: duration || '1 Day',
      highlights: highlights ? highlights.split(',').map(h => h.trim()) : [],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000',
      votes: 1,
      commentsCount: 0,
      comments: [],
      dayByDay: dayByDay
    };
    setPosts(prev => [newPost, ...prev]);
  };

  // Visual View dispatch router
  const renderCurrentView = () => {
    switch (currentScreen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            users={users}
            onRegisterUser={(u) => setUsers(prev => [...prev, u])}
            verifications={verifications}
            onAuthenticate={(role) => {
              setCurrentRole(role);
              setCurrentScreen('feed');
            }}
            onAddVerificationSubmission={handleAddVerification}
          />
        );

      case 'feed':
        return (
          <MainFeedScreen
            posts={posts}
            packages={packages}
            onVotePost={handleVotePost}
            onPostSelect={(id) => {
              setSelectedPostId(id);
              setCurrentScreen('experience-detail');
            }}
            onPackageSelect={(id) => {
              setSelectedPackageId(id);
              setCurrentScreen('package-detail');
            }}
            onScreenChange={(screen) => setCurrentScreen(screen)}
            savedPostIds={savedPostIds}
            onToggleSavePost={handleToggleSavePost}
            searchTerm={searchTerm}
            currentRole={currentRole}
            onAddPost={handleAddPost}
            onRatePackage={(packageId, score) => {
              setPackages(prev => prev.map(p => {
                if (p.id === packageId) {
                  const currentCount = p.stayReviewsCount || p.reviewsCount || 12;
                  const currentRating = p.stayRating || p.rating || 4.8;
                  const newCount = currentCount + 1;
                  const newRating = Number(((currentRating * currentCount + score) / newCount).toFixed(1));
                  return {
                    ...p,
                    stayRating: newRating,
                    stayReviewsCount: newCount,
                    rating: newRating,
                    reviewsCount: newCount
                  };
                }
                return p;
              }));
            }}
          />
        );

      case 'experience-detail':
        const post = posts.find(p => p.id === selectedPostId);
        if (!post) return <div className="p-8 text-center text-xs">Experience details not found.</div>;
        return (
          <DetailScreen
            post={post}
            onBackToFeed={() => setCurrentScreen('feed')}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onAddFlaggedPost={handleAddFlaggedPost}
          />
        );

      case 'package-detail':
        const pkg = packages.find(p => p.id === selectedPackageId);
        if (!pkg) return <div className="p-8 text-center text-xs">Travel Package details not found.</div>;
        return (
          <PackageDetailScreen
            pkg={pkg}
            onBackToFeed={() => setCurrentScreen('feed')}
            isSavedPkg={savedPackageIds.includes(pkg.id)}
            onToggleSavePkg={handleToggleSavePkg}
          />
        );

      case 'ai-search':
        return (
          <AISearchScreen
            onAddCustomAIPost={handleAddCustomAIPost}
            onPostSelect={(id) => {
              setSelectedPostId(id);
              setCurrentScreen('experience-detail');
            }}
          />
        );

      case 'create-post':
        return (
          <CreatePostScreen
            onAddPost={handleAddPost}
            onBackToFeed={() => setCurrentScreen('feed')}
          />
        );

      default:
        return <div className="p-8 text-center text-xs">Screen viewport routing invalid/out-of-bounds.</div>;
    }
  };

  return (
    <div className="bg-[#f7f9ff] min-h-screen font-sans antialiased text-gray-800 flex flex-col" id="applet-body-container">
      {/* Dynamic Header: render TopNavBar on all screens except initial Onboarding authenticate */}
      {currentScreen !== 'onboarding' && (
        <TopNavBar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          currentScreen={currentScreen}
          onScreenChange={(screen) => {
            setCurrentScreen(screen);
            setSearchTerm('');
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentScreen('feed'); // automatically return to feed with query
          }}
        />
      )}

      {/* Role specific notification banner helper */}
      {currentScreen !== 'onboarding' && currentRole !== 'traveller' && (
        <div className="bg-emerald-50 border-b border-emerald-100/70 text-emerald-800 py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center space-x-2 relative" id="role-alert-ribbon">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>
            {currentRole === 'agency' 
              ? 'You are currently inside the Travel Agency Space. Proceed to your workspace console to create or manage listings.'
              : 'Secure Administrative Node active. Moderation Queues and Incident Controls enabled.'}
          </span>
          <button
            onClick={() => {
              setSelectedPackageId(null);
              setSelectedPostId(null);
              setCurrentScreen('feed');
            }}
            className="underline ml-2 text-emerald-900 hover:text-emerald-955 flex items-center bg-emerald-100/80 hover:bg-emerald-200/60 px-2 py-0.5 rounded transition"
          >
            {currentRole === 'agency' ? (
              <span>Workspace Console</span>
            ) : (
              <span>Security Logs Portal</span>
            )}
            <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      )}

      {/* Workspace / Admin portals layout hijack override inside Traveller wrapper */}
      <main className="flex-1" id="main-scroll-view">
        {currentScreen === 'feed' && currentRole === 'agency' ? (
          <AgencyWorkspace
            packages={packages}
            onAddPackage={handleAddPackage}
            onEditPackage={handleEditPackage}
            onDeletePackage={handleDeletePackage}
          />
        ) : currentScreen === 'feed' && currentRole === 'admin' ? (
          <AdminPortal
            verifications={verifications}
            flaggedPosts={flaggedPosts}
            commentReports={commentReports}
            onApproveVerification={handleApproveVerification}
            onRemoveFlaggedPost={handleRemoveFlaggedPost}
            onIgnoreFlaggedPost={handleIgnoreFlaggedPost}
            onRemoveCommentReport={handleRemoveCommentReport}
          />
        ) : (
          renderCurrentView()
        )}
      </main>

      {/* Humble literal human agency signature in footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium" id="page-footer">
        <p>&copy; {new Date().getFullYear()} Vazhikal Travel Co. All travel packages and reviews are vetted in real-time.</p>
      </footer>
    </div>
  );
}
