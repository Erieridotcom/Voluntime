import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  organizationId: integer("organization_id").notNull(),
  category: text("category").notNull(),
  skills: text("skills").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  accessibilityFeatures: text("accessibility_features").array().notNull().default([]),
  effortLevel: text("effort_level").notNull().default("medium"),
  location: text("location").notNull(),
  state: text("state"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  spotsAvailable: integer("spots_available"),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunitiesTable.$inferSelect;
