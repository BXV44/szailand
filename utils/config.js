const fs   = require('fs');
const path = require('path');

const CONFIG_DB  = path.join(__dirname, '../data/config.json');
const WELCOME_DB = path.join(__dirname, '../data/welcome.json');
const TICKETS_DB = path.join(__dirname, '../data/tickets.json');

function ensureFile(p, def = '{}') {
  if (!fs.existsSync(p)) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, def); }
}

// ── CONFIG (paramètres généraux par guild) ────────────────────────────────────
function getConfig(guildId) {
  ensureFile(CONFIG_DB);
  const db = JSON.parse(fs.readFileSync(CONFIG_DB, 'utf8'));
  return db[guildId] || {};
}
function setConfig(guildId, data) {
  ensureFile(CONFIG_DB);
  const db = JSON.parse(fs.readFileSync(CONFIG_DB, 'utf8'));
  db[guildId] = { ...(db[guildId] || {}), ...data };
  fs.writeFileSync(CONFIG_DB, JSON.stringify(db, null, 2));
}

// ── WELCOME CONFIG ────────────────────────────────────────────────────────────
function getWelcome(guildId) {
  ensureFile(WELCOME_DB);
  const db = JSON.parse(fs.readFileSync(WELCOME_DB, 'utf8'));
  return db[guildId] || null;
}
function setWelcome(guildId, data) {
  ensureFile(WELCOME_DB);
  const db = JSON.parse(fs.readFileSync(WELCOME_DB, 'utf8'));
  db[guildId] = { ...(db[guildId] || {}), ...data };
  fs.writeFileSync(WELCOME_DB, JSON.stringify(db, null, 2));
}
function disableWelcome(guildId) {
  ensureFile(WELCOME_DB);
  const db = JSON.parse(fs.readFileSync(WELCOME_DB, 'utf8'));
  delete db[guildId];
  fs.writeFileSync(WELCOME_DB, JSON.stringify(db, null, 2));
}

// ── TICKETS ───────────────────────────────────────────────────────────────────
function getTickets(guildId) {
  ensureFile(TICKETS_DB);
  const db = JSON.parse(fs.readFileSync(TICKETS_DB, 'utf8'));
  return db[guildId] || {};
}
function setTicketConfig(guildId, data) {
  ensureFile(TICKETS_DB);
  const db = JSON.parse(fs.readFileSync(TICKETS_DB, 'utf8'));
  if (!db[guildId]) db[guildId] = {};
  db[guildId].config = { ...(db[guildId].config || {}), ...data };
  fs.writeFileSync(TICKETS_DB, JSON.stringify(db, null, 2));
}
function getTicketConfig(guildId) {
  const data = getTickets(guildId);
  return data.config || null;
}
function addTicket(guildId, channelId, userId, subject) {
  ensureFile(TICKETS_DB);
  const db = JSON.parse(fs.readFileSync(TICKETS_DB, 'utf8'));
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId].tickets) db[guildId].tickets = {};
  db[guildId].tickets[channelId] = { userId, subject, createdAt: new Date().toISOString(), status: 'open' };
  fs.writeFileSync(TICKETS_DB, JSON.stringify(db, null, 2));
}
function getTicket(guildId, channelId) {
  const data = getTickets(guildId);
  return data.tickets?.[channelId] || null;
}
function closeTicket(guildId, channelId) {
  ensureFile(TICKETS_DB);
  const db = JSON.parse(fs.readFileSync(TICKETS_DB, 'utf8'));
  if (db[guildId]?.tickets?.[channelId]) {
    db[guildId].tickets[channelId].status = 'closed';
    db[guildId].tickets[channelId].closedAt = new Date().toISOString();
  }
  fs.writeFileSync(TICKETS_DB, JSON.stringify(db, null, 2));
}
function deleteTicketData(guildId, channelId) {
  ensureFile(TICKETS_DB);
  const db = JSON.parse(fs.readFileSync(TICKETS_DB, 'utf8'));
  if (db[guildId]?.tickets) delete db[guildId].tickets[channelId];
  fs.writeFileSync(TICKETS_DB, JSON.stringify(db, null, 2));
}

module.exports = {
  getConfig, setConfig,
  getWelcome, setWelcome, disableWelcome,
  getTicketConfig, setTicketConfig, addTicket, getTicket, closeTicket, deleteTicketData,
};
