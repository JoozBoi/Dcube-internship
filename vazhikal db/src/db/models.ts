import { DataTypes, Model, Sequelize } from 'sequelize';

import { sequelize as defaultSequelize } from './sequelize.ts';


// NOTE: This file exists to satisfy re-exports from src/backend/db/models.ts.
// The backend expects these model exports to be available for seeding and API.

type InferCreation<T> = T extends Model<infer P, infer I> ? I : never;

// -------------------- User --------------------
export class User extends Model {
  declare uid: string;
  declare email: string;
  declare username: string;
  declare role: string;
  declare password: string;
  declare bio: string | null;
}

// -------------------- Post --------------------
export class Post extends Model {
  declare id: string;
  declare author: string;
  declare authorAvatar: string | null;
  declare timeAgo: string | null;
  declare location: string | null;
  declare title: string;
  declare description: string | null;
  declare cost: string | null;
  declare duration: string | null;
  declare imageUrl: string | null;
  declare imageAlt: string | null;
  declare votes: number;
  declare commentsCount: number;
  declare difficulty: string | null;
  declare dayByDay: any;
}

// -------------------- Comment --------------------
export class Comment extends Model {
  declare id: string;
  declare postId: string;
  declare parentId: string | null;
  declare author: string;
  declare authorAvatar: string | null;
  declare timeAgo: string | null;
  declare votes: number;
  declare text: string;
  declare isVerified: boolean;
}

// -------------------- Package --------------------
export class Package extends Model {
  declare id: string;
  declare title: string;
  declare destination: string;
  declare duration: string;
  declare agencyName: string;
  declare agencyLogo: string | null;
  declare isVerifiedAgency: boolean;
  declare imageUrl: string | null;
  declare imageAlt: string | null;
  declare price: string;
  declare status: string;
  declare description: string;
  declare inclusions: any;
  declare stayNameText: string;
  declare stayDescText: string;
  declare stayRating: number;
  declare stayReviewsCount: number;
  declare stayValue: string;
  declare dayByDay: any;
}

// -------------------- Verification --------------------
export class Verification extends Model {
  declare id: string;
  declare companyName: string;
  declare submittedAt: string | null;
  declare email: string;
  declare phone: string | null;
  declare filesCount: number;
  declare status: string;
}

// -------------------- FlaggedPost --------------------
export class FlaggedPost extends Model {
  declare id: string;
  declare username: string;
  declare userAvatar: string | null;
  declare timeAgo: string | null;
  declare type: string;
  declare content: string;
}

// -------------------- CommentReport --------------------
export class CommentReport extends Model {
  declare id: string;
  declare username: string;
  declare postId: string;
  declare postTitle: string;
  declare text: string;
  declare reportsCount: number;
}

// -------------------- AuditLog --------------------
export class AuditLog extends Model {
  declare id: string;
  declare entityType: string;
  declare entityId: string;
  declare action: string;
  declare performedBy: string;
  declare details: string | null;
}

let initialized = false;

export function initModels(customSequelize: Sequelize = defaultSequelize) {
  if (initialized) return;
  initialized = true;

  User.init(
    {
      uid: { type: DataTypes.STRING, primaryKey: true },
      email: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      bio: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize: customSequelize, tableName: 'users', timestamps: false }
  );

  Post.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      author: { type: DataTypes.STRING, allowNull: false },
      authorAvatar: { type: DataTypes.STRING, allowNull: true },
      timeAgo: { type: DataTypes.STRING, allowNull: true },
      location: { type: DataTypes.STRING, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      cost: { type: DataTypes.STRING, allowNull: true },
      duration: { type: DataTypes.STRING, allowNull: true },
      imageUrl: { type: DataTypes.STRING, allowNull: true },
      imageAlt: { type: DataTypes.STRING, allowNull: true },
      votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      commentsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      difficulty: { type: DataTypes.STRING, allowNull: true },
      dayByDay: { type: DataTypes.JSONB, allowNull: true },
    },
    { sequelize: customSequelize, tableName: 'posts', timestamps: false }
  );

  Comment.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      postId: { type: DataTypes.STRING, allowNull: false },
      parentId: { type: DataTypes.STRING, allowNull: true },
      author: { type: DataTypes.STRING, allowNull: false },
      authorAvatar: { type: DataTypes.STRING, allowNull: true },
      timeAgo: { type: DataTypes.STRING, allowNull: true },
      votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      text: { type: DataTypes.TEXT, allowNull: false },
      isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { sequelize: customSequelize, tableName: 'comments', timestamps: false }
  );

  Package.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      destination: { type: DataTypes.STRING, allowNull: false },
      duration: { type: DataTypes.STRING, allowNull: false },
      agencyName: { type: DataTypes.STRING, allowNull: false },
      agencyLogo: { type: DataTypes.STRING, allowNull: true },
      isVerifiedAgency: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      imageUrl: { type: DataTypes.STRING, allowNull: true },
      imageAlt: { type: DataTypes.STRING, allowNull: true },
      price: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      inclusions: { type: DataTypes.JSONB, allowNull: true },
      stayNameText: { type: DataTypes.STRING, allowNull: true },
      stayDescText: { type: DataTypes.STRING, allowNull: true },
      stayRating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 4.8 },
      stayReviewsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      stayValue: { type: DataTypes.STRING, allowNull: true },
      dayByDay: { type: DataTypes.JSONB, allowNull: true },
    },
    { sequelize: customSequelize, tableName: 'packages', timestamps: false }
  );

  Verification.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      companyName: { type: DataTypes.STRING, allowNull: false },
      submittedAt: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true },
      filesCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    },
    { sequelize: customSequelize, tableName: 'verifications', timestamps: false }
  );

  FlaggedPost.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      username: { type: DataTypes.STRING, allowNull: false },
      userAvatar: { type: DataTypes.STRING, allowNull: true },
      timeAgo: { type: DataTypes.STRING, allowNull: true },
      type: { type: DataTypes.STRING, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize: customSequelize, tableName: 'flagged_posts', timestamps: false }
  );

  CommentReport.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      username: { type: DataTypes.STRING, allowNull: false },
      postId: { type: DataTypes.STRING, allowNull: false },
      postTitle: { type: DataTypes.STRING, allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
      reportsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    { sequelize: customSequelize, tableName: 'comment_reports', timestamps: false }
  );

  AuditLog.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'audit_' + Date.now() },
      entityType: { type: DataTypes.STRING, allowNull: false },
      entityId: { type: DataTypes.STRING, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      performedBy: { type: DataTypes.STRING, allowNull: false },
      details: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize: customSequelize, tableName: 'audit_logs', timestamps: false }
  );
}

// Initialize immediately so that imports work even if callers forget to call initModels.
initModels();

