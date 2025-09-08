const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getWarnings } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check warnings for')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers) && targetUser.id !== interaction.user.id) {
      return interaction.reply({ content: 'You do not have permission to view other users\' warnings.', ephemeral: true });
    }

    try {
      const warnings = await getWarnings(targetUser.id, guild.id);

      if (warnings.length === 0) {
        return interaction.reply({
          content: `${targetUser.tag} has no warnings.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Warnings for ${targetUser.tag}`)
        .setColor(0xffa500)
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      warnings.forEach((warning, index) => {
        const moderator = guild.members.cache.get(warning.moderator_id)?.user?.tag || 'Unknown';
        const timestamp = new Date(warning.timestamp).toLocaleString();

        embed.addFields({
          name: `Warning ${index + 1}`,
          value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator}\n**Date:** ${timestamp}`,
          inline: false
        });
      });

      embed.setFooter({ text: `Total Warnings: ${warnings.length}` });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error('Error fetching warnings:', error);
      await interaction.reply({ content: 'An error occurred while fetching warnings.', ephemeral: true });
    }
  },
};