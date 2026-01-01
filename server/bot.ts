import mineflayer from 'mineflayer';
import bedrock from 'bedrock-protocol';
import { storage } from './storage';
import { BotStatus } from '@shared/schema';

// We'll manage the bot instance here
class BotManager {
  private bot: mineflayer.Bot | any = null;
  private isBedrock: boolean = false;
  private autoEatInterval: NodeJS.Timeout | null = null;
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

  async start(config: { host: string; port: number; username: string; version?: string; auth: 'offline' | 'microsoft' | 'bedrock'; isBedrock: boolean }) {
    if (this.bot) return;

    this.isBedrock = config.isBedrock;
    await storage.clearLogs();
    await storage.addLog('info', `Connecting to ${config.host}:${config.port} as ${config.username} (${config.isBedrock ? 'Bedrock' : 'Java'})...`);
    
    // DEBUG LOG
    console.log("BotManager starting with isBedrock:", this.isBedrock, "Config:", config);

    try {
      if (this.isBedrock) {
        this.bot = bedrock.createClient({
          host: config.host,
          port: config.port,
          username: config.username,
          offline: true,
          version: config.version as any || '1.21.30',
          skipPing: true,
          connectTimeout: 10000
        });
        this.setupBedrockEvents();
      } else {
        this.bot = mineflayer.createBot({
          host: config.host,
          port: config.port,
          username: config.username,
          version: config.version || undefined,
          auth: 'offline', // Force offline for Java
          checkTimeoutInterval: 60000,
          hideErrors: false
        });
        this.setupJavaEvents();
      }
      this.startAutoEat();
    } catch (err) {
      await storage.addLog('error', `Failed to start bot: ${err}`);
      this.bot = null;
    }
  }

  stop() {
    this.stopAutoEat();
    if (this.bot) {
      if (this.isBedrock) {
        this.bot.disconnect();
      } else {
        this.bot.quit();
      }
      this.bot = null;
      this._status.online = false;
      this._status.position = null;
      storage.addLog('info', 'Bot disconnected manually.');
    }
  }

  private startAutoEat() {
    if (this.autoEatInterval) return;
    this.autoEatInterval = setInterval(async () => {
      if (this.isBedrock || !this.bot || !this.bot.food || this.bot.food > 14) return;

      const food = this.bot.inventory.items().find((item: any) => {
        const name = item.name.toLowerCase();
        return name.includes('apple') || 
               name.includes('bread') || 
               name.includes('beef') || 
               name.includes('chicken') || 
               name.includes('porkchop') ||
               name.includes('carrot');
      });

      if (food) {
        try {
          await this.bot.equip(food, 'hand');
          await this.bot.consume();
          storage.addLog('info', `Eating ${food.name}...`);
        } catch (err) {
          // Silent fail
        }
      }
    }, 5000);
  }

  private stopAutoEat() {
    if (this.autoEatInterval) {
      clearInterval(this.autoEatInterval);
      this.autoEatInterval = null;
    }
  }

  chat(message: string) {
    if (this.bot) {
      if (this.isBedrock) {
        this.bot.queue('text', { type: 'chat', needs_translation: false, source_name: '', xuid: '', platform_chat_id: '', message });
      } else {
        this.bot.chat(message);
      }
      storage.addLog('chat', `> ${message}`);
    }
  }

  private setupBedrockEvents() {
    this.bot.on('join', () => {
      this._status.online = true;
      storage.addLog('info', 'Bedrock Bot joined server.');
    });
    this.bot.on('text', (packet: any) => {
      storage.addLog('chat', packet.message);
    });
    this.bot.on('error', (err: any) => {
      storage.addLog('error', `Bedrock Connection Error: ${err.message || err}`);
      this._status.online = false;
    });
    this.bot.on('close', () => {
      this._status.online = false;
      storage.addLog('warning', 'Bedrock connection closed.');
    });
  }

  private setupJavaEvents() {
    if (!this.bot) return;

    this.bot.on('spawn', () => {
      this._status.online = true;
      storage.addLog('info', 'Java Bot spawned.');
      // Also ensure we set online true here to sync state immediately
      this._status.online = true;
    });

    this.bot.on('login', () => {
      this._status.online = true;
      storage.addLog('info', 'Java Bot logged in.');
    });

    // Accept resource packs automatically (often required by servers)
    this.bot.on('resource_pack', (url: string, hash: string) => {
      storage.addLog('info', 'Server requested resource pack. Accepting...');
      this.bot.acceptResourcePack();
    });

    this.bot.on('end', (reason: string) => {
      this._status.online = false;
      storage.addLog('warning', `Java Bot disconnected: ${reason}`);
    });

    this.bot.on('chat', (username: string, message: string) => {
      if (username === this.bot?.username) return;
      storage.addLog('chat', `<${username}> ${message}`);
    });

    this.bot.on('error', (err: any) => {
      storage.addLog('error', `Java Bot Error: ${err.message || err}`);
      this._status.online = false;
    });

    this.bot.on('kicked', (reason: string) => {
      storage.addLog('error', `Java Bot Kicked: ${reason}`);
      this._status.online = false;
    });

    this.bot.on('move', () => {
      if (this.bot && this.bot.entity) {
        this._status.position = this.bot.entity.position;
      }
    });

    this.bot.on('physicsTick', () => {
      if (!this.bot || !this.bot.entity) return;
      const players = Object.values(this.bot.players).filter((p: any) => 
        p.entity && 
        p.username !== this.bot?.username && 
        p.entity.position.distanceTo(this.bot!.entity.position) < 30
      );
      this._status.nearbyPlayers = players.length;
    });
  }
}

export const botManager = new BotManager();
