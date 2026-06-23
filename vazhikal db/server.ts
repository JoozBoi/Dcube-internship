throw new Error('[backend] Root TypeScript Express server disabled. Use FastAPI: `uvicorn main:app --app-dir src/backend --port 8000`.');

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { sequelize, connectSequelize } from './src/db/sequelize.ts';
import {
  User,
  Post,
  Comment,
  Package,
  Verification,
  FlaggedPost,
  CommentReport,
  AuditLog
} from './src/db/models.ts';
import { initialPosts, initialPackages, initialVerifications, initialFlaggedPosts, initialCommentReports } from './src/data.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Audit logger helper
async function createAuditLog(entityType: string, entityId: string, action: string, performedBy: string, details?: any) {
  try {
    await AuditLog.create({
      entityType,
      entityId,
      action,
      performedBy,
      details: details ? JSON.stringify(details) : null
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

// Function to dynamically build nesting tree for flat comments structure
function buildCommentTree(flatComments: any[]) {
  const commentMap: Record<string, any> = {};
  const roots: any[] = [];

  flatComments.forEach(c => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  flatComments.forEach(c => {
    const node = commentMap[c.id];
    if (c.parentId) {
      const parent = commentMap[c.parentId];
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort comments by timestamp/createdAt
  const sortByDate = (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  roots.sort(sortByDate);

  const sortRepliesRecursively = (comment: any) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort(sortByDate);
      comment.replies.forEach(sortRepliesRecursively);
    }
  };
  roots.forEach(sortRepliesRecursively);

  return roots;
}

// -------------------------------------------------------------------
// DATABASE AUTOMATIC SEEDER
// -------------------------------------------------------------------
async function seedDatabaseIfEmpty() {
  try {
    const existingPosts = await Post.findAll({ limit: 1 });
    if (existingPosts.length === 0) {
      console.log('PostgreSQL database is empty. Seeding initial travel data and audit trails...');

      // Seed Users
      await User.bulkCreate([
        { uid: 'admin-uid', email: 'admin@vazhikal.io', username: 'admin', role: 'admin', password: '99238382', bio: 'Secure administrative intelligence node control center.' },
        { uid: 'agency-uid', email: 'info@everesttrekkers.np', username: 'EverestTrek', role: 'agency', password: 'agency123', bio: 'Licensed Mountain Passes & Sherpa Trail specialists.' },
        { uid: 'traveller-uid', email: 'sara@example.com', username: 'SaraWanderer', role: 'traveller', password: 'secret123', bio: 'Lover of mountain passes, remote temple hikes, and authentic experiences.' }
      ]);

      // Seed Posts
      for (const p of initialPosts) {
        await Post.create({
          id: p.id,
          author: p.author,
          authorAvatar: p.authorAvatar,
          timeAgo: p.timeAgo,
          location: p.location,
          title: p.title,
          description: p.description,
          cost: p.cost,
          duration: p.duration,
          imageUrl: p.imageUrl,
          imageAlt: p.imageAlt,
          votes: p.votes,
          commentsCount: p.commentsCount,
          difficulty: p.difficulty,
          dayByDay: p.dayByDay
        });

        // Seed Flat comments of the posts
        if (p.comments && p.comments.length > 0) {
          for (const c of p.comments) {
            await Comment.create({
              id: c.id,
              postId: p.id,
              parentId: null,
              author: c.author,
              authorAvatar: c.authorAvatar,
              timeAgo: c.timeAgo,
              votes: c.votes || 0,
              text: c.text,
              isVerified: c.author === 'System Administrator' || c.author === 'Host Agent'
            });

            if (c.replies && c.replies.length > 0) {
              for (const r of c.replies) {
                await Comment.create({
                  id: r.id,
                  postId: p.id,
                  parentId: c.id,
                  author: r.author,
                  authorAvatar: r.authorAvatar,
                  timeAgo: r.timeAgo,
                  votes: r.votes || 0,
                  text: r.text,
                  isVerified: r.author === 'System Administrator' || r.author === 'Host Agent'
                });
              }
            }
          }
        }

        await createAuditLog('POST', p.id, 'CREATE', 'System Seeder', { title: p.title });
      }

      // Seed Packages
      for (const pkg of initialPackages) {
        await Package.create({
          id: pkg.id,
          title: pkg.title,
          destination: pkg.destination,
          duration: pkg.duration,
          agencyName: pkg.agencyName,
          agencyLogo: pkg.agencyLogo,
          isVerifiedAgency: pkg.isVerifiedAgency,
          imageUrl: pkg.imageUrl,
          imageAlt: pkg.imageAlt,
          price: pkg.price,
          status: pkg.status,
          description: pkg.description,
          inclusions: pkg.inclusions,
          stayNameText: pkg.stayNameText,
          stayDescText: pkg.stayDescText,
          stayRating: pkg.stayRating,
          stayReviewsCount: pkg.stayReviewsCount,
          stayValue: pkg.stayValue,
          dayByDay: pkg.dayByDay
        });
        await createAuditLog('PACKAGE', pkg.id, 'CREATE', 'System Seeder', { title: pkg.title });
      }

      // Seed verifications
      for (const v of initialVerifications) {
        await Verification.create({
          id: v.id,
          companyName: v.companyName,
          submittedAt: v.submittedAt,
          email: v.email,
          phone: v.phone,
          filesCount: v.filesCount,
          status: v.status
        });
        await createAuditLog('VERIFICATION', v.id, 'CREATE', 'System Seeder', { companyName: v.companyName });
      }

      // Seed flagged posts
      for (const fp of initialFlaggedPosts) {
        await FlaggedPost.create({
          id: fp.id,
          username: fp.username,
          userAvatar: fp.userAvatar,
          timeAgo: fp.timeAgo,
          type: fp.type,
          content: fp.content
        });
        await createAuditLog('FLAGGED_POST', fp.id, 'CREATE', 'System Seeder', { username: fp.username });
      }

      // Seed comment reports
      for (const cr of initialCommentReports) {
        await CommentReport.create({
          id: cr.id,
          username: cr.username,
          postId: cr.postId,
          postTitle: cr.postTitle,
          text: cr.text,
          reportsCount: cr.reportsCount
        });
        await createAuditLog('COMMENT_REPORT', cr.id, 'CREATE', 'System Seeder', { username: cr.username });
      }

      console.log('Database successfully seeded outstandingly.');
    }
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
}

// -------------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------------

// Helper middleware to identify role from Header fallback to allow seamless UI role-switching preview
function getRequestUserContext(req: express.Request) {
  const role = (req.headers['x-user-role'] as string) || 'traveller';
  const username = (req.headers['x-user-username'] as string) || (role === 'admin' ? 'admin' : role === 'agency' ? 'EverestTrek' : 'SaraWanderer');
  return { role, name: username, username };
}

// User Session, signup and authentication integration
app.get('/api/users', async (req, res) => {
  try {
    const list = await User.findAll();
    res.json(list);
  } catch (err: any) {
    console.error('Error listing users:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, email, password, role, companyName, bio } = req.body;
  try {
    const freshUid = 'usr_' + Date.now();
    const newUser = await User.create({
      uid: freshUid,
      email: email,
      username: username || companyName || email.split('@')[0],
      role: role || 'traveller',
      password: password || 'secret123',
      bio: bio || (role === 'agency' ? 'Licensed travel agency partner' : 'Passionate world traveller exploring remote corners.')
    });
    await createAuditLog('USER', freshUid, 'REGISTER', username || 'System', { email, role });
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('Error saving user to Postgres:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:targetEmail', async (req, res) => {
  const { targetEmail } = req.params;
  const { username, password, bio, email } = req.body;
  try {
    const existing = await User.findOne({
      where: { email: targetEmail }
    });
    
    if (existing) {
      await existing.update({
        username: username || existing.username,
        password: password || existing.password,
        bio: bio !== undefined ? bio : existing.bio,
        email: email || existing.email
      });
      await createAuditLog('USER', existing.uid, 'PROFILE_UPDATE', username || existing.username, { email });
      return res.json({ success: true, user: existing });
    }

    // Try finding by username
    const existingByUsername = await User.findOne({
      where: { username: targetEmail }
    });

    if (existingByUsername) {
      await existingByUsername.update({
        username: username || existingByUsername.username,
        password: password || existingByUsername.password,
        bio: bio !== undefined ? bio : existingByUsername.bio,
        email: email || existingByUsername.email
      });
      await createAuditLog('USER', existingByUsername.uid, 'PROFILE_UPDATE', username || existingByUsername.username, { email });
      return res.json({ success: true, user: existingByUsername });
    }

    return res.status(404).json({ error: 'User account coordinates matching identifier not found' });
  } catch (err: any) {
    console.error('Failed to update user profile in database:', err);
    res.status(500).json({ error: err.message });
  }
});

// 1. Audit / Status Logs call exclusively for Admin view
app.get('/api/admin/audit-logs', async (req, res) => {
  const { role } = getRequestUserContext(req);
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied: Status and audit logs are restricted to Administrator access only.' });
  }

  try {
    const logs = await AuditLog.findAll({
      order: [['id', 'DESC']]
    });
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message || 'Database fetch failure' });
  }
});

// 2. Posts (Itinerary Experience list)
app.get('/api/posts', async (req, res) => {
  try {
    const allPostsResult = await Post.findAll({
      order: [['createdAt', 'DESC']]
    });
    const allCommentsResult = await Comment.findAll();

    const allPosts = allPostsResult.map(p => p.get({ plain: true }));
    const allComments = allCommentsResult.map(c => c.get({ plain: true }));

    // Map comments recursively based on tree structure for each post
    const postsWithComments = allPosts.map(p => {
      const postFlatComments = allComments.filter(c => c.postId === p.id);
      return {
        ...p,
        comments: buildCommentTree(postFlatComments)
      };
    });

    res.json(postsWithComments);
  } catch (err: any) {
    console.error('Error in GET /api/posts:', err);
    res.status(500).json({ error: err.message || 'Database error occurred' });
  }
});

// 3. Create Post
app.post('/api/posts', async (req, res) => {
  const { id, location, title, description, cost, duration, difficulty, dayByDay, imageUrl, imageAlt } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    const postId = id || 'exper_' + Date.now();
    await Post.create({
      id: postId,
      author: name,
      authorAvatar: name === 'System Administrator'
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timeAgo: 'Just now',
      location: location || 'World Explorer Center',
      title: title || 'New Wonders Trail',
      description: description || '',
      cost: cost || '$0 USD',
      duration: duration || '1 Day',
      difficulty: difficulty || 'Easy',
      dayByDay: dayByDay || [],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      imageAlt: imageAlt || 'Scenic adventure photography'
    });

    await createAuditLog('POST', postId, 'CREATE', name, { title });
    res.json({ success: true, id: postId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Vote Post
app.post('/api/posts/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body; // e.g. amount to add/subtract
  const { name } = getRequestUserContext(req);

  try {
    const postItem = await Post.findByPk(id);
    if (!postItem) return res.status(404).json({ error: 'Post not found' });

    const newVotes = (postItem.votes || 0) + (amount || 0);
    await Post.update({ votes: newVotes }, { where: { id } });

    await createAuditLog('POST', id, 'UPDATE_VOTE', name, { voteChange: amount, currentTotal: newVotes });
    res.json({ success: true, votes: newVotes });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Post
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role } = getRequestUserContext(req);

  try {
    // Delete all linked comments recursively
    await Comment.destroy({ where: { postId: id } });
    await Post.destroy({ where: { id } });

    await createAuditLog('POST', id, 'DELETE', `${name} (${role})`, { id });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Comments & Nested replies (Supports Infinite Chains)
app.post('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { text, parentId } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    const commentId = 'comm_' + Date.now();
    await Comment.create({
      id: commentId,
      postId,
      parentId: parentId || null,
      author: name,
      authorAvatar: name === 'System Administrator'
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timeAgo: 'Just now',
      votes: 0,
      text: text || '',
      isVerified: name === 'System Administrator' || name === 'Host Agent'
    });

    // Update comment counter on parent post
    const postItem = await Post.findByPk(postId);
    if (postItem) {
      await Post.update({ commentsCount: (postItem.commentsCount || 0) + 1 }, { where: { id: postId } });
    }

    await createAuditLog('COMMENT', commentId, 'CREATE', name, { postId, parentId, text });
    res.json({ success: true, id: commentId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Comment (and recursively delete descendants!)
app.delete('/api/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { name, role } = getRequestUserContext(req);

  try {
    const targetComment = await Comment.findByPk(commentId);
    if (!targetComment) return res.status(404).json({ error: 'Comment not found' });

    const allCommentsResult = await Comment.findAll();
    const allComments = allCommentsResult.map(c => c.get({ plain: true }));
    const idsToDelete: string[] = [commentId];

    const findChildrenRecursively = (pId: string) => {
      allComments.forEach(c => {
        if (c.parentId === pId) {
          idsToDelete.push(c.id);
          findChildrenRecursively(c.id);
        }
      });
    };
    findChildrenRecursively(commentId);

    // Perform deletions
    for (const deleteId of idsToDelete) {
      await Comment.destroy({ where: { id: deleteId } });
    }

    // Decrement comments counter on post
    const postItem = await Post.findByPk(targetComment.postId);
    if (postItem) {
      const newCount = Math.max(0, (postItem.commentsCount || 0) - idsToDelete.length);
      await Post.update({ commentsCount: newCount }, { where: { id: targetComment.postId } });
    }

    await createAuditLog('COMMENT', commentId, 'DELETE', `${name} (${role})`, { deletedCount: idsToDelete.length });
    res.json({ success: true, deletedCount: idsToDelete.length });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Packages List
app.get('/api/packages', async (req, res) => {
  try {
    const items = await Package.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Create/Edit Travel Package (Agency)
app.post('/api/packages', async (req, res) => {
  const { id, title, destination, duration, price, status, description, inclusions, stayNameText, stayDescText, stayRating, stayReviewsCount, stayValue, dayByDay, imageUrl, imageAlt } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    const pkgId = id || 'pkg_' + Date.now();
    await Package.create({
      id: pkgId,
      title: title || 'Curated Dream Package',
      destination: destination || 'Exotic Spot',
      duration: duration || '5 Days, 4 Nights',
      agencyName: 'Vazhikal Partner Agency',
      agencyLogo: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=150',
      isVerifiedAgency: true,
      imageUrl: imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSwEFWvWBfG2WMp9_eJlv5jWemkHhHXHICDU0fzedNN5don1SRTCbI4dBp07t35CxJ28PG5YkL3ccCAHAe7VkDvdElHe9MlyVQaPUm03nSjwOs6l8FO2pQjvd-1BudvwZhBgn7xzwviLHGqrRNRdH15d5nhmWekJQVf76fcvRth9eJ5wena60vtctuQI-477LecW-d5fAuF2k2Cp9PeqbUhkzxlXEhYa04a0-UQvL0CPA2PriwKDkpDFOZmnkaUpk1xHFPSSskY8od',
      imageAlt: imageAlt || 'Scenic beachfront resort view',
      price: price || 999,
      status: status || 'Active',
      description: description || '',
      inclusions: inclusions || [],
      stayNameText: stayNameText || 'Traditional Boutique Residency',
      stayDescText: stayDescText || 'Top-tier wood layout with views of green valley mists.',
      stayRating: String(stayRating || '4.5'),
      stayReviewsCount: stayReviewsCount || 10,
      stayValue: stayValue || 5,
      dayByDay: dayByDay || []
    });

    await createAuditLog('PACKAGE', pkgId, 'CREATE', name, { title });
    res.json({ success: true, id: pkgId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Existing Package
app.put('/api/packages/:id', async (req, res) => {
  const { id } = req.params;
  const { title, price, status, description } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    await Package.update({
      title,
      price,
      status,
      description
    }, { where: { id } });

    await createAuditLog('PACKAGE', id, 'UPDATE', name, { title, price, status });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete travel Package (agency console)
app.delete('/api/packages/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role } = getRequestUserContext(req);

  try {
    await Package.destroy({ where: { id } });
    await createAuditLog('PACKAGE', id, 'DELETE', `${name} (${role})`, { id });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Verification Agency Request Submit
app.get('/api/verifications', async (req, res) => {
  try {
    const list = await Verification.findAll({ order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verifications', async (req, res) => {
  const { id, companyName, email, phone, filesCount } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    const vId = id || 'ver_' + Date.now();
    await Verification.create({
      id: vId,
      companyName: companyName || 'Unlabeled Travels',
      submittedAt: 'Just now',
      email: email || '',
      phone: phone || '',
      filesCount: filesCount || 1,
      status: 'pending'
    });

    await createAuditLog('VERIFICATION', vId, 'CREATE', name, { companyName });
    res.json({ success: true, id: vId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verifications/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { name } = getRequestUserContext(req);

  try {
    await Verification.update({ status: 'resolved' }, { where: { id } });
    await createAuditLog('VERIFICATION', id, 'UPDATE_STATUS', name, { status: 'resolved' });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 11. Flagged Posts / Moderation Queues
app.get('/api/flagged-posts', async (req, res) => {
  try {
    const list = await FlaggedPost.findAll({ order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/flagged-posts', async (req, res) => {
  const { id, username, userAvatar, timeAgo, type, content } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    const fpId = id || 'flag_' + Date.now();
    await FlaggedPost.create({
      id: fpId,
      username: username || 'User',
      userAvatar: userAvatar || '',
      timeAgo: timeAgo || 'Just now',
      type: type || 'Inappropriate Content',
      content: content || ''
    });

    await createAuditLog('FLAGGED_POST', fpId, 'CREATE', name, { type, content });
    res.json({ success: true, id: fpId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/flagged-posts/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = getRequestUserContext(req);

  try {
    await FlaggedPost.destroy({ where: { id } });
    await createAuditLog('FLAGGED_POST', id, 'RESOLVE_REPORT', name, { id });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 12. Reported Comments Queue
app.get('/api/comment-reports', async (req, res) => {
  try {
    const list = await CommentReport.findAll({ order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comment-reports', async (req, res) => {
  const { id, username, postId, postTitle, text, reportsCount } = req.body;
  const { name } = getRequestUserContext(req);

  try {
    const crId = id || 'cr_' + Date.now();
    await CommentReport.create({
      id: crId,
      username: username || 'User',
      postId: postId || null,
      postTitle: postTitle || 'General',
      text: text || '',
      reportsCount: reportsCount || 1
    });

    await createAuditLog('COMMENT_REPORT', crId, 'CREATE', name, { username, text });
    res.json({ success: true, id: crId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comment-reports/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = getRequestUserContext(req);

  try {
    await CommentReport.destroy({ where: { id } });
    await createAuditLog('COMMENT_REPORT', id, 'RESOLVE_REPORT', name, { id });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------------
// Gemini AI Endpoint
// -------------------------------------------------------------------
app.post('/api/gemini/inspire', async (req, res) => {
  const { vibe } = req.body;
  if (!vibe) {
    return res.status(400).json({ error: 'vibe parameter is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined - returning premium mock fallback data.');
    return res.json({
      id: 'ai-gen-' + Date.now(),
      title: 'Echoes of the Mist: Custom ' + vibe + ' Journey',
      location: 'Ubud Highlands, Bali',
      cost: '$620 USD',
      duration: '4 Days, 3 Nights',
      difficulty: 'Easy',
      description: `This custom itinerary has been curated to resonate perfectly with your mood of: "${vibe}". In the serene mountain mist of central Bali, discover private organic gardens, quiet riversides, and tiny artisan cafes where time stays completely still.`,
      highlights: ['Morning Meditation Ridge', 'Stone Carver Workspace Tour', 'Sunset Herbal Brews'],
      dayByDay: [
        {
          day: 1,
          title: 'Arrival in the Highland Ridge',
          description: 'Transfer smoothly to a secluded eco-cottage. Unpack and take a grounding walking trail next to rushing bamboo channels, ending at an organic open-air cafe.',
          badges: ['Eco Lodge', 'Artisanal Tea', 'Grounding Hikes']
        },
        {
          day: 2,
          title: 'Forgotten Temples & Mountain Streams',
          description: 'Hike uphill past centuries-old shrines. Encounter skilled stone carvers working on fresh moss statues and plunge into a crystal-clear wild freshwater basin.',
          badges: ['Hidden Springs', 'Ancient Carvings']
        },
        {
          day: 3,
          title: 'Weaving Shrines & Sunset Ridge Walk',
          description: 'Participate in a peaceful hands-on basketry circle guided by local village elders, then ascend Campuhan ridge for a stunning mist-dappled sunset.',
          badges: ['Local Craft', 'Panoramic Sights']
        }
      ],
      mocked: true
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert travel coordinator for the modern travel matching site "Vazhikal".
The user wants an incredible curated journey matching this vibe description: "${vibe}".
Identify a breathtaking spot on Earth (real destination) matching this feeling and return a fully detailed professional itinerary.
CRITICAL: You must return a valid, parsable JSON block matching the structure below. Do NOT write any conversational intro or wrap the response in markdown blocks or backticks.

{
  "title": "A highly creative, elegant title matching this vibe.",
  "location": "A vivid real-world city and country destination.",
  "cost": "Estimated Cost estimate (e.g. $850 USD)",
  "duration": "E.g. 3 Days, 2 Nights",
  "difficulty": "Easy" or "Moderate" or "Challenging",
  "description": "An engaging, romantic, highly detailed 3-4 sentence narrative detailing key architectural styles, culinary wonders, local people, and overall visual environment.",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "dayByDay": [
    {
      "day": 1,
      "title": "Detailed Day 1 Theme title",
      "description": "Explain in 2-3 sentences the walking path, meals, resting spots, and evening mood.",
      "badges": ["Culture", "Food", "Hustle"]
    },
    {
      "day": 2,
      "title": "Detailed Day 2 Theme title",
      "description": "Give a 2-3 sentence breakdown of the main hidden highlights, moss parks, local guides, or sunset vista views.",
      "badges": ["Nature", "Art"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
    }

    const parsedData = JSON.parse(cleanText.trim());
    return res.json({
      id: 'ai-gen-' + Date.now(),
      ...parsedData
    });

  } catch (err: any) {
    console.error('Error in /api/gemini/inspire endpoint:', err);
    return res.status(500).json({ error: err.message || 'Internal AI generation failure' });
  }
});


// -------------------------------------------------------------------
// VITE OR PRODUCTION BUILD MIDDLEWARE CONNECT
// -------------------------------------------------------------------
async function startServer() {
  // Try to connect to DB but do not block app boot.
  let dbConnected = false;
  try {
    // Authenticate and establish the database connection via Sequelize handshake
    dbConnected = await connectSequelize();

    if (dbConnected) {
      // Synced configuration tables: auto-creates and alters schema structures block
      await sequelize.sync({ alter: true });
      // Seed initial schemas state if vacant
      await seedDatabaseIfEmpty();
    } else {
      console.warn('DB connection not established - skipping sequelize sync/seed. API endpoints will fail with 500.');
    }
  } catch (err) {
    console.error('Sequelize startup synchronization failed:', err);
  }


  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vazhikal full-stack TypeScript server listening on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the previous dev server instance and retry.`);
      return;
    }
    console.error('Server failed to start:', err);
  });
}


startServer();
