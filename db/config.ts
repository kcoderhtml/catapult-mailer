import { defineDb, defineTable, column } from 'astro:db';

// Define your tables here
const Subscribers = defineTable({
  columns: {
    id: column.number({ primaryKey: true, unique: true }),
    name: column.text(),
    email: column.text(),
    subscribedAt: column.date(),
  },
  indexes: {
    SubscribersIDx: { on: ["id"], unique: true },
  },
});

const Messages = defineTable({
  columns: {
    id: column.number({ primaryKey: true, unique: true }),
    message: column.text(),
    sentAt: column.date(),
    sentBy: column.text(),
  },
  indexes: {
    MessagesIDx: { on: ["id"], unique: true },
  },
});

const Admins = defineTable({
  columns: {
    id: column.number({ primaryKey: true, unique: true }),
    name: column.text(),
    slackUserID: column.text(),
  },
  indexes: {
    AdminsIDx: { on: ["id"], unique: true },
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Subscribers, Messages, Admins }
});
