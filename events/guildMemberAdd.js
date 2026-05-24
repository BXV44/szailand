const { EmbedBuilder } = require('discord.js');
const { getWelcome, getConfig } = require('../utils/config');

// Anti-raid tracker
const joinLog = new Map();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const guild = member.guild;

    // ── Anti-Raid ─────────────────────────────────────────────────────────────
    const now    = Date.now();
    const record = (joinLog.get(guild.id) || []).filter(t => now - t < 10_000);
    record.push(now);
    joinLog.set(guild.id, record);
    if (record.length >= 8) {
      const logChan = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
      logChan?.send({ embeds: [new EmbedBuilder().setColor(0xFF0000).setTitle('🚨 RAID DÉTECTÉ').setDescription(`**${record.length}** membres ont rejoint en moins de 10 secondes!`).setTimestamp()] }).catch(() => {});
    }

    // ── PING ALÉATOIRE + DELETE 3s ────────────────────────────────────────────
    const cfg = getConfig(guild.id);
    if (cfg.randomPingChannels && cfg.randomPingChannels.length > 0) {
      const randomId   = cfg.randomPingChannels[Math.floor(Math.random() * cfg.randomPingChannels.length)];
      const randomChan = guild.channels.cache.get(randomId);
      if (randomChan) {
        const pingMessages = [
          `👀 <@${member.id}> vient d'atterrir sur le serveur, quelqu'un pour l'accueillir ?`,
          `🎉 Nouveau membre détecté : <@${member.id}> ! Dites-lui bonjour !`,
          `👋 <@${member.id}> a rejoint l'aventure. Bienvenue !`,
          `🔥 <@${member.id}> est là. Le serveur vient de monter de niveau.`,
          `😏 Tiens tiens, <@${member.id}> a décidé de nous rejoindre...`,
          `🚀 <@${member.id}> a débarqué. Bienvenue parmi nous !`,
          `💀 <@${member.id}> a osé rejoindre **${guild.name}**. Respect.`,
          `🌟 <@${member.id}> vient d'arriver, faites de la place !`,
          `🫡 <@${member.id}> est dans la place !`,
          `⚡ <@${member.id}> a spawn sur le serveur !`,
        ];
        const msg = pingMessages[Math.floor(Math.random() * pingMessages.length)];

        // Envoyer puis supprimer après 3 secondes
        randomChan.send(msg)
          .then(sentMsg => setTimeout(() => sentMsg.delete().catch(() => {}), 3000))
          .catch(() => {});
      }
    }

    // ── MESSAGE DE BIENVENUE ──────────────────────────────────────────────────
    const welcomeCfg = getWelcome(guild.id);
    if (!welcomeCfg || !welcomeCfg.enabled) return;

    const chan = guild.channels.cache.get(welcomeCfg.channelId);
    if (!chan) return;

    const rawMsg = (welcomeCfg.message || 'Bienvenue {user} sur **{server}** !')
      .replace(/{user}/g,     `<@${member.id}>`)
      .replace(/{username}/g, member.user.username)
      .replace(/{server}/g,   guild.name)
      .replace(/{count}/g,    guild.memberCount)
      .replace(/{tag}/g,      member.user.tag);

    const embed = new EmbedBuilder()
      .setColor(welcomeCfg.color || 0x5865F2)
      .setTitle(welcomeCfg.title || `👋 Bienvenue sur ${guild.name} !`)
      .setDescription(rawMsg)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: `Membre #${guild.memberCount} · discord.gg/szailand` })
      .setTimestamp();

    if (welcomeCfg.imageUrl) embed.setImage(welcomeCfg.imageUrl);

    // Auto-rôle
    if (welcomeCfg.autoroleId) {
      const role = guild.roles.cache.get(welcomeCfg.autoroleId);
      if (role) member.roles.add(role).catch(() => {});
    }

    const content = welcomeCfg.pingUser ? `<@${member.id}>` : undefined;

    // Welcome : envoyer et supprimer après 3 secondes si configuré
    chan.send({ content, embeds: [embed] })
      .then(sentMsg => {
        if (welcomeCfg.autoDelete) {
          setTimeout(() => sentMsg.delete().catch(() => {}), 3000);
        }
      })
      .catch(() => {});
  },
};
