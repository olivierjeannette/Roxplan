import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

// ==================== USERS ====================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== PLANS ====================
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  // Métadonnées
  name: text('name').notNull().default('Sans titre'),
  description: text('description'),
  eventType: text('event_type').default('hyrox'),

  // Canvas
  canvasWidth: integer('canvas_width').notNull().default(1200),
  canvasHeight: integer('canvas_height').notNull().default(800),
  backgroundType: text('background_type').default('grid'),
  backgroundImageUrl: text('background_image_url'),
  backgroundOpacity: integer('background_opacity').default(100),

  // Éléments du plan (JSONB)
  elements: jsonb('elements').notNull().default('[]'),

  // Parcours / Flèches (JSONB)
  routes: jsonb('routes').notNull().default('[]'),

  // Métadonnées plan
  isPublic: boolean('is_public').default(false),
  thumbnail: text('thumbnail'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== CUSTOM ELEMENT TEMPLATES ====================
export const customElements = pgTable('custom_elements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull().default('#3B82F6'),
  defaultWidth: integer('default_width').default(100),
  defaultHeight: integer('default_height').default(100),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
