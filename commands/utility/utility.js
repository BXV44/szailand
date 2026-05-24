const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { infoEmbed } = require('../../utils/embeds');
const INVITE = 'discord.gg/szailand';

const help = {
  name: 'help',
  aliases: ['aide'],
  requireMod: false,
  data: new SlashCommandBuilder().setName('help').setDescription('Voir toutes les commandes'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Commandes – SzailandBot V2')
      .setDescription(`Préfixe: \`${client.PREFIX}\` | Slash: \`/\`\n🔗 **${INVITE}**`)
      .addFields(
        {
          name: '🎫 Tickets',
          value: [
            '`/setupticket panel` – Créer le panel de tickets',
            '`/setupticket info` – Voir la config',
            '`/setupticket disable` – Désactiver',
            '',
            'Dans un ticket (boutons) :',
            '`🔒 Fermer` – Fermer le ticket',
            '`✋ Claim` – Prendre en charge',
            '`🗑️ Supprimer` – Supprimer le salon',
          ].join('\n'),
        },
        {
          name: '👋 Welcome',
          value: [
            '`/setwelcome setup` – Configurer le welcome',
            '`/setwelcome test` – Tester le message',
            '`/setwelcome info` – Voir la config',
            '`/setwelcome disable` – Désactiver',
            '',
            '**Variables disponibles :**',
            '`{user}` `{username}` `{server}` `{count}` `{tag}`',
          ].join('\n'),
        },
        {
          name: '🎲 Ping Aléatoire',
          value: [
            '`/setpingchannels add` – Ajouter un salon',
            '`/setpingchannels remove` – Retirer un salon',
            '`/setpingchannels list` – Voir la liste',
            '`/setpingchannels clear` – Tout vider',
            '',
            'Quand quelqu\'un rejoint, un message est envoyé dans un salon aléatoire parmi la liste.',
          ].join('\n'),
        },
        {
          name: 'ℹ️ Utilitaires',
          value: '`/help` – Cette aide\n`/ping` – Latence du bot',
        },
      )
      .setFooter({ text: `${INVITE} | Licence requise pour utiliser le bot` })
      .setTimestamp();

    isSlash ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  },
};

const ping = {
  name: 'ping',
  requireMod: false,
  data: new SlashCommandBuilder().setName('ping').setDescription('Latence du bot'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const embed = new EmbedBuilder()
      .setColor(0x00FF88)
      .setTitle('🏓 Pong!')
      .addFields({ name: '⚡ Latence', value: `${client.ws.ping}ms`, inline: true })
      .setFooter({ text: INVITE }).setTimestamp();
    isSlash ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  },
};

module.exports = { help, ping };
