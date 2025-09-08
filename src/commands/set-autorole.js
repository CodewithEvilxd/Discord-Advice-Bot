const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setAutoRole } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-autorole')
    .setDescription('Set the role to automatically assign to new members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign automatically')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot assign a role that is higher than or equal to my highest role.', ephemeral: true });
    }

    try {
      setAutoRole(guild.id, role.id);
      await interaction.reply({
        content: `✅ Auto-role has been set to ${role.name}. New members will automatically receive this role.`,
        ephemeral: true
      });
      logger.info(`Auto-role set to ${role.name} in ${guild.name} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting auto-role:', error);
      await interaction.reply({ content: 'An error occurred while setting the auto-role.', ephemeral: true });
    }
  },
};