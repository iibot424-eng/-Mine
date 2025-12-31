import { z } from 'zod';
import { insertBotConfigSchema, botConfig, botLogs } from './schema';

export const errorSchemas = {
  internal: z.object({ message: z.string() }),
};

export const api = {
    config: {
      get: {
        method: 'GET' as const,
        path: '/api/config',
        responses: {
          200: insertBotConfigSchema.extend({ 
            id: z.number(),
            isBedrock: z.boolean().nullable()
          }),
        },
      },
      update: {
        method: 'POST' as const,
        path: '/api/config',
        input: insertBotConfigSchema.extend({
          isBedrock: z.boolean().optional()
        }),
        responses: {
          200: insertBotConfigSchema.extend({ 
            id: z.number(),
            isBedrock: z.boolean().nullable()
          }),
        },
      },
    },
  bot: {
    start: {
      method: 'POST' as const,
      path: '/api/bot/start',
      responses: {
        200: z.object({ message: z.string() }),
        400: z.object({ message: z.string() }),
      },
    },
    stop: {
      method: 'POST' as const,
      path: '/api/bot/stop',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/bot/status',
      responses: {
        200: z.object({
          online: z.boolean(),
          health: z.number(),
          food: z.number(),
          position: z.object({ x: z.number(), y: z.number(), z: z.number() }).nullable(),
          nearbyPlayers: z.number(),
          inventoryFull: z.boolean(),
        }),
      },
    },
    chat: {
      method: 'POST' as const,
      path: '/api/bot/chat',
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof botLogs.$inferSelect>()),
      },
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/logs',
      responses: {
        204: z.void(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
