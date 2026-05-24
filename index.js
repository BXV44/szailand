const { Client, GatewayIntentBits, Collection } = require('discord.js');

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.log("❌ TOKEN manquant");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const fs = require("fs");
const path = require("path");

// load commands
for (const folder of fs.readdirSync("./commands")) {
  for (const file of fs.readdirSync("./commands/" + folder)) {
    const cmd = require("./commands/" + folder + "/" + file);
    client.commands.set(cmd.name, cmd);
  }
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(/ +/);
  const cmdName = args.shift();

  const cmd = client.commands.get(cmdName);
  if (!cmd) return;

  cmd.run(client, message, args);
});

client.login(TOKEN);