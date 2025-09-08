const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const db = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your advice statistics'),
  name: 'stats',
  description: 'View your advice statistics',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;
    const user = isSlash ? interactionOrMessage.user : interactionOrMessage.author;

    try {
      const stats = await db.getUserStats(userId);

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Advice Stats`)
        .setColor(0x0099ff)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'Regular Advice', value: stats ? stats.advice_count.toString() : '0', inline: true },
          { name: 'AI Advice', value: stats ? stats.ai_advice_count.toString() : '0', inline: true },
          { name: 'Total Advice', value: stats ? (stats.advice_count + stats.ai_advice_count).toString() : '0', inline: true }
        );

      if (stats && stats.last_advice) {
        embed.addFields({ name: 'Last Advice', value: new Date(stats.last_advice).toLocaleString(), inline: false });
      }

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed] });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Could not fetch your stats right now.')
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [errorEmbed] });
      } else {
        await interactionOrMessage.reply({ embeds: [errorEmbed] });
      }
    }
  },
};