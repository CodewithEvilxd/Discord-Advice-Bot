const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addRoleDecay } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-role-decay')
    .setDescription('Set up automatic role removal for inactive members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to apply decay to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Days of inactivity before role removal')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(365))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const days = interaction.options.getInteger('days');
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot manage a role that is higher than or equal to my highest role.', ephemeral: true });
    }

    try {
      addRoleDecay(guild.id, role.id, days);

      await interaction.reply({
        content: `✅ Role decay set up!\nRole: ${role.name}\nInactivity Period: ${days} days\n\nMembers with this role will have it automatically removed after ${days} days of inactivity.`,
        ephemeral: true
      });

      logger.info(`Role decay set up: ${role.name} - ${days} days by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting up role decay:', error);
      await interaction.reply({ content: 'An error occurred while setting up role decay.', ephemeral: true });
    }
  },
};