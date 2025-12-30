import { db } from "./db";
import {
  botConfig,
  botLogs,
  type BotConfig,
  type InsertBotConfig,
  type BotLog,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Config
  getBotConfig(): Promise<BotConfig | undefined>;
  updateBotConfig(config: InsertBotConfig): Promise<BotConfig>;
  
  // Logs
  addLog(type: string, message: string): Promise<void>;
  getLogs(): Promise<BotLog[]>;
  clearLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getBotConfig(): Promise<BotConfig | undefined> {
    const configs = await db.select().from(botConfig).limit(1);
    return configs[0];
  }

  async updateBotConfig(insertConfig: InsertBotConfig): Promise<BotConfig> {
    const existing = await this.getBotConfig();
    if (existing) {
      const [updated] = await db
        .update(botConfig)
        .set(insertConfig)
        .where(eq(botConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(botConfig).values(insertConfig).returning();
      return created;
    }
  }

  async addLog(type: string, message: string): Promise<void> {
    const timestamp = new Date().toLocaleTimeString();
    await db.insert(botLogs).values({ type, message, timestamp });
  }

  async getLogs(): Promise<BotLog[]> {
    return await db.select().from(botLogs).orderBy(desc(botLogs.id)).limit(100);
  }

  async clearLogs(): Promise<void> {
    await db.delete(botLogs);
  }
}

export const storage = new DatabaseStorage();
