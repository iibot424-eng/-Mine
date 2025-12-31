import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { botManager } from "./bot";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- Config Routes ---
  app.get(api.config.get.path, async (req, res) => {
    let config = await storage.getBotConfig();
    if (!config) {
      // Create default if missing
      config = await storage.updateBotConfig({
        serverIp: 'localhost',
        serverPort: 25565,
        username: 'AnarchyBot',
        authType: 'offline',
      });
    }
    res.json(config);
  });

  app.post(api.config.update.path, async (req, res) => {
    try {
      const input = api.config.update.input.parse(req.body);
      const updated = await storage.updateBotConfig(input);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: 'Invalid config' });
    }
  });

  // --- Bot Control Routes ---
  app.post(api.bot.start.path, async (req, res) => {
    const config = await storage.getBotConfig();
    if (!config) {
      return res.status(400).json({ message: 'No configuration found' });
    }

    try {
      await botManager.start({
        host: config.serverIp,
        port: config.serverPort,
        username: config.username,
        version: config.version || (config.isBedrock ? '1.19.50' : '1.20.1'),
        auth: (config.isBedrock ? 'bedrock' : config.authType) as 'offline' | 'microsoft' | 'bedrock',
        isBedrock: config.isBedrock || false,
      });
      res.json({ message: 'Bot starting...' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.bot.stop.path, async (req, res) => {
    botManager.stop();
    res.json({ message: 'Bot stopped' });
  });

  app.get(api.bot.status.path, async (req, res) => {
    const status = botManager.getStatus();
    res.json(status);
  });

  app.post(api.bot.chat.path, async (req, res) => {
    const { message } = req.body;
    if (message) {
      botManager.chat(message);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  });

  // --- Logs Routes ---
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.clear.path, async (req, res) => {
    await storage.clearLogs();
    res.status(204).send();
  });

  return httpServer;
}
