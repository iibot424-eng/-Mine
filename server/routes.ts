import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { botManager } from "./bot";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // --- Config Routes ---
  app.get(api.config.get.path, isAuthenticated, async (req, res) => {
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

  app.post(api.config.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.config.update.input.parse(req.body);
      console.log("Server received config update:", input);
      const updated = await storage.updateBotConfig(input);
      res.json(updated);
    } catch (err) {
      console.error("Config update validation failed:", err);
      res.status(400).json({ message: 'Invalid config' });
    }
  });

  // --- Bot Control Routes ---
  app.post(api.bot.start.path, isAuthenticated, async (req, res) => {
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

  app.post(api.bot.stop.path, isAuthenticated, async (req, res) => {
    botManager.stop();
    res.json({ message: 'Bot stopped' });
  });

  app.get(api.bot.status.path, isAuthenticated, async (req, res) => {
    const status = botManager.getStatus();
    res.json(status);
  });

  app.post(api.bot.chat.path, isAuthenticated, async (req, res) => {
    const { message } = req.body;
    if (message) {
      botManager.chat(message);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  });

  // --- Logs Routes ---
  app.get(api.logs.list.path, isAuthenticated, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.clear.path, isAuthenticated, async (req, res) => {
    await storage.clearLogs();
    res.status(204).send();
  });

  return httpServer;
}
