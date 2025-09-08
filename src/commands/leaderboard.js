const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopUsersByXP } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the XP leaderboard')
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of users to show (max 20)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20)),

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;
    const guild = interaction.guild;

    try {
      const topUsers = await getTopUsersByXP(guild.id, limit);

      if (topUsers.length === 0) {
        return interaction.reply({
          content: 'No users have earned XP yet!',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 XP Leaderboard')
        .setColor(0xffd700)
        .setTimestamp();

      let description = '';
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        try {
          const member = await guild.members.fetch(user.user_id);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
          description += `${medal} ${member.displayName} - Level ${user.level} (${user.xp} XP)\n`;
        } catch (error) {
          // User might have left the server
          description += `**${i + 1}.** Unknown User - Level ${user.level} (${user.xp} XP)\n`;
        }
      }

      embed.setDescription(description);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      await interaction.reply({ content: 'An error occurred while fetching the leaderboard.', ephemeral: true });
    }
  },
};