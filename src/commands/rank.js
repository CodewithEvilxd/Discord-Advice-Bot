const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserXP } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your XP and level')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Check another user\'s rank')
        .setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guild = interaction.guild;

    try {
      const userXP = await getUserXP(targetUser.id, guild.id);

      if (!userXP) {
        return interaction.reply({
          content: `${targetUser.tag} hasn't earned any XP yet!`,
          ephemeral: true
        });
      }

      const { xp, level } = userXP;
      const xpForNextLevel = level * 100;
      const progress = Math.min((xp / xpForNextLevel) * 100, 100);

      const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Rank`)
        .setColor(0x00ff00)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: 'Level', value: level.toString(), inline: true },
          { name: 'XP', value: `${xp}/${xpForNextLevel}`, inline: true },
          { name: 'Progress', value: `${Math.floor(progress)}%`, inline: true }
        )
        .setTimestamp();

      // Create progress bar
      const filled = Math.floor(progress / 10);
      const empty = 10 - filled;
      const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
      embed.addFields({ name: 'Progress Bar', value: progressBar, inline: false });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error fetching user XP:', error);
      await interaction.reply({ content: 'An error occurred while fetching rank information.', ephemeral: true });
    }
  },
};