const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands      = new Collection();
client.slashCommands = new Collection();
client.PREFIX        = '+';
client.OWNERS        = ['1222217828770516992', '1371573736054194356'];
client.INVITE        = 'discord.gg/szailand';

// ── Charger les commandes ──────────────────────────────────────────────────────
function loadCommand(cmd) {
  if (!cmd || typeof cmd !== 'object') return;
  if (cmd.name) {
    client.commands.set(cmd.name, cmd);
    if (cmd.aliases) cmd.aliases.forEach(a => client.commands.set(a, cmd));
  }
  if (cmd.data) client.slashCommands.set(cmd.data.name, cmd);
}

const cmdFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of cmdFolders) {
  const files = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = require(path.join(__dirname, 'commands', folder, file));
    if (mod.name || mod.data) loadCommand(mod);
    else for (const key of Object.keys(mod)) loadCommand(mod[key]);
  }
}

console.log(`[BOT] 📦 ${client.commands.size} commandes | ${client.slashCommands.size} slash`);

// ── Charger les events ────────────────────────────────────────────────────────
const evtFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of evtFiles) {
  const evt = require(path.join(__dirname, 'events', file));
  if (evt.once) client.once(evt.name, (...a) => evt.execute(...a, client));
  else client.on(evt.name, (...a) => evt.execute(...a, client));
}

client.login(process.env.TOKEN);
