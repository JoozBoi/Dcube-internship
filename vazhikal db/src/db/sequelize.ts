import { Sequelize } from 'sequelize';

import dotenv from 'dotenv';

dotenv.config();

// Single source of truth for Sequelize connection.
// Other files (like src/backend/db/sequelize.ts) import this.

const DB_URL =
  process.env.DATABASE_URL ||
  `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${
    process.env.PGHOST || 'localhost'
  }:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'vazhikal'}`;

export const sequelize = new Sequelize(DB_URL, {
  logging: false,
  dialect: 'postgres',
});

export async function connectSequelize(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch {
    return false;
  }
}

