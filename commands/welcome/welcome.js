const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { setWelcome, getWelcome, disableWelcome, setConfig, getConfig } = require('../../utils/config');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');
const { checkAccess, noAccessEmbed } = require('../../utils/permissions');

const INVITE = 'discord.gg/szailand';

// ── SETWELCOME ────────────────────────────────────────────────────────────────
const setwelcome = {
  name: 'setwelcome',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Configurer le message de bienvenue')
    .addSubcommand(s => s
      .setName('setup')
      .setDescription('Activer et configurer le welcome')
      .addChannelOption(o => o.setName('salon').setDescription('Salon de bienvenue').setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName('message').setDescription('Message ({user} {username} {server} {count})').setRequired(false))
      .addStringOption(o => o.setName('titre').setDescription('Titre de l\'embed').setRequired(false))
      .addStringOption(o => o.setName('couleur').setDescription('Couleur hex (ex: #FF0000)').setRequired(false))
      .addStringOption(o => o.setName('gif').setDescription('URL du GIF/image à afficher (lien direct)').setRequired(false))
      .addRoleOption(o => o.setName('autorole').setDescription('Rôle automatique à l\'arrivée').setRequired(false))
      .addBooleanOption(o => o.setName('ping').setDescription('Ping le nouveau membre ?').setRequired(false))
      .addBooleanOption(o => o.setName('autodelete').setDescription('Supprimer le welcome après 3s ?').setRequired(false))
    )
    .addSubcommand(s => s
      .setName('disable')
      .setDescription('Désactiver le message de bienvenue')
    )
    .addSubcommand(s => s
      .setName('test')
      .setDescription('Tester le message de bienvenue avec toi-même')
    )
    .addSubcommand(s => s
      .setName('info')
      .setDescription('Voir la configuration actuelle')
    ),

  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    if (!isSlash) return ctx.reply({ embeds: [errorEmbed('Utilise `/setwelcome` pour configurer.')] });

    const access = checkAccess(ctx, true);
    if (!access.allowed) return ctx.reply({ embeds: [noAccessEmbed(access.reason)], ephemeral: true });

    const sub   = ctx.options.getSubcommand();
    const guild = ctx.guild;

    // ── SETUP ──────────────────────────────────────────────────────────────────
    if (sub === 'setup') {
      const channel   = ctx.options.getChannel('salon');
      const message   = ctx.options.getString('message') || 'Bienvenue {user} sur **{server}** ! Tu es le membre **#{count}** 🎉';
      const title     = ctx.options.getString('titre') || `👋 Bienvenue sur ${guild.name} !`;
      const color     = ctx.options.getString('couleur') || '#5865F2';
      const gif       = ctx.options.getString('gif') || null;
      const autorole  = ctx.options.getRole('autorole') || null;
      const pingUser   = ctx.options.getBoolean('ping') ?? true;
      const autoDelete = ctx.options.getBoolean('autodelete') ?? false;

      setWelcome(guild.id, {
        enabled:    true,
        channelId:  channel.id,
        message,
        title,
        color,
        imageUrl:   gif,
        autoroleId: autorole?.id || null,
        pingUser,
        autoDelete,
      });

      const preview = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(message.replace(/{user}/g, `<@${ctx.user.id}>`).replace(/{username}/g, ctx.user.username).replace(/{server}/g, guild.name).replace(/{count}/g, guild.memberCount))
        .setThumbnail(ctx.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Membre #${guild.memberCount} · ${INVITE}` })
        .setTimestamp();

      if (gif) preview.setImage(gif);

      await ctx.reply({
        embeds: [
          successEmbed('Welcome configuré !',
            `**Salon :** ${channel}\n**Ping :** ${pingUser ? 'Oui' : 'Non'}\n**Auto-delete :** ${autoDelete ? '✅ 3s' : 'Non'}${autorole ? `\n**Auto-rôle :** ${autorole}` : ''}${gif ? `\n**GIF :** ✅` : ''}\n\n**Aperçu ci-dessous :**`
          ),
          preview,
        ]
      });
    }

    // ── DISABLE ────────────────────────────────────────────────────────────────
    else if (sub === 'disable') {
      disableWelcome(guild.id);
      ctx.reply({ embeds: [successEmbed('Welcome désactivé', 'Le message de bienvenue a été désactivé.')] });
    }

    // ── TEST ───────────────────────────────────────────────────────────────────
    else if (sub === 'test') {
      const cfg = getWelcome(guild.id);
      if (!cfg) return ctx.reply({ embeds: [errorEmbed('Aucun welcome configuré. Utilise `/setwelcome setup` d\'abord.')] });

      const chan = guild.channels.cache.get(cfg.channelId);
      if (!chan) return ctx.reply({ embeds: [errorEmbed('Le salon configuré n\'existe plus.')] });

      const rawMsg = (cfg.message || 'Bienvenue {user} !')
        .replace(/{user}/g, `<@${ctx.user.id}>`)
        .replace(/{username}/g, ctx.user.username)
        .replace(/{server}/g, guild.name)
        .replace(/{count}/g, guild.memberCount)
        .replace(/{tag}/g, ctx.user.tag);

      const embed = new EmbedBuilder()
        .setColor(cfg.color || 0x5865F2)
        .setTitle(cfg.title || `👋 Bienvenue sur ${guild.name} !`)
        .setDescription(rawMsg)
        .setThumbnail(ctx.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Membre #${guild.memberCount} · ${INVITE}` })
        .setTimestamp();

      if (cfg.imageUrl) embed.setImage(cfg.imageUrl);

      await chan.send({ content: cfg.pingUser ? `<@${ctx.user.id}>` : undefined, embeds: [embed] });
      ctx.reply({ embeds: [successEmbed('Test envoyé !', `Message de test envoyé dans ${chan}.`)], ephemeral: true });
    }

    // ── INFO ───────────────────────────────────────────────────────────────────
    else if (sub === 'info') {
      const cfg = getWelcome(guild.id);
      if (!cfg) return ctx.reply({ embeds: [infoEmbed('Welcome', '❌ Aucun welcome configuré.')] });

      const chan = guild.channels.cache.get(cfg.channelId);
      ctx.reply({
        embeds: [infoEmbed('Configuration Welcome', [
          `**Statut :** ${cfg.enabled ? '✅ Actif' : '❌ Inactif'}`,
          `**Salon :** ${chan || `\`${cfg.channelId}\``}`,
          `**Ping :** ${cfg.pingUser ? 'Oui' : 'Non'}`,
          `**Auto-rôle :** ${cfg.autoroleId ? `<@&${cfg.autoroleId}>` : 'Aucun'}`,
          `**GIF :** ${cfg.imageUrl ? `[Voir](${cfg.imageUrl})` : 'Aucun'}`,
          `**Titre :** ${cfg.title}`,
          `**Message :** ${cfg.message}`,
        ].join('\n'))]
      });
    }
  },
};

// ── SETPINGCHANNELS (ping aléatoire) ─────────────────────────────────────────
const setpingchannels = {
  name: 'setpingchannels',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('setpingchannels')
    .setDescription('Configurer les salons pour le ping aléatoire quand quelqu\'un rejoint')
    .addSubcommand(s => s
      .setName('add')
      .setDescription('Ajouter un salon à la liste')
      .addChannelOption(o => o.setName('salon').setDescription('Salon à ajouter').setRequired(true).addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(s => s
      .setName('remove')
      .setDescription('Retirer un salon de la liste')
      .addChannelOption(o => o.setName('salon').setDescription('Salon à retirer').setRequired(true).addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(s => s
      .setName('list')
      .setDescription('Voir les salons configurés')
    )
    .addSubcommand(s => s
      .setName('clear')
      .setDescription('Supprimer tous les salons (désactiver le ping aléatoire)')
    ),

  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    if (!isSlash) return ctx.reply({ embeds: [errorEmbed('Utilise `/setpingchannels`.')] });

    const access = checkAccess(ctx, true);
    if (!access.allowed) return ctx.reply({ embeds: [noAccessEmbed(access.reason)], ephemeral: true });

    const sub   = ctx.options.getSubcommand();
    const guild = ctx.guild;
    const cfg   = getConfig(guild.id);
    const list  = cfg.randomPingChannels || [];

    if (sub === 'add') {
      const chan = ctx.options.getChannel('salon');
      if (list.includes(chan.id)) return ctx.reply({ embeds: [errorEmbed('Ce salon est déjà dans la liste.')] });
      list.push(chan.id);
      setConfig(guild.id, { randomPingChannels: list });
      ctx.reply({ embeds: [successEmbed('Salon ajouté', `${chan} ajouté à la liste des salons de ping aléatoire.\n\n**Total :** ${list.length} salon(s)`)] });
    }

    else if (sub === 'remove') {
      const chan = ctx.options.getChannel('salon');
      const newList = list.filter(id => id !== chan.id);
      if (newList.length === list.length) return ctx.reply({ embeds: [errorEmbed('Ce salon n\'est pas dans la liste.')] });
      setConfig(guild.id, { randomPingChannels: newList });
      ctx.reply({ embeds: [successEmbed('Salon retiré', `${chan} retiré de la liste.`)] });
    }

    else if (sub === 'list') {
      if (list.length === 0) return ctx.reply({ embeds: [infoEmbed('Ping Aléatoire', '❌ Aucun salon configuré.\nUtilise `/setpingchannels add` pour en ajouter.')] });
      const desc = list.map((id, i) => `**${i + 1}.** <#${id}>`).join('\n');
      ctx.reply({ embeds: [infoEmbed(`Salons de ping aléatoire (${list.length})`, desc)] });
    }

    else if (sub === 'clear') {
      setConfig(guild.id, { randomPingChannels: [] });
      ctx.reply({ embeds: [successEmbed('Liste vidée', 'Ping aléatoire désactivé.')] });
    }
  },
};

module.exports = { setwelcome, setpingchannels };
