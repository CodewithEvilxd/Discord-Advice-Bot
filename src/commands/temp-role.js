const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addTempRole } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temp-role')
    .setDescription('Assign a temporary role to a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to assign the role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1h, 30m, 2d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the temporary role')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const guild = interaction.guild;
    const member = await guild.members.fetch(user.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot assign a role that is higher than or equal to my highest role.', ephemeral: true });
    }

    // Parse duration
    const durationMs = parseDuration(duration);
    if (!durationMs) {
      return interaction.reply({ content: 'Invalid duration format. Use formats like: 1h, 30m, 2d, 1w', ephemeral: true });
    }

    const expiresAt = new Date(Date.now() + durationMs);

    try {
      await member.roles.add(role);

      addTempRole(user.id, role.id, guild.id, expiresAt.toISOString(), reason);

      await interaction.reply({
        content: `✅ Temporary role ${role.name} assigned to ${user.tag} for ${duration}.\nExpires: ${expiresAt.toLocaleString()}\nReason: ${reason}`,
        ephemeral: true
      });

      logger.info(`Temp role ${role.name} assigned to ${user.tag} by ${interaction.user.tag} for ${duration}`);
    } catch (error) {
      logger.error('Error assigning temp role:', error);
      await interaction.reply({ content: 'An error occurred while assigning the temporary role.', ephemeral: true });
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