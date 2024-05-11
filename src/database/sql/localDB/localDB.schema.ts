import { int, varchar, index, mysqlTable, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ------------------------------------------ tables ------------------------------------------

export const user = mysqlTable('user', {
    id: int('id').primaryKey().autoincrement().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    roleId: int('roleId').references(() => role.id).notNull(),
    statusId: int('statusId').default(1).references(() => status.id).notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow()
}, (user) => {
    return {
        nameIdx: index('user_name_idx').on(user.name),
        emailIdx: index('user_email_idx').on(user.email),
    };
});

export const status = mysqlTable('status', {
    id: int('id').primaryKey().autoincrement().unique(),
    name: varchar('name', { length: 255 }),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (status) => {
    return {
        nameIdx: index('status_name_idx').on(status.name),
    };
});

export const role = mysqlTable('role', {
    id: int('id').primaryKey().autoincrement().unique(),
    name: varchar('name', { length: 255 }),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (role) => {
    return {
        nameIdx: index('role_name_idx').on(role.name),
    };
});

// ------------------------------------------ relations ------------------------------------------

export const userRelations = relations(user, ({ one }) => ({
    role: one(role, {
        fields: [user.roleId],
        references: [role.id],
        relationName: 'user_role'
    }),
    status: one(status, {
        fields: [user.statusId],
        references: [status.id],
        relationName: 'user_status'
    })
}));

export const statusRelations = relations(status, ({ many }) => ({
    users: many(user),
}));

export const roleRelations = relations(role, ({ many }) => ({
    users: many(user),
}));

// ------------------------------------------ schema ------------------------------------------

export const localSchema = {
    user,
    status,
    role,

    userRelations,
    statusRelations,
    roleRelations,
};