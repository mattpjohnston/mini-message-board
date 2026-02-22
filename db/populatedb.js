const pool = require("./pool");

const SQL = `
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  added TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

TRUNCATE TABLE messages RESTART IDENTITY;

INSERT INTO messages (username, text, added)
VALUES
  ('Amando', 'Hi there!', NOW() - INTERVAL '2 days'),
  ('Charles', 'Hello World!', NOW() - INTERVAL '1 day');
`;

async function main() {
  console.log("Creating table and seeding messages...");
  await pool.query(SQL);
  console.log("Done.");
  await pool.end();
}

main().catch(async (error) => {
  console.error("Seeding failed:", error);
  await pool.end();
  process.exit(1);
});
