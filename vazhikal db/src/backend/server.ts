throw new Error('[backend] TypeScript Express server disabled. Use FastAPI: `uvicorn main:app --app-dir src/backend --port 8000`.');

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import { sequelize, connectSequelize } from './db/sequelize.ts';
import {
  User,
  Post,
  Comment,
  Package,
  Verification,
  FlaggedPost,
  CommentReport,
  AuditLog,
} from './db/models.ts';

import * as seedData from './data.js';

const {
  initialPosts,
  initialPackages,
  initialVerifications,
  initialFlaggedPosts,
  initialCommentReports,
} = seedData as any;

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Audit logger helper
async function createAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  performedBy: string,
  details?: any
) {
  try {
    await AuditLog.create({
      entityType,
      entityId,
      action,
      performedBy,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

// Function to dynamically build nesting tree for flat comments structure
function buildCommentTree(flatComments: any[]) {
  const commentMap: Record<string, any> = {};
  const roots: any[] = [];

  flatComments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  flatComments.forEach((c) => {
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
  const sortByDate = (a: any, b: any) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
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
        {
          uid: 'admin-uid',
          email: 'admin@vazhikal.io',
          username: 'admin',
          role: 'admin',
          password: '99238382',
          bio: 'Secure administrative intelligence node control center.',
        },
        {
          uid: 'agency-uid',
          email: 'info@everesttrekkers.np',
          username: 'EverestTrek',
          role: 'agency',
          password: 'agency123',
          bio: 'Licensed Mountain Passes & Sherpa Trail specialists.',
        },
        {
          uid: 'traveller-uid',
          email: 'sara@example.com',
          username: 'SaraWanderer',
          role: 'traveller',
          password: 'secret123',
          bio: 'Lover of mountain passes, remote temple hikes, and authentic experiences.',
        },
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
          dayByDay: p.dayByDay,
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
              isVerified: c.author === 'System Administrator' || c.author === 'Host Agent',
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
                  isVerified: r.author === 'System Administrator' || r.author === 'Host Agent',
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
          dayByDay: pkg.dayByDay,
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
          status: v.status,
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
          content: fp.content,
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
          reportsCount: cr.reportsCount,
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
  const username =
    (req.headers['x-user-username'] as string) ||
    (role === 'admin' ? 'admin' : role === 'agency' ? 'EverestTrek' : 'SaraWanderer');
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
      bio:
        bio ||
        (role === 'agency'
          ? 'Licensed travel agency partner'
          : 'Passionate world traveller exploring remote corners.'),
    });
    await createAuditLog('USER', freshUid, 'REGISTER', username || 'System', { email, role });
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('Error saving user to Postgres:', err);
    res.status(500).json({ error: err.message });
  }
});

// TODO: routes preserved from root server.ts during migration.


async function startServer() {
  let dbConnected = false;
  try {
    dbConnected = await connectSequelize();

    if (dbConnected) {
      await sequelize.sync({ alter: true });
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

