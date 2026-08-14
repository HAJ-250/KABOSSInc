export const up = async ({ context }: { context: any }) => {
  await context.query(`
    ALTER TABLE \`Notifications\`
    MODIFY COLUMN \`type\` ENUM(
      'booking',
      'message',
      'booking_file',
      'status_update',
      'payment',
      'system'
    ) NOT NULL DEFAULT 'system'
  `);
};

export const down = async ({ context }: { context: any }) => {
  const [rows] = await context.query(
    `SELECT COUNT(*) as c FROM \`Notifications\` WHERE \`type\` = 'payment'`
  );
  const count = rows?.[0]?.c ?? 0;

  if (count > 0) {
    throw new Error(
      `Cannot safely remove 'payment' from Notifications.type ENUM: ${count} row(s) still use it. ` +
      'Update or delete those rows before rolling back this migration.'
    );
  }

  await context.query(`
    ALTER TABLE \`Notifications\`
    MODIFY COLUMN \`type\` ENUM(
      'booking',
      'message',
      'booking_file',
      'status_update',
      'system'
    ) NOT NULL DEFAULT 'system'
  `);
};
