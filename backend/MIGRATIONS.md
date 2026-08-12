# Database Migrations

This project uses **Umzug** with **Sequelize** for versioned database migrations.

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- Environment variables configured (see `.env.example`)

## Migration Commands

| Command | Description |
|---------|-------------|
| `npm run db:migrate:up` | Run all pending migrations |
| `npm run db:migrate:down` | Undo the last executed migration |
| `npm run db:migrate:status` | Show executed and pending migrations |

## How It Works

- Migrations are stored in `src/migrations/` as TypeScript files.
- Each migration exports `up` and `down` functions.
- Migration state is stored in the MySQL database (`SequelizeMeta` table).
- The application still uses `sequelize.sync({ alter: false })` at startup as a safety net.

## Creating a New Migration

1. Create a new file in `src/migrations/` with a timestamp prefix, e.g. `0002-add-user-preferences.ts`.
2. Export `up` and `down` functions:

```typescript
export const up = async (sequelize: any) => {
  await sequelize.query(`ALTER TABLE \`Users\` ADD COLUMN \`preferences\` JSON NULL`);
};

export const down = async (sequelize: any) => {
  await sequelize.query(`ALTER TABLE \`Users\` DROP COLUMN \`preferences\``);
};
```

3. Run `npm run db:migrate:up` to apply.
4. Run `npm run db:migrate:down` to undo if needed.

## Baseline Migration

`0001-baseline.ts` creates all tables required by the current Sequelize models:

- Users
- Services
- Bookings
- Quotes
- Contacts
- Conversations
- Messages
- Attachments
- Notifications
- Payments
- BookingFiles
- Announcements
- Partners
- Testimonials
- FAQs
- Settings

## Important Safety Notes

- **NEVER run migrations directly against production without testing locally first.**
- Always run `npm run db:migrate:status` before applying migrations to see what will run.
- The `down` migration for the baseline drops ALL tables. Do not undo the baseline in production.
- Keep the old `migrate-*.ts` scripts as fallbacks until all environments are verified with Umzug.
- Migrations must be tested against a local/test database before being merged.

## Old Migration Scripts

The following ad-hoc scripts still exist and can be used as fallbacks:

- `src/migrate-payments.ts` — adds payment columns and Payments table
- `src/migrate-chat.ts` — adds chat columns and Attachments table
- `src/migrate-profile-picture.ts` — adds profilePictureUrl to Users

These will be removed once Umzug is verified in all environments.
