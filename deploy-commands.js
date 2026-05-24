const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const commands = [];
function collectCmd(cmd) { if (cmd && cmd.data) commands.push(cmd.data.toJSON()); }

const folders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of folders) {
  const files = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = require(path.join(__dirname, 'commands', folder, file));
    if (mod.data) collectCmd(mod);
    else for (const k of Object.keys(mod)) collectCmd(mod[k]);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  console.log(`[DEPLOY] Déploiement de ${commands.length} slash commands...`);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log('[DEPLOY] ✅ Slash commands déployées!');
})().catch(console.error);
