const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addActivityRole } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-activity-role')
    .setDescription('Set up automatic role promotion based on user activity/level')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('required_level')
        .setDescription('Required level to get this role')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const requiredLevel = interaction.options.getInteger('required_level');
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot assign a role that is higher than or equal to my highest role.', ephemeral: true });
    }

    try {
      const requiredXp = requiredLevel * 100; // XP required for the level
      addActivityRole(guild.id, role.id, requiredLevel, requiredXp);

      await interaction.reply({
        content: `✅ Activity role set up!\nRole: ${role.name}\nRequired Level: ${requiredLevel}\nRequired XP: ${requiredXp}\n\nUsers will automatically receive this role when they reach level ${requiredLevel}.`,
        ephemeral: true
      });

      logger.info(`Activity role set up: ${role.name} for level ${requiredLevel} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting up activity role:', error);
      await interaction.reply({ content: 'An error occurred while setting up the activity role.', ephemeral: true });
    }
  },
};