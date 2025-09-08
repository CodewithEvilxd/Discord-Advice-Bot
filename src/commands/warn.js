const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addWarning, getWarnings, getUserBehavior, addTempBan } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user for rule violations')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const moderator = interaction.user;
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'You do not have permission to warn users.', ephemeral: true });
    }

    if (user.id === moderator.id) {
      return interaction.reply({ content: 'You cannot warn yourself.', ephemeral: true });
    }

    if (user.bot) {
      return interaction.reply({ content: 'You cannot warn bots.', ephemeral: true });
    }

    try {
      addWarning(user.id, moderator.id, reason, guild.id);

      const warnings = await getWarnings(user.id, guild.id);
      const warningCount = warnings.length;

      // Check user behavior for enhanced moderation
      const behavior = await getUserBehavior(user.id, guild.id);
      const riskScore = behavior ? behavior.risk_score : 0;

      // Auto-ban after 3 warnings OR high risk score
      if (warningCount >= 3 || riskScore > 30) {
        const banReason = warningCount >= 3
          ? `Auto-ban: ${warningCount} warnings exceeded`
          : `Auto-ban: High risk behavior detected (Risk Score: ${riskScore})`;

        try {
          await guild.members.ban(user, { reason: banReason });
          await interaction.reply({
            content: `🚫 **Auto-Ban Issued**\nUser: ${user.tag}\nReason: ${banReason}\nFinal Warning: ${reason}`,
            ephemeral: false
          });
          return;
        } catch (error) {
          logger.error('Error auto-banning user:', error);
        }
      }

      // Auto temp-ban for medium risk users
      if (warningCount >= 2 && riskScore > 15) {
        try {
          await guild.members.ban(user, { reason: `Temp ban: Suspicious activity - ${reason}` });
          addTempBan(user.id, guild.id, `Suspicious activity: ${reason}`, 60, 'BOT'); // 1 hour temp ban

          await interaction.reply({
            content: `⏰ **Auto Temp-Ban Issued**\nUser: ${user.tag}\nDuration: 1 hour\nReason: Suspicious activity detected\nWarning: ${reason}`,
            ephemeral: false
          });
          return;
        } catch (error) {
          logger.error('Error auto temp-banning user:', error);
        }
      }

      await interaction.reply({
        content: `⚠️ **Warning Issued**\nUser: ${user.tag}\nReason: ${reason}\nTotal Warnings: ${warningCount}`,
        ephemeral: false
      });

      // DM the user
      try {
        const dmEmbed = {
          color: 0xffa500,
          title: 'You have been warned',
          description: `**Server:** ${guild.name}\n**Reason:** ${reason}\n**Moderator:** ${moderator.tag}\n**Total Warnings:** ${warningCount}`,
          timestamp: new Date(),
        };
        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        logger.warn('Could not DM user about warning:', error.message);
      }

      logger.info(`User ${user.tag} warned by ${moderator.tag} for: ${reason}`);
    } catch (error) {
      logger.error('Error issuing warning:', error);
      await interaction.reply({ content: 'An error occurred while issuing the warning.', ephemeral: true });
    }
  },
};