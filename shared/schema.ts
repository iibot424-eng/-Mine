import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const botConfig = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Default Profile"),
  serverIp: text("server_ip").notNull().default("localhost"),
  serverPort: integer("server_port").notNull().default(25565),
  username: text("username").notNull().default("ReplitBot"),
  authType: text("auth_type").notNull().default("offline"), // 'offline', 'microsoft', or 'bedrock'
  version: text("version").default("1.20.1"),
  masterName: text("master_name").default(""), // Player to obey commands from
  isBedrock: boolean("is_bedrock").default(false),
  
  // Feature Toggles
  isAutoFarm: boolean("is_auto_farm").default(false),
  isAutoDefense: boolean("is_auto_defense").default(false),
  isAutoTrade: boolean("is_auto_trade").default(false),
});

export const botLogs = pgTable("bot_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'chat', 'info', 'error', 'warning'
  message: text("message").notNull(),
  timestamp: text("timestamp").notNull(),
});

// === SCHEMAS ===
export const insertBotConfigSchema = createInsertSchema(botConfig).omit({ id: true });
export const insertBotLogSchema = createInsertSchema(botLogs).omit({ id: true });

// === TYPES ===
export type BotConfig = typeof botConfig.$inferSelect;
export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type BotLog = typeof botLogs.$inferSelect;

export * from "./models/auth";

// Runtime Status (Not in DB, used for API responses)
export interface BotStatus {
  online: boolean;
  health: number;
  food: number;
  position: { x: number; y: number; z: number } | null;
  nearbyPlayers: number;
  inventoryFull: boolean;
}
