import { pgTable, serial, timestamp, varchar, text, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 后台管理员表
export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial().primaryKey(),
    username: varchar("username", { length: 64 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("admin_users_username_idx").on(table.username)
  ]
);

// 旅行规划记录表
export const travelRecords = pgTable(
  "travel_records",
  {
    id: serial().primaryKey(),
    deviceUuid: varchar("device_uuid", { length: 64 }).notNull(),
    destination: varchar("destination", { length: 255 }).notNull(),
    startDate: varchar("start_date", { length: 32 }).notNull(),
    endDate: varchar("end_date", { length: 32 }).notNull(),
    travelers: varchar("travelers", { length: 16 }).notNull(),
    tripType: varchar("trip_type", { length: 64 }).notNull(),
    preferences: text("preferences"),
    resultContent: jsonb("result_content"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("travel_records_device_uuid_idx").on(table.deviceUuid),
    index("travel_records_destination_idx").on(table.destination),
    index("travel_records_created_at_idx").on(table.createdAt)
  ]
);
