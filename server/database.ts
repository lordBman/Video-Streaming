import 'dotenv/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? '',
});

const prisma = new PrismaClient({ adapter });


class DatabaseManager {
    private _client: PrismaClient;
    get client(): PrismaClient {
        return this._client;
    }

    private constructor() {
        this._client = prisma;
        this._client.$connect();
    }

    public static getInstance(): PrismaClient {
        if (!(globalThis as any)._databaseInstance) {
            (globalThis as any)._databaseInstance = new DatabaseManager();
        }
        return (globalThis as any)._databaseInstance.client;
    }
}

export const db = DatabaseManager.getInstance();