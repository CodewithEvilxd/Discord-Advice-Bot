const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addTempBan } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temp-ban')
    .setDescription('Temporarily ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to temporarily ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 30m, 2h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the temporary ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: 'You cannot ban yourself.', ephemeral: true });
    }

    if (user.id === interaction.guild.ownerId) {
      return interaction.reply({ content: 'You cannot ban the server owner.', ephemeral: true });
    }

    // Parse duration
    const durationMs = parseDuration(duration);
    if (!durationMs) {
      return interaction.reply({ content: 'Invalid duration format. Use formats like: 30m, 2h, 1d, 1w', ephemeral: true });
    }

    try {
      // Ban the user
      await guild.members.ban(user, { reason: `Temp ban: ${reason}` });

      // Record the temp ban
      addTempBan(user.id, guild.id, reason, Math.floor(durationMs / (1000 * 60)), interaction.user.id);

      await interaction.reply({
        content: `✅ **Temporary Ban Applied**\nUser: ${user.tag}\nDuration: ${duration}\nReason: ${reason}\nWill be unbanned automatically.`,
        ephemeral: true
      });

      logger.info(`Temp banned ${user.tag} for ${duration} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error applying temp ban:', error);
      await interaction.reply({ content: 'An error occurred while applying the temporary ban.', ephemeral: true });
    }
  },
};

function parseDuration(duration) {
  const regex = /^(\d+)([smhdw])$/;
  const match = duration.toLowerCase().match(regex);

  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,           // seconds
    m: 60 * 1000,      // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
    w: 7 * 24 * 60 * 60 * 1000 // weeks
  };

  return value * multipliers[unit];
}