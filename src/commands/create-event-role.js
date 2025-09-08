const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addEventRole } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-event-role')
    .setDescription('Create a temporary role for an event')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign for the event')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('event_name')
        .setDescription('Name of the event')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 2h, 1d, 1w)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const eventName = interaction.options.getString('event_name');
    const duration = interaction.options.getString('duration');
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot assign a role that is higher than or equal to my highest role.', ephemeral: true });
    }

    // Parse duration
    const durationMs = parseDuration(duration);
    if (!durationMs) {
      return interaction.reply({ content: 'Invalid duration format. Use formats like: 2h, 1d, 1w', ephemeral: true });
    }

    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    try {
      addEventRole(guild.id, role.id, eventName, expiresAt);

      await interaction.reply({
        content: `✅ Event role created!\nRole: ${role.name}\nEvent: ${eventName}\nExpires: ${new Date(expiresAt).toLocaleString()}\n\nUse this role for your event participants.`,
        ephemeral: true
      });

      logger.info(`Event role created: ${role.name} for ${eventName} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error creating event role:', error);
      await interaction.reply({ content: 'An error occurred while creating the event role.', ephemeral: true });
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