import React, { useState, useEffect } from 'react';
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
import { api } from './lib/api';

const normalizePost = (post) => ({
  ...post,
  imageUrl: post.imageUrl || post.image_url,
  votes: post.votes || 0,
  comments: post.comments || [],
  commentsCount: post.commentsCount || 0,
  highlights: post.highlights || [],
  timeAgo: 'Recently',
  authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
});

const normalizePackage = (pkg) => ({
  ...pkg,
  imageUrl: pkg.imageUrl || pkg.image_url,
  agencyName: pkg.agencyName || pkg.agency_name,
  stayRating: pkg.stayRating || pkg.rating || 0,
  stayReviewsCount: pkg.stayReviewsCount || pkg.reviews_count || 0,
  isVerifiedAgency: true,
  status: pkg.status || 'Active',
});

export default function App() {
  // Navigation & Role states
  const [currentRole, setCurrentRole] = useState('traveller');
  const [currentScreen, setCurrentScreen] = useState('onboarding');

  // Registered accounts for testing dynamic login/signup
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Unified global registers
  const [posts, setPosts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.listUsers(), api.listPosts(), api.listPackages(), api.listVerifications(), api.listFlaggedPosts(), api.listCommentReports()])
      .then(([loadedUsers, loadedPosts, loadedPackages, loadedVerifications, loadedFlaggedPosts, loadedCommentReports]) => {
        if (!active) return;
        setUsers(loadedUsers);
        setPosts(loadedPosts.map(normalizePost));
        setPackages(loadedPackages.map(normalizePackage));
        setVerifications(loadedVerifications);
        setFlaggedPosts(loadedFlaggedPosts);
        setCommentReports(loadedCommentReports);
      })
      .catch((error) => {
        if (active) setApiError(`Live data is unavailable: ${error.message}`);
      });
    return () => { active = false; };
  }, []);
  const [userPackageRatings, setUserPackageRatings] = useState({});
  
  // Moderation queues
  const [verifications, setVerifications] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [commentReports, setCommentReports] = useState([]);

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
  const handleVotePost = async (id, direction) => {
    if (!currentUser) return setApiError('Sign in before voting.');
    try {
      const result = await api.votePost(id, { voterEmail: currentUser.email, direction });
      setPosts(prev => prev.map(post => post.id === id ? { ...post, votes: result.votes, userVote: direction } : post));
    } catch (error) {
      setApiError(`Could not save vote: ${error.message}`);
    }
  };

  // 3. Discussion comments management
  const handleAddComment = async (postId, text, replyToCommentId) => {
    try {
      const created = await api.createComment(postId, {
        text,
        parentId: replyToCommentId,
        author: currentUser?.username || 'Traveller',
        authorEmail: currentUser?.email,
      });
      setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const newC = {
        id: created.id,
        author: created.author,
        authorAvatar: currentRole === 'admin' 
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' 
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text,
        timeAgo: 'Just now',
        votes: 0,
        isVerified: currentRole === 'admin' || currentRole === 'agency',
        replies: []
      };

      let nextComments = [...p.comments];

      if (replyToCommentId) {
        const addReplyRecursively = (comments, parentId, newReply) => {
          return comments.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply]
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: addReplyRecursively(c.replies, parentId, newReply)
              };
            }
            return c;
          });
        };
        nextComments = addReplyRecursively(nextComments, replyToCommentId, newC);
      } else {
        nextComments.unshift(newC);
      }

      return {
        ...p,
        commentsCount: p.commentsCount + 1,
        comments: nextComments
      };
      }));
    } catch (error) {
      setApiError(`Could not add comment: ${error.message}`);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.deleteComment(commentId);
      setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      let removedCount = 0;

      const deleteRecursively = (list) => {
        const result = [];
        for (const c of list) {
          if (c.id === commentId) {
            const countDescendants = (node) => {
              let count = 1;
              if (node.replies) {
                for (const r of node.replies) {
                  count += countDescendants(r);
                }
              }
              return count;
            };
            removedCount += countDescendants(c);
            continue;
          }

          let newReplies = c.replies || [];
          if (newReplies.length > 0) {
            newReplies = deleteRecursively(newReplies);
          }

          result.push({
            ...c,
            replies: newReplies
          });
        }
        return result;
      };

      const nextComments = deleteRecursively(p.comments);

      return {
        ...p,
        commentsCount: Math.max(0, p.commentsCount - removedCount),
        comments: nextComments
      };
      }));
    } catch (error) {
      setApiError(`Could not delete comment: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      setApiError(`Could not delete post: ${error.message}`);
    }
  };

  const handleReportComment = async (postId, commentId, commentText, commentAuthor) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const newReport = await api.createCommentReport({ commentId, reporterEmail: currentUser?.email, reason: 'Abuse' });
      setCommentReports(prev => [newReport, ...prev]);
      alert('This comment has been successfully reported to the admin moderation queue.');
    } catch (error) {
      setApiError(`Could not report comment: ${error.message}`);
    }
  };

  // 4. Verification and Submission arrays
  const handleAddVerification = async (item) => {
    const created = await api.createVerification({
      agencyEmail: item.email,
      companyName: item.companyName,
      documents: item.documents || [],
    });
    setVerifications(prev => [created, ...prev]);
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
  const handleAddPackage = async (pkg) => {
    try {
      const created = await api.createPackage(pkg);
      setPackages(prev => [normalizePackage(created), ...prev]);
    } catch (error) {
      setApiError(`Could not create package: ${error.message}`);
      throw error;
    }
  };

  const handleEditPackage = async (updatedPkg) => {
    try {
      const updated = await api.updatePackage(updatedPkg.id, updatedPkg);
      setPackages(prev => prev.map(p => p.id === updatedPkg.id ? normalizePackage(updated) : p));
    } catch (error) {
      setApiError(`Could not update package: ${error.message}`);
      throw error;
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await api.deletePackage(id);
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      setApiError(`Could not delete package: ${error.message}`);
      throw error;
    }
  };

  // 7. Add Custom AI generated Post to the feed
  const handleAddCustomAIPost = async (post) => {
    try {
      const created = await api.createPost({
        ...post,
        author: currentUser?.username || post.author,
        authorEmail: currentUser?.email,
      });
      setPosts(prev => [normalizePost(created), ...prev]);
    } catch (error) {
      setApiError(`Could not save AI itinerary: ${error.message}`);
    }
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

  const handleRatePackage = (packageId, score) => {
    const previousScore = userPackageRatings[packageId];
    const hasRatedAlready = previousScore !== undefined;

    setPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        const currentCount = p.stayReviewsCount || p.reviewsCount || 12;
        const currentRating = p.stayRating || p.rating || 4.8;

        let newCount = currentCount;
        let newRating = currentRating;

        if (hasRatedAlready) {
          // Replace former rating: newSum = (currentRating * currentCount) - previousScore + score
          const currentSum = currentRating * currentCount;
          newRating = Number(((currentSum - previousScore + score) / currentCount).toFixed(1));
        } else {
          // First time rating package in this session
          newCount = currentCount + 1;
          newRating = Number(((currentRating * currentCount + score) / newCount).toFixed(1));
        }

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

    setUserPackageRatings(prev => ({
      ...prev,
      [packageId]: score
    }));
  };

  const handleAddPost = async (title, location, description, cost, duration, highlights, imageUrl, dayByDay = []) => {
    try {
      const newPost = await api.createPost({
        title,
        author: currentUser?.username,
        authorEmail: currentUser?.email,
        location,
        description,
        cost,
        duration,
        imageUrl,
        highlights: Array.isArray(highlights) ? highlights : highlights.split(',').map((item) => item.trim()).filter(Boolean),
        dayByDay
      });
      setPosts(prev => [normalizePost(newPost), ...prev]);
    } catch (error) {
      setApiError(`Could not create post: ${error.message}`);
      throw error;
    }
  };

  // Visual View dispatch router
  const renderCurrentView = () => {
    switch (currentScreen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            users={users}
            onRegisterUser={async (user) => {
              const created = await api.createUser(user);
              const sessionUser = { ...created, password: user.password };
              setUsers(prev => [...prev, sessionUser]);
              return sessionUser;
            }}
            verifications={verifications}
            onAuthenticate={(user) => {
              setCurrentUser(user);
              setCurrentRole(user.role);
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
            savedPackageIds={savedPackageIds}
            onToggleSavePost={handleToggleSavePost}
            searchTerm={searchTerm}
            currentRole={currentRole}
            currentUser={currentUser}
            onAddPost={handleAddPost}
            onRatePackage={handleRatePackage}
            userPackageRatings={userPackageRatings}
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
            currentRole={currentRole}
            onDeletePost={handleDeletePost}
            onReportComment={handleReportComment}
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
            onRatePackage={handleRatePackage}
            userPackageRatings={userPackageRatings}
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

      {apiError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-900" role="alert">
          {apiError}
          <button className="ml-3 underline" onClick={() => setApiError('')}>Dismiss</button>
        </div>
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
