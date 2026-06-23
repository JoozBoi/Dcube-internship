import React, { useState } from 'react';
import {
  initialPosts,
  initialPackages,
  initialVerifications,
  initialFlaggedPosts,
  initialCommentReports,
} from '../backend/data.ts';
import { API_URL } from './api';
import { TopNavBar } from './components/TopNavBar';

import { OnboardingScreen } from './components/OnboardingScreen';
import { MainFeedScreen } from './components/MainFeedScreen';
import { DetailScreen } from './components/DetailScreen';
import { PackageDetailScreen } from './components/PackageDetailScreen';
import { AgencyWorkspace } from './components/AgencyWorkspace';
import { AdminPortal } from './components/AdminPortal';
import { AISearchScreen } from './components/AISearchScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vazhikal_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('vazhikal_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role || 'traveller';
      }
    } catch {}
    return 'traveller';
  });

  const [currentScreen, setCurrentScreen] = useState(() => {
    try {
      const saved = localStorage.getItem('vazhikal_user');
      if (saved) return 'feed';
    } catch {}
    return 'onboarding';
  });

  const [users, setUsers] = useState([
    {
      username: 'SaraWanderer',
      email: 'sara@example.com',
      password: 'secret123',
      role: 'traveller',
      bio: 'Lover of mountain passes, remote temple hikes, and authentic experiences.',
    },
    {
      username: 'admin',
      email: 'admin@vazhikal.io',
      password: '99238382',
      role: 'admin',
      bio: 'Secure administrative intelligence node control center.',
    },
    {
      username: 'EverestTrek',
      email: 'info@everesttrekkers.np',
      password: 'agency123',
      role: 'agency',
      companyName: 'Everest Trekkers Co.',
      bio: 'Licensed Mountain Passes & Sherpa Trail specialists.',
    },
  ]);

  React.useEffect(() => {
    const fetchDBUsers = async () => {
      try {
const res = await fetch(`${API_URL}/users`);
        if (res.ok) {
          const dbUsers = await res.json();
          if (dbUsers && dbUsers.length > 0) {
            setUsers((prev) => {
              const copy = [...prev];
              dbUsers.forEach((user) => {
                if (!copy.some((u) => u.username === user.username || u.email === user.email)) {
                  copy.push({
                    username: user.username,
                    email: user.email,
                    password: user.password || 'secret123',
                    role: user.role,
                    bio: user.bio || '',
                    companyName: user.role === 'agency' ? user.username : undefined,
                  });
                }
              });
              return copy;
            });
          }
        }
      } catch (err) {
        console.warn('Backend users table not synced yet. Defaults loaded.', err);
      }
    };
    fetchDBUsers();
  }, []);

  const [posts, setPosts] = useState(initialPosts);
  const [packages, setPackages] = useState(initialPackages);
  const [userPackageRatings, setUserPackageRatings] = useState({});

  const [verifications, setVerifications] = useState(initialVerifications);
  const [flaggedPosts, setFlaggedPosts] = useState(initialFlaggedPosts);
  const [commentReports, setCommentReports] = useState(initialCommentReports);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const [savedPostIds, setSavedPostIds] = useState([]);
  const [savedPackageIds, setSavedPackageIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    setSearchTerm('');
    setCurrentScreen('feed');
  };

  React.useEffect(() => {
    const loadAllDatabaseRecords = async () => {
      try {
        const headers = {
          'x-user-role': currentRole,
          'x-user-username': loggedInUser ? loggedInUser.username : '',
        };

const postsRes = await fetch(`${API_URL}/posts`, { headers });
        if (postsRes.ok) setPosts(await postsRes.json());

const pkgsRes = await fetch(`${API_URL}/packages`, { headers });
        if (pkgsRes.ok) setPackages(await pkgsRes.json());

const verifRes = await fetch(`${API_URL}/verifications`, { headers });
        if (verifRes.ok) setVerifications(await verifRes.json());

const flaggedRes = await fetch(`${API_URL}/flagged-posts`, { headers });
        if (flaggedRes.ok) setFlaggedPosts(await flaggedRes.json());

const reportsRes = await fetch(`${API_URL}/comment-reports`, { headers });
        if (reportsRes.ok) setCommentReports(await reportsRes.json());
      } catch (err) {
        console.warn('Backend database is not yet fully loaded or synced. Using local states.', err);
      }
    };

    loadAllDatabaseRecords();
  }, [currentRole, loggedInUser]);

  const handleVotePost = (id, direction) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let scoreDelta = 0;
        let newVoteState = direction;

        if (p.userVote === direction) {
          scoreDelta = direction === 'up' ? -1 : 1;
          newVoteState = undefined;
        } else {
          if (p.userVote === 'up') scoreDelta = -2;
          else if (p.userVote === 'down') scoreDelta = 2;
          else scoreDelta = direction === 'up' ? 1 : -1;
        }

        fetch(`/api/posts/${id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
          body: JSON.stringify({ amount: scoreDelta }),
        }).catch((err) => console.error('Error recording vote on server:', err));

        return {
          ...p,
          votes: p.votes + scoreDelta,
          userVote: newVoteState,
        };
      })
    );
  };

  const handleAddComment = (postId, text, replyToCommentId) => {
    const commentId = 'comm_' + Date.now();
    const commentAuthor = loggedInUser
      ? loggedInUser.username
      : currentRole === 'admin'
        ? 'System Administrator'
        : currentRole === 'agency'
          ? 'Host Agent'
          : 'Sojourn Explorer';

    const newC = {
      id: commentId,
      author: commentAuthor,
      authorAvatar:
        currentRole === 'admin'
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text,
      timeAgo: 'Just now',
      votes: 0,
      isVerified: currentRole === 'admin' || currentRole === 'agency',
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        let nextComments = [...p.comments];

        if (replyToCommentId) {
          const addReplyRecursively = (comments, parentId, newReply) => {
            return comments.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newReply],
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: addReplyRecursively(c.replies, parentId, newReply),
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
          comments: nextComments,
        };
      })
    );

    fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': currentRole,
        'x-user-username': commentAuthor,
      },
      body: JSON.stringify({ text, parentId: replyToCommentId, id: commentId }),
    }).catch((err) => console.error('Error inserting comment on server:', err));
  };

  const handleDeleteComment = (postId, commentId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        let removedCount = 0;

        const deleteRecursively = (list) => {
          const result = [];
          for (const c of list) {
            if (c.id === commentId) {
              const countDescendants = (node) => {
                let count = 1;
                if (node.replies) {
                  for (const r of node.replies) count += countDescendants(r);
                }
                return count;
              };
              removedCount += countDescendants(c);
              continue;
            }

            let newReplies = c.replies || [];
            if (newReplies.length > 0) newReplies = deleteRecursively(newReplies);

            result.push({ ...c, replies: newReplies });
          }
          return result;
        };

        const nextComments = deleteRecursively(p.comments);

        return {
          ...p,
          commentsCount: Math.max(0, p.commentsCount - removedCount),
          comments: nextComments,
        };
      })
    );

    fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    }).catch((err) => console.error('Error deleting comment on server:', err));
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    }).catch((err) => console.error('Error deleting post on server:', err));
  };

  const handleReportComment = (postId, _commentId, commentText, commentAuthor) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const newReport = {
      id: 'cr_dyn_' + Date.now(),
      username: commentAuthor,
      postId,
      postTitle: post.title,
      text: commentText,
      reportsCount: 1,
    };

    setCommentReports((prev) => {
      const existing = prev.find((r) => r.username === commentAuthor && r.text === commentText);
      if (existing) {
        return prev.map((r) => (r.id === existing.id ? { ...r, reportsCount: r.reportsCount + 1 } : r));
      }
      return [newReport, ...prev];
    });

    fetch('/api/comment-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify(newReport),
    }).catch((err) => console.error('Error reporting comment on server:', err));

    alert('This comment has been successfully reported to the admin moderation queue.');
  };

  const handleAddVerification = (item) => {
    setVerifications((prev) => [item, ...prev]);

    fetch('/api/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify(item),
    }).catch((err) => console.error('Error submitting verification on server:', err));
  };

  const handleApproveVerification = (id, status) => {
    setVerifications((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));

    fetch(`/api/verifications/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify({ status }),
    }).catch((err) => console.error('Error approving verification on server:', err));
  };

  const handleAddFlaggedPost = (postId, content) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const incident = {
      id: 'fp_gen_' + Date.now(),
      username: post.author,
      userAvatar: post.authorAvatar,
      timeAgo: 'Just now',
      type: 'Spam',
      content: `[Reported content from: "${post.title}"] - ${content.slice(0, 80)}...`,
    };

    setFlaggedPosts((prev) => [incident, ...prev]);

    fetch('/api/flagged-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify(incident),
    }).catch((err) => console.error('Error submitting flagged post on server:', err));
  };

  const handleRemoveFlaggedPost = (id) => {
    const incident = flaggedPosts.find((f) => f.id === id);
    if (incident) {
      setPosts((prev) => prev.filter((p) => p.author !== incident.username));
      const pToDelete = posts.find((p) => p.author === incident.username);
      if (pToDelete) fetch(`/api/posts/${pToDelete.id}`, { method: 'DELETE', headers: { 'x-user-role': currentRole } }).catch((err) => console.error(err));
    }

    setFlaggedPosts((prev) => prev.filter((f) => f.id !== id));

    fetch(`/api/flagged-posts/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    }).catch((err) => console.error('Error removing flagged post on server:', err));
  };

  const handleIgnoreFlaggedPost = (id) => {
    setFlaggedPosts((prev) => prev.filter((f) => f.id !== id));

    fetch(`/api/flagged-posts/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    }).catch((err) => console.error('Error ignoring report on server:', err));
  };

  const handleRemoveCommentReport = (reportId, deleteComment) => {
    const r = commentReports.find((x) => x.id === reportId);

    if (r && deleteComment) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== r.postId) return p;
          return {
            ...p,
            comments: p.comments.filter((c) => c.id !== r.id && c.author !== r.username),
            commentsCount: Math.max(0, p.commentsCount - 1),
          };
        })
      );

      fetch(`/api/comments/${r.id}`, { method: 'DELETE', headers: { 'x-user-role': currentRole } }).catch((err) => console.error(err));
    }

    setCommentReports((prev) => prev.filter((x) => x.id !== reportId));

    fetch(`/api/comment-reports/${reportId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    }).catch((err) => console.error('Error removing comment report on server:', err));
  };

  const handleAddPackage = (pkg) => {
    setPackages((prev) => [pkg, ...prev]);

    fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify(pkg),
    }).catch((err) => console.error('Error adding package on server:', err));
  };

  const handleEditPackage = (updatedPkg) => {
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));

    fetch(`/api/packages/${updatedPkg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify(updatedPkg),
    }).catch((err) => console.error('Error updating package on server:', err));
  };

  const handleDeletePackage = (id) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));

    fetch(`/api/packages/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    }).catch((err) => console.error('Error deleting package on server:', err));
  };

  const handleAddCustomAIPost = (post) => {
    setPosts((prev) => [post, ...prev]);

    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify(post),
    }).catch((err) => console.error('Error loading custom AI post on server:', err));
  };

  const handleToggleSavePost = (id) => {
    setSavedPostIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleSavePkg = (id) => {
    setSavedPackageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleRatePackage = (packageId, score) => {
    const previousScore = userPackageRatings[packageId];
    const hasRatedAlready = previousScore !== undefined;

    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== packageId) return p;

        const currentCount = p.stayReviewsCount || p.reviewsCount || 12;
        const currentRating = p.stayRating || p.rating || 4.8;

        let newCount = currentCount;
        let newRating = currentRating;

        if (hasRatedAlready) {
          const currentSum = currentRating * currentCount;
          newRating = Number(((currentSum - previousScore + score) / currentCount).toFixed(1));
        } else {
          newCount = currentCount + 1;
          newRating = Number(((currentRating * currentCount + score) / newCount).toFixed(1));
        }

        return {
          ...p,
          stayRating: newRating,
          stayReviewsCount: newCount,
          rating: newRating,
          reviewsCount: newCount,
        };
      })
    );

    setUserPackageRatings((prev) => ({ ...prev, [packageId]: score }));
  };

  const handleRegisterUser = async (u) => {
    setUsers((prev) => [...prev, u]);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u),
      });
    } catch (err) {
      console.error('Error saving new registered user to Postgres:', err);
    }
  };

  const handleUpdateProfile = async (updatedFields) => {
    if (!loggedInUser) return;

    const updatedUser = { ...loggedInUser, ...updatedFields };
    setLoggedInUser(updatedUser);
    localStorage.setItem('vazhikal_user', JSON.stringify(updatedUser));

    setUsers((prev) =>
      prev.map((u) => (u.email === loggedInUser.email || u.username === loggedInUser.username ? { ...u, ...updatedFields } : u))
    );

    try {
      const targetQuery = loggedInUser.email || loggedInUser.username;
      await fetch(`/api/users/${encodeURIComponent(targetQuery)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
        },
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.error('Failed to update credentials in Postgres database:', err);
    }
  };

  const handleScreenChange = (screen) => {
    if (screen === 'onboarding') {
      setLoggedInUser(null);
      localStorage.removeItem('vazhikal_user');
    }
    setCurrentScreen(screen);
  };

  const handleAddPost = (title, location, description, cost, duration, highlights, imageUrl, dayByDay = []) => {
    const postId = 'custom-post-' + Date.now();
    const authorName = loggedInUser ? loggedInUser.username : currentRole === 'traveller' ? 'Sara Wanderer' : 'Vazhikal Member';

    const newPost = {
      id: postId,
      author: authorName,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timeAgo: 'Just now',
      location: location || 'Anywhere',
      title,
      description,
      cost: cost || '$0 USD',
      duration: duration || '1 Day',
      highlights: highlights ? highlights.split(',').map((h) => h.trim()) : [],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000',
      votes: 1,
      commentsCount: 0,
      comments: [],
      dayByDay,
    };

    setPosts((prev) => [newPost, ...prev]);

    fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': currentRole,
        'x-user-username': authorName,
      },
      body: JSON.stringify({ ...newPost, highlights }),
    }).catch((err) => console.error('Error inserting custom post on server:', err));
  };

  const renderCurrentView = () => {
    switch (currentScreen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            users={users}
            onRegisterUser={handleRegisterUser}
            verifications={verifications}
            onAuthenticate={(role, matchedUser) => {
              setCurrentRole(role);
              const defaultUser = {
                username: role === 'admin' ? 'admin' : role === 'agency' ? 'EverestTrek' : 'SaraWanderer',
                email: role === 'admin' ? 'admin@vazhikal.io' : role === 'agency' ? 'info@everesttrekkers.np' : 'sara@example.com',
                role,
                bio: '',
              };
              const activeUser = matchedUser || defaultUser;
              setLoggedInUser(activeUser);
              localStorage.setItem('vazhikal_user', JSON.stringify(activeUser));
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
            onScreenChange={handleScreenChange}
            savedPostIds={savedPostIds}
            onToggleSavePost={handleToggleSavePost}
            searchTerm={searchTerm}
            currentRole={currentRole}
            onAddPost={handleAddPost}
            onRatePackage={handleRatePackage}
            userPackageRatings={userPackageRatings}
            loggedInUser={loggedInUser}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      case 'experience-detail': {
        const post = posts.find((p) => p.id === selectedPostId);
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
      }

      case 'package-detail': {
        const pkg = packages.find((p) => p.id === selectedPackageId);
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
      }

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
        return <CreatePostScreen onAddPost={handleAddPost} onBackToFeed={() => setCurrentScreen('feed')} />;

      default:
        return <div className="p-8 text-center text-xs">Screen viewport routing invalid/out-of-bounds.</div>;
    }
  };

  return (
    <div className="bg-[#f7f9ff] min-h-screen font-sans antialiased text-gray-800 flex flex-col" id="applet-body-container">
      {currentScreen !== 'onboarding' && (
        <TopNavBar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          currentScreen={currentScreen}
          onScreenChange={(screen) => {
            handleScreenChange(screen);
            setSearchTerm('');
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentScreen('feed');
          }}
        />
      )}

      {currentScreen !== 'onboarding' && currentRole !== 'traveller' && (
        <div
          className="bg-emerald-50 border-b border-emerald-100/70 text-emerald-800 py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center space-x-2 relative"
          id="role-alert-ribbon"
        >
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
            <span>{currentRole === 'agency' ? 'Workspace Console' : 'Security Logs Portal'}</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      )}

      <main className="flex-1" id="main-scroll-view">
        {currentScreen === 'feed' && currentRole === 'agency' ? (
          <AgencyWorkspace packages={packages} onAddPackage={handleAddPackage} onEditPackage={handleEditPackage} onDeletePackage={handleDeletePackage} />
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

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium" id="page-footer">
        <p>&copy; {new Date().getFullYear()} Vazhikal Travel Co. All travel packages and reviews are vetted in real-time.</p>
      </footer>
    </div>
  );
}

