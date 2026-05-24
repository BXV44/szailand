// ═══════════════════════════════════════════════════════════════
//  utils/permissions.js  –  Système de licences & permissions
// ═══════════════════════════════════════════════════════════════

const { EmbedBuilder } = require('discord.js');

const OWNERS = ['1222217828770516992', '1371573736054194356'];
const INVITE  = 'discord.gg/szailand';

// Serveurs ayant acheté/activé la licence (persisté dans licensed.json)
const fs   = require('fs');
const path = require('path');
const DB   = path.join(__dirname, '../data/licensed.json');

function loadLicensed() {
  if (!fs.existsSync(DB)) { fs.mkdirSync(path.dirname(DB), { recursive: true }); fs.writeFileSync(DB, '{}'); }
  return JSON.parse(fs.readFileSync(DB, 'utf8'));
}
function saveLicensed(data) { fs.writeFileSync(DB, JSON.stringify(data, null, 2)); }

function isLicensed(guildId) {
  const data = loadLicensed();
  return !!data[guildId];
}

function addLicense(guildId, addedBy) {
  const data = loadLicensed();
  data[guildId] = { addedBy, addedAt: new Date().toISOString() };
  saveLicensed(data);
}

function removeLicense(guildId) {
  const data = loadLicensed();
  delete data[guildId];
  saveLicensed(data);
}

function isOwner(userId) {
  return OWNERS.includes(userId);
}

// Vérification complète : owner bypass tout, sinon le serveur doit être licencié
function checkAccess(interaction, requireMod = false) {
  const userId  = interaction.user?.id || interaction.author?.id;
  const guildId = interaction.guildId || interaction.guild?.id;

  if (isOwner(userId)) return { allowed: true };

  if (!isLicensed(guildId)) {
    return {
      allowed: false,
      reason: `❌ **Ce serveur n'a pas de licence.**\nRejoinds **${INVITE}** pour activer le bot sur ce serveur.`,
    };
  }

  if (requireMod) {
    const member = interaction.member;
    const hasPerm = member?.permissions?.has('BanMembers') ||
                    member?.permissions?.has('KickMembers') ||
                    member?.permissions?.has('ManageMessages') ||
                    member?.permissions?.has('ManageGuild');
    if (!hasPerm) {
      return { allowed: false, reason: '🚫 Tu n\'as pas les permissions nécessaires pour cette commande.' };
    }
  }

  return { allowed: true };
}

function noAccessEmbed(reason) {
  return new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('🔒 Accès refusé')
    .setDescription(reason)
    .setFooter({ text: `Licence requise · ${INVITE}` });
}

module.exports = { isOwner, isLicensed, addLicense, removeLicense, checkAccess, noAccessEmbed, OWNERS, INVITE };
