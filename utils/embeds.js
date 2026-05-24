const { EmbedBuilder } = require('discord.js');
const INVITE = 'discord.gg/szailand';

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x00FF88)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setFooter({ text: INVITE })
    .setTimestamp();
}

function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(0xFF4444)
    .setTitle('❌ Erreur')
    .setDescription(description)
    .setFooter({ text: INVITE })
    .setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setFooter({ text: INVITE })
    .setTimestamp();
}

function warnEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0xFFAA00)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setFooter({ text: INVITE })
    .setTimestamp();
}

module.exports = { successEmbed, errorEmbed, infoEmbed, warnEmbed };
