import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const STATUS_ENUM = pgEnum('status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
]);

export const ROLE_ENUM = pgEnum('role', ['USER', 'ADMIN']);

export const BORROW_STATUS_ENUM = pgEnum('borrow_status', [
  'BORROWED',
  'RETURNED',
]);

export const users = pgTable('users', {
  id: uuid('id').notNull().defaultRandom().primaryKey().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  universityId: integer('university_id').notNull().unique(),
  password: text('password').notNull(),
  universityCard: text('university_card').notNull(),
  status: STATUS_ENUM('status').default('PENDING'),
  role: ROLE_ENUM('role').default('USER'),
  lastActivityDate: date('last_activity_date').defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const books = pgTable('books', {
  id: uuid('id').notNull().defaultRandom().primaryKey().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  author: text('author').notNull(),
  genre: text('genre').notNull(),
  rating: integer('rating').notNull(),
  totalCopies: integer('total_copies').notNull().default(1),
  coverUrl: text('cover_url').notNull(),
  coverColor: text('cover_color').notNull(),
  videoUrl: text('video_url').notNull(),
  summary: text('summary').notNull(),
  availableCopies: integer('available_copies').notNull().default(0),
  status: STATUS_ENUM('status').default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
