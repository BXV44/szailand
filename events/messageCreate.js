const { isOwner } = require('../utils/permissions');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.PREFIX)) return;

    const args    = message.content.slice(client.PREFIX.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);
    if (!command) return;

    if (command.ownerOnly && !isOwner(message.author.id))
      return message.reply('🔒 Commande réservée aux owners.');

    if (command.requireMod) {
      const hasPerm = message.member?.permissions?.has('BanMembers') ||
                      message.member?.permissions?.has('ManageGuild');
      if (!hasPerm) return message.reply('🚫 Tu n\'as pas les permissions nécessaires.');
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[CMD] ${cmdName}:`, err);
      message.reply('❌ Erreur lors de l\'exécution.').catch(() => {});
    }
  },
};
