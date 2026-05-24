const fs   = require('fs');
const path = require('path');

const WARNS_DB  = path.join(__dirname, '../data/warns.json');
const MUTES_DB  = path.join(__dirname, '../data/mutes.json');
const NOTES_DB  = path.join(__dirname, '../data/notes.json');

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '{}');
  }
}

// ── WARNS ─────────────────────────────────────────────────────────────────────
function getWarns(guildId, userId) {
  ensureFile(WARNS_DB);
  const db = JSON.parse(fs.readFileSync(WARNS_DB, 'utf8'));
  return db[guildId]?.[userId] || [];
}

function addWarn(guildId, userId, reason, moderatorId) {
  ensureFile(WARNS_DB);
  const db = JSON.parse(fs.readFileSync(WARNS_DB, 'utf8'));
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId][userId]) db[guildId][userId] = [];
  const warn = { id: Date.now(), reason, moderatorId, date: new Date().toISOString() };
  db[guildId][userId].push(warn);
  fs.writeFileSync(WARNS_DB, JSON.stringify(db, null, 2));
  return warn;
}

function clearWarns(guildId, userId) {
  ensureFile(WARNS_DB);
  const db = JSON.parse(fs.readFileSync(WARNS_DB, 'utf8'));
  if (db[guildId]) delete db[guildId][userId];
  fs.writeFileSync(WARNS_DB, JSON.stringify(db, null, 2));
}

function removeWarn(guildId, userId, warnId) {
  ensureFile(WARNS_DB);
  const db = JSON.parse(fs.readFileSync(WARNS_DB, 'utf8'));
  if (!db[guildId]?.[userId]) return false;
  const before = db[guildId][userId].length;
  db[guildId][userId] = db[guildId][userId].filter(w => w.id !== Number(warnId));
  fs.writeFileSync(WARNS_DB, JSON.stringify(db, null, 2));
  return db[guildId][userId].length < before;
}

// ── NOTES ─────────────────────────────────────────────────────────────────────
function getNotes(guildId, userId) {
  ensureFile(NOTES_DB);
  const db = JSON.parse(fs.readFileSync(NOTES_DB, 'utf8'));
  return db[guildId]?.[userId] || [];
}

function addNote(guildId, userId, note, modId) {
  ensureFile(NOTES_DB);
  const db = JSON.parse(fs.readFileSync(NOTES_DB, 'utf8'));
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId][userId]) db[guildId][userId] = [];
  const entry = { id: Date.now(), note, modId, date: new Date().toISOString() };
  db[guildId][userId].push(entry);
  fs.writeFileSync(NOTES_DB, JSON.stringify(db, null, 2));
  return entry;
}

// ── MUTES ─────────────────────────────────────────────────────────────────────
function getMutes() {
  ensureFile(MUTES_DB);
  return JSON.parse(fs.readFileSync(MUTES_DB, 'utf8'));
}

function addMute(guildId, userId, until) {
  ensureFile(MUTES_DB);
  const db = getMutes();
  if (!db[guildId]) db[guildId] = {};
  db[guildId][userId] = until;
  fs.writeFileSync(MUTES_DB, JSON.stringify(db, null, 2));
}

function removeMute(guildId, userId) {
  ensureFile(MUTES_DB);
  const db = getMutes();
  if (db[guildId]) delete db[guildId][userId];
  fs.writeFileSync(MUTES_DB, JSON.stringify(db, null, 2));
}

module.exports = { getWarns, addWarn, clearWarns, removeWarn, getNotes, addNote, getMutes, addMute, removeMute };
