const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addReactionRole } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reaction-role')
    .setDescription('Set up a reaction role for a message')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The ID of the message to add reaction role to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to react with')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot assign a role that is higher than or equal to my highest role.', ephemeral: true });
    }

    try {
      // Try to fetch the message to verify it exists
      const channel = interaction.channel;
      const message = await channel.messages.fetch(messageId);

      if (!message) {
        return interaction.reply({ content: 'Message not found in this channel.', ephemeral: true });
      }

      // Add the reaction to the message
      await message.react(emoji);

      // Save to database
      addReactionRole(guild.id, messageId, emoji, role.id);

      await interaction.reply({
        content: `✅ Reaction role set up! React with ${emoji} on the message to get the ${role.name} role.`,
        ephemeral: true
      });

      logger.info(`Reaction role set up: ${emoji} -> ${role.name} for message ${messageId} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting up reaction role:', error);
      await interaction.reply({ content: 'An error occurred while setting up the reaction role. Make sure the message ID is correct and I can react to the message.', ephemeral: true });
    }
  },
};