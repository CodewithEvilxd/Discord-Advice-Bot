const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const db = require('../utils/database');
const { hasPermission } = require('../utils/permissions');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-stats')
    .setDescription('View global bot statistics (Admin only)'),
  name: 'admin-stats',
  description: 'View global bot statistics (Admin only)',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    if (!hasPermission(userId, 'admin')) {
      const embed = new EmbedBuilder()
        .setTitle('Access Denied')
        .setDescription('You do not have permission to use this command.')
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
      return;
    }

    try {
      // Get total stats from database
      const totalStats = await new Promise((resolve, reject) => {
        db.db.get(`
          SELECT
            SUM(advice_count) as total_advice,
            SUM(ai_advice_count) as total_ai_advice,
            COUNT(*) as total_users
          FROM user_stats
        `, [], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      const embed = new EmbedBuilder()
        .setTitle('Global Bot Statistics')
        .setColor(0x0099ff)
        .addFields(
          { name: 'Total Users', value: totalStats.total_users.toString(), inline: true },
          { name: 'Total Advice Requests', value: totalStats.total_advice.toString(), inline: true },
          { name: 'Total AI Advice Requests', value: totalStats.total_ai_advice.toString(), inline: true }
        );

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed] });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Error fetching admin stats:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Could not fetch global stats right now.')
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [errorEmbed] });
      } else {
        await interactionOrMessage.reply({ embeds: [errorEmbed] });
      }
    }
  },
};