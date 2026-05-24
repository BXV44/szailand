const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits,
} = require('discord.js');
const { getTicketConfig, setTicketConfig, addTicket, getTicket, closeTicket, deleteTicketData } = require('../../utils/config');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');
const { checkAccess, noAccessEmbed, isOwner } = require('../../utils/permissions');

const INVITE = 'discord.gg/szailand';

// ── SETUP TICKETS ─────────────────────────────────────────────────────────────
const setupticket = {
  name: 'setupticket',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('setupticket')
    .setDescription('Configurer le système de tickets')
    .addSubcommand(s => s
      .setName('panel')
      .setDescription('Créer le panel de tickets dans un salon')
      .addChannelOption(o => o.setName('salon').setDescription('Salon du panel').setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addChannelOption(o => o.setName('category').setDescription('Catégorie où créer les tickets').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
      .addRoleOption(o => o.setName('support').setDescription('Rôle du support').setRequired(true))
      .addStringOption(o => o.setName('titre').setDescription('Titre du panel').setRequired(false))
      .addStringOption(o => o.setName('description').setDescription('Description du panel').setRequired(false))
      .addStringOption(o => o.setName('gif').setDescription('GIF/image pour le panel (URL directe)').setRequired(false))
    )
    .addSubcommand(s => s
      .setName('info')
      .setDescription('Voir la config actuelle des tickets')
    )
    .addSubcommand(s => s
      .setName('disable')
      .setDescription('Désactiver les tickets')
    ),

  async execute(ctx, args, client) {
    if (!ctx.isChatInputCommand) return ctx.reply({ embeds: [errorEmbed('Utilise `/setupticket`.')] });

    const access = checkAccess(ctx, true);
    if (!access.allowed) return ctx.reply({ embeds: [noAccessEmbed(access.reason)], ephemeral: true });

    const sub   = ctx.options.getSubcommand();
    const guild = ctx.guild;

    if (sub === 'panel') {
      const panelChan   = ctx.options.getChannel('salon');
      const category    = ctx.options.getChannel('category');
      const supportRole = ctx.options.getRole('support');
      const titre       = ctx.options.getString('titre') || '🎫 Support – Ouvre un ticket';
      const description = ctx.options.getString('description') ||
        'Clique sur le bouton ci-dessous pour ouvrir un ticket.\nNotre équipe te répondra dès que possible.\n\n🔗 **discord.gg/szailand**';
      const gif = ctx.options.getString('gif') || null;

      // Sauvegarder config
      setTicketConfig(guild.id, {
        enabled:      true,
        panelChanId:  panelChan.id,
        categoryId:   category.id,
        supportRoleId: supportRole.id,
        logChanId:    guild.channels.cache.find(c => c.name === 'ticket-logs' || c.name === 'mod-logs')?.id || null,
      });

      // Créer l'embed du panel
      const panelEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(titre)
        .setDescription(description)
        .setFooter({ text: INVITE })
        .setTimestamp();

      if (gif) panelEmbed.setImage(gif);

      // Menu de catégories
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_category')
        .setPlaceholder('📋 Sélectionne une catégorie...')
        .addOptions([
          { label: '❓ Support Général', description: 'Une question générale', value: 'general', emoji: '❓' },
          { label: '🐛 Report de Bug', description: 'Signaler un problème', value: 'bug', emoji: '🐛' },
          { label: '💡 Suggestion', description: 'Proposer une idée', value: 'suggestion', emoji: '💡' },
          { label: '🤝 Partenariat', description: 'Proposer un partenariat', value: 'partnership', emoji: '🤝' },
          { label: '🔨 Report', description: 'Signaler un membre', value: 'report', emoji: '🔨' },
          { label: '💰 Achat/Commande', description: 'Passer une commande', value: 'purchase', emoji: '💰' },
        ]);

      const openBtn = new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('📩 Ouvrir un ticket')
        .setStyle(ButtonStyle.Primary);

      const row1 = new ActionRowBuilder().addComponents(selectMenu);
      const row2 = new ActionRowBuilder().addComponents(openBtn);

      await panelChan.send({ embeds: [panelEmbed], components: [row1, row2] });
      ctx.reply({ embeds: [successEmbed('Panel créé !', `Panel de tickets créé dans ${panelChan}.\n**Catégorie :** ${category}\n**Support :** ${supportRole}${gif ? '\n**GIF :** ✅' : ''}`)], ephemeral: true });
    }

    else if (sub === 'info') {
      const cfg = getTicketConfig(guild.id);
      if (!cfg) return ctx.reply({ embeds: [infoEmbed('Tickets', '❌ Aucun système de ticket configuré.')] });
      ctx.reply({ embeds: [infoEmbed('Config Tickets', [
        `**Statut :** ${cfg.enabled ? '✅ Actif' : '❌ Inactif'}`,
        `**Salon panel :** <#${cfg.panelChanId}>`,
        `**Catégorie :** <#${cfg.categoryId}>`,
        `**Rôle support :** <@&${cfg.supportRoleId}>`,
        `**Logs :** ${cfg.logChanId ? `<#${cfg.logChanId}>` : 'Non configuré'}`,
      ].join('\n'))], ephemeral: true });
    }

    else if (sub === 'disable') {
      setTicketConfig(guild.id, { enabled: false });
      ctx.reply({ embeds: [successEmbed('Tickets désactivés', 'Le système de ticket a été désactivé.')] });
    }
  },
};

// ── HANDLERS BOUTONS/SELECT ───────────────────────────────────────────────────

let selectedCategory = new Map(); // userId -> category

async function handleCategory(interaction, client) {
  const category = interaction.values[0];
  const labels   = { general: '❓ Support Général', bug: '🐛 Report de Bug', suggestion: '💡 Suggestion', partnership: '🤝 Partenariat', report: '🔨 Report', purchase: '💰 Achat/Commande' };
  selectedCategory.set(interaction.user.id, { value: category, label: labels[category] || category });
  await interaction.reply({ content: `✅ Catégorie sélectionnée : **${labels[category]}**\nClique maintenant sur **📩 Ouvrir un ticket**.`, ephemeral: true });
}

async function handleOpen(interaction, client) {
  const guild  = interaction.guild;
  const user   = interaction.user;
  const cfg    = getTicketConfig(guild.id);

  if (!cfg || !cfg.enabled) return interaction.reply({ content: '❌ Le système de ticket est désactivé.', ephemeral: true });

  // Vérif si déjà un ticket ouvert
  const existingChannel = guild.channels.cache.find(c => c.topic === `ticket-${user.id}` && c.parentId === cfg.categoryId);
  if (existingChannel) return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${existingChannel}`, ephemeral: true });

  const cat      = selectedCategory.get(user.id) || { value: 'general', label: '❓ Support Général' };
  const category = guild.channels.cache.get(cfg.categoryId);
  if (!category) return interaction.reply({ content: '❌ Catégorie introuvable.', ephemeral: true });

  await interaction.deferReply({ ephemeral: true });

  // Créer le salon ticket
  const ticketNum = guild.channels.cache.filter(c => c.parentId === cfg.categoryId).size + 1;
  const chanName  = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${ticketNum}`;

  const ticketChan = await guild.channels.create({
    name: chanName,
    type: ChannelType.GuildText,
    parent: cfg.categoryId,
    topic: `ticket-${user.id}`,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: cfg.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  addTicket(guild.id, ticketChan.id, user.id, cat.label);

  // Boutons dans le ticket
  const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 Fermer').setStyle(ButtonStyle.Danger);
  const claimBtn = new ButtonBuilder().setCustomId('ticket_claim').setLabel('✋ Claim').setStyle(ButtonStyle.Success);
  const row = new ActionRowBuilder().addComponents(closeBtn, claimBtn);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🎫 Ticket – ${cat.label}`)
    .setDescription([
      `Bienvenue <@${user.id}> !`,
      ``,
      `📋 **Catégorie :** ${cat.label}`,
      `👤 **Ouvert par :** ${user.tag}`,
      ``,
      `Décris ton problème et notre équipe (<@&${cfg.supportRoleId}>) te répondra dès que possible.`,
      ``,
      `🔗 **discord.gg/szailand**`,
    ].join('\n'))
    .setFooter({ text: INVITE })
    .setTimestamp();

  await ticketChan.send({ content: `<@${user.id}> <@&${cfg.supportRoleId}>`, embeds: [embed], components: [row] });

  // Log
  if (cfg.logChanId) {
    const logChan = guild.channels.cache.get(cfg.logChanId);
    logChan?.send({ embeds: [new EmbedBuilder().setColor(0x00FF88).setTitle('📩 Ticket ouvert').addFields(
      { name: 'Utilisateur', value: `<@${user.id}> (${user.tag})`, inline: true },
      { name: 'Catégorie', value: cat.label, inline: true },
      { name: 'Salon', value: `${ticketChan}`, inline: true },
    ).setTimestamp()] }).catch(() => {});
  }

  selectedCategory.delete(user.id);
  interaction.editReply({ content: `✅ Ton ticket a été créé : ${ticketChan}` });
}

async function handleClose(interaction, client) {
  const guild   = interaction.guild;
  const channel = interaction.channel;
  const ticket  = getTicket(guild.id, channel.id);
  const cfg     = getTicketConfig(guild.id);

  if (!ticket) return interaction.reply({ content: '❌ Ce n\'est pas un ticket valide.', ephemeral: true });
  if (ticket.status === 'closed') return interaction.reply({ content: '❌ Ce ticket est déjà fermé.', ephemeral: true });

  // Vérif permission (owner, support, ou l'auteur)
  const isSupport = interaction.member.roles.cache.has(cfg?.supportRoleId);
  const isAuthor  = ticket.userId === interaction.user.id;
  if (!isSupport && !isAuthor && !isOwner(interaction.user.id))
    return interaction.reply({ content: '❌ Tu ne peux pas fermer ce ticket.', ephemeral: true });

  closeTicket(guild.id, channel.id);

  // Retirer l'accès à l'auteur
  await channel.permissionOverwrites.edit(ticket.userId, { SendMessages: false }).catch(() => {});

  const deleteBtn = new ButtonBuilder().setCustomId('ticket_delete').setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder().addComponents(deleteBtn);

  const embed = new EmbedBuilder()
    .setColor(0xFF4444)
    .setTitle('🔒 Ticket fermé')
    .setDescription(`Ticket fermé par <@${interaction.user.id}>.\nUtilise le bouton pour supprimer définitivement.`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], components: [row] });

  // Log
  if (cfg?.logChanId) {
    const logChan = guild.channels.cache.get(cfg.logChanId);
    logChan?.send({ embeds: [new EmbedBuilder().setColor(0xFF4444).setTitle('🔒 Ticket fermé').addFields(
      { name: 'Fermé par', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Salon', value: channel.name, inline: true },
    ).setTimestamp()] }).catch(() => {});
  }
}

async function handleDelete(interaction, client) {
  const guild   = interaction.guild;
  const channel = interaction.channel;
  const cfg     = getTicketConfig(guild.id);
  const isSupport = interaction.member.roles.cache.has(cfg?.supportRoleId);
  if (!isSupport && !isOwner(interaction.user.id))
    return interaction.reply({ content: '❌ Seul le support peut supprimer le ticket.', ephemeral: true });

  await interaction.reply({ content: '🗑️ Suppression dans 3 secondes...' });
  deleteTicketData(guild.id, channel.id);
  setTimeout(() => channel.delete().catch(() => {}), 3000);
}

async function handleClaim(interaction, client) {
  const guild   = interaction.guild;
  const cfg     = getTicketConfig(guild.id);
  const isSupport = interaction.member.roles.cache.has(cfg?.supportRoleId);
  if (!isSupport && !isOwner(interaction.user.id))
    return interaction.reply({ content: '❌ Seul le support peut claim un ticket.', ephemeral: true });

  await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
    ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
  });

  interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00FF88).setDescription(`✋ Ticket claim par <@${interaction.user.id}>.`).setTimestamp()] });
}

module.exports = { setupticket, handleOpen, handleClose, handleDelete, handleClaim, handleCategory };
