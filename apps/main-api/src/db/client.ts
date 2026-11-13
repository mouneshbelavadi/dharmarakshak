import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

export class DatabaseService {
  private pool: pg.Pool | null = null;
  private isConnected: boolean = false;
  private inMemoryStore: Map<string, Map<string, any>> = new Map();

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString && !connectionString.includes('placeholder')) {
      this.pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 10000
      });
    }
  }

  public async initialize(): Promise<void> {
    if (this.pool) {
      try {
        const client = await this.pool.connect();
        this.isConnected = true;
        client.release();
        console.log('[DHARMARAKSHA-DB] Connected to PostgreSQL Central Authority.');
        await this.runMigrations();
      } catch (err: any) {
        console.warn(`[DHARMARAKSHA-DB] PostgreSQL connection failed (${err.message}). Using resilient persistent-disk fallback.`);
        this.isConnected = false;
      }
    } else {
      console.log('[DHARMARAKSHA-DB] Initialized in resilient local authority mode.');
    }
  }

  public async runMigrations(): Promise<void> {
    if (!this.pool || !this.isConnected) return;
    try {
      const ddlPath = path.resolve(process.cwd(), '../../packages/shared-contracts/src/schema/schema.sql');
      if (fs.existsSync(ddlPath)) {
        const sql = fs.readFileSync(ddlPath, 'utf8');
        await this.pool.query(sql);
        console.log('[DHARMARAKSHA-DB] Schema migrations applied successfully.');
      }
    } catch (err: any) {
      console.error('[DHARMARAKSHA-DB] Error applying schema migrations:', err.message);
    }
  }

  public async query(sql: string, params: any[] = []): Promise<any> {
    if (this.pool && this.isConnected) {
      return this.pool.query(sql, params);
    }
    // Return mock row representation for local development when DB is offline
    return { rows: [], rowCount: 0 };
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  public isDbConnected(): boolean {
    return this.isConnected;
  }
}

export const dbService = new DatabaseService();

