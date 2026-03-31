import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull().default("volunteer"),
  organizationName: text("organization_name"),
  organizationDescription: text("organization_description"),
  bio: text("bio"),
  skills: text("skills").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  accessibilityNeeds: text("accessibility_needs").array().notNull().default([]),
  state: text("state"),
  city: text("city"),
  age: integer("age"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
