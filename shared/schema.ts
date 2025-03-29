import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["admin", "staff", "customer"] }).notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow()
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  clientId: integer("client_id").references(() => users.id),
  staffId: integer("staff_id").references(() => users.id),
  location: text("location"),
  notes: text("notes"),
  status: text("status", { enum: ["scheduled", "completed", "cancelled", "no-show"] }).default("scheduled"),
  color: text("color").default("#3b82f6"), // Default to primary blue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Calendar Integrations table
export const calendarIntegrations = pgTable("calendar_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: text("provider", { enum: ["google", "outlook", "apple"] }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  connected: boolean("connected").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// AI Suggestions table
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  suggestion: json("suggestion").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  type: text("type", { enum: ["reminder", "confirmation", "cancellation", "rescheduled"] }).notNull(),
  method: text("method", { enum: ["email", "sms", "in-app"] }).notNull(),
  sent: boolean("sent").default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow()
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCalendarIntegrationSchema = createInsertSchema(calendarIntegrations).omit({ id: true, createdAt: true });
export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Create insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertCalendarIntegration = z.infer<typeof insertCalendarIntegrationSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Create select types
export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
