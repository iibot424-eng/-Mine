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
  getBotConfig(id?: number): Promise<BotConfig | undefined>;
  getBotConfigs(): Promise<BotConfig[]>;
  updateBotConfig(config: InsertBotConfig, id?: number): Promise<BotConfig>;
  deleteBotConfig(id: number): Promise<void>;
  
  // Logs
  addLog(type: string, message: string): Promise<void>;
  getLogs(): Promise<BotLog[]>;
  clearLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getBotConfig(id?: number): Promise<BotConfig | undefined> {
    if (id) {
      const [config] = await db.select().from(botConfig).where(eq(botConfig.id, id));
      return config;
    }
    const configs = await db.select().from(botConfig).limit(1);
    return configs[0];
  }

  async getBotConfigs(): Promise<BotConfig[]> {
    return await db.select().from(botConfig);
  }

  async updateBotConfig(insertConfig: InsertBotConfig, id?: number): Promise<BotConfig> {
    console.log("Storage update request:", insertConfig, "ID:", id);
    const dataToSave = {
      ...insertConfig,
      isBedrock: insertConfig.isBedrock === true // Force boolean
    };

    if (id) {
      const [updated] = await db
        .update(botConfig)
        .set(dataToSave)
        .where(eq(botConfig.id, id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(botConfig).values(dataToSave).returning();
    return created;
  }

  async deleteBotConfig(id: number): Promise<void> {
    await db.delete(botConfig).where(eq(botConfig.id, id));
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
