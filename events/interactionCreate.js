const { isOwner } = require('../utils/permissions');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      if (command.ownerOnly && !isOwner(interaction.user.id))
        return interaction.reply({ content: '🔒 Commande réservée aux owners.', ephemeral: true });

      if (command.requireMod) {
        const hasPerm = interaction.member?.permissions?.has('BanMembers') ||
                        interaction.member?.permissions?.has('ManageGuild');
        if (!hasPerm) return interaction.reply({ content: '🚫 Tu n\'as pas les permissions nécessaires.', ephemeral: true });
      }

      try {
        await command.execute(interaction, [], client);
      } catch (err) {
        console.error(`[SLASH] ${interaction.commandName}:`, err);
        const r = { content: '❌ Erreur.', ephemeral: true };
        interaction.replied || interaction.deferred ? interaction.followUp(r) : interaction.reply(r);
      }
    }

    // Boutons
    if (interaction.isButton()) {
      const [action] = interaction.customId.split(':');
      if (action === 'ticket_open')   { const t = require('../commands/tickets/tickets'); await t.handleOpen(interaction, client); }
      if (action === 'ticket_close')  { const t = require('../commands/tickets/tickets'); await t.handleClose(interaction, client); }
      if (action === 'ticket_delete') { const t = require('../commands/tickets/tickets'); await t.handleDelete(interaction, client); }
      if (action === 'ticket_claim')  { const t = require('../commands/tickets/tickets'); await t.handleClaim(interaction, client); }
    }

    // Select menus
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_category') {
        const t = require('../commands/tickets/tickets');
        await t.handleCategory(interaction, client);
      }
    }
  },
};
