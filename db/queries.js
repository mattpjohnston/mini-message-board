const pool = require("./pool");

async function getAllMessages() {
  const { rows } = await pool.query(
    "SELECT id, username AS user, text, added FROM messages ORDER BY added DESC, id DESC",
  );
  return rows;
}

async function getMessageById(id) {
  const { rows } = await pool.query(
    "SELECT id, username AS user, text, added FROM messages WHERE id = $1",
    [id],
  );
  return rows[0] || null;
}

async function createMessage({ user, text }) {
  const { rows } = await pool.query(
    "INSERT INTO messages (username, text) VALUES ($1, $2) RETURNING id, username AS user, text, added",
    [user, text],
  );
  return rows[0];
}

module.exports = {
  getAllMessages,
  getMessageById,
  createMessage,
};
