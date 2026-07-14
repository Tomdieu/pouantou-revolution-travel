import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { defineConfig } from 'prisma/config';

// Determine if we are using PostgreSQL (default for this project now)
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://pouantou_user:dev_password@localhost:5432/pouantou_dev";

export default defineConfig({
    datasource: {
        url: DATABASE_URL,
    },
});

/**
 * For PrismaClient initialization in src/lib/prisma.ts
 */
export const getAdapter = () => {
    const pool = new Pool({ connectionString: DATABASE_URL });
    return new PrismaPg(pool);
};
