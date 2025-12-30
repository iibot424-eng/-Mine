import mineflayer from 'mineflayer';
import { storage } from './storage';
import { BotStatus } from '@shared/schema';

// We'll manage the bot instance here
class BotManager {
  private bot: mineflayer.Bot | null = null;
  private _status: BotStatus = {
    online: false,
    health: 20,
    food: 20,
    position: null,
    nearbyPlayers: 0,
    inventoryFull: false,
  };

  getStatus(): BotStatus {
    return this._status;
  }

  async start(config: { host: string; port: number; username: string; version?: string; auth: 'offline' | 'microsoft' }) {
    if (this.bot) return;

    await storage.addLog('info', `Connecting to ${config.host}:${config.port} as ${config.username}...`);

    try {
      this.bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version || '1.20.1',
        auth: config.auth,
      });

      this.setupEvents();
    } catch (err) {
      await storage.addLog('error', `Failed to start bot: ${err}`);
      this.bot = null;
    }
  }

  stop() {
    if (this.bot) {
      this.bot.quit();
      this.bot = null;
      this._status.online = false;
      this._status.position = null;
      storage.addLog('info', 'Bot disconnected manually.');
    }
  }

  chat(message: string) {
    if (this.bot) {
      this.bot.chat(message);
      storage.addLog('chat', `> ${message}`);
    }
  }

  private setupEvents() {
    if (!this.bot) return;

    this.bot.on('spawn', () => {
      this._status.online = true;
      storage.addLog('info', 'Bot spawned on server.');
    });

    this.bot.on('end', (reason) => {
      this._status.online = false;
      this.bot = null;
      storage.addLog('warning', `Bot disconnected: ${reason}`);
    });

    this.bot.on('kicked', (reason) => {
      storage.addLog('error', `Bot kicked: ${reason}`);
    });

    this.bot.on('error', (err) => {
      storage.addLog('error', `Bot error: ${err.message}`);
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.bot?.username) return;
      storage.addLog('chat', `<${username}> ${message}`);
    });

    this.bot.on('health', () => {
      if (this.bot) {
        this._status.health = this.bot.health;
        this._status.food = this.bot.food;
      }
    });

    this.bot.on('move', () => {
      if (this.bot && this.bot.entity) {
        this._status.position = this.bot.entity.position;
      }
    });

    // Simple Danger Detection (Nearby Players)
    this.bot.on('physicsTick', () => {
      if (!this.bot) return;
      
      const players = Object.values(this.bot.players).filter(p => 
        p.entity && 
        p.username !== this.bot?.username && 
        p.entity.position.distanceTo(this.bot!.entity.position) < 30
      );

      this._status.nearbyPlayers = players.length;
    });
  }
}

export const botManager = new BotManager();
