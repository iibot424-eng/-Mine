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
    const configs = await storage.getBotConfigs();
    if (configs.length === 0) {
      // Create default if missing
      const defaultProfile = await storage.updateBotConfig({
        name: 'Default Profile',
        serverIp: 'localhost',
        serverPort: 25565,
        username: 'AnarchyBot',
        authType: 'offline',
      });
      return res.json([defaultProfile]);
    }
    res.json(configs);
  });

  app.post(api.config.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.config.update.input.parse(req.body);
      const id = req.query.id ? parseInt(req.query.id as string) : undefined;
      const updated = await storage.updateBotConfig(input, id);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: 'Invalid config' });
    }
  });

  app.delete('/api/config/:id', isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBotConfig(id);
    res.status(204).send();
  });

  // --- Bot Control Routes ---
  app.post(api.bot.start.path, isAuthenticated, async (req, res) => {
    // Получаем ID из query или из последнего сохраненного профиля в БД
    const idParam = req.query.id as string;
    const id = idParam ? parseInt(idParam) : undefined;
    
    const config = await storage.getBotConfig(id);
    
    if (!config) {
      return res.status(400).json({ message: 'No configuration found' });
    }

    console.log(`Starting bot with profile: ${config.name} (ID: ${config.id}, Bedrock: ${config.isBedrock})`);

    try {
      await botManager.start({
        host: config.serverIp,
        port: config.serverPort,
        username: config.username,
        version: config.version || (config.isBedrock ? '1.21.30' : '1.20.1'),
        auth: (config.isBedrock ? 'bedrock' : config.authType) as 'offline' | 'microsoft' | 'bedrock',
        isBedrock: config.isBedrock === true, // Принудительно boolean
        autoFarm: config.isAutoFarm === true,
        autoDefense: config.isAutoDefense === true,
        autoTrade: config.isAutoTrade === true,
      });
      res.json({ message: 'Bot starting...' });
    } catch (err: any) {
      console.error("Bot start error:", err);
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
