const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCurrency } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your currency balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Check another user\'s balance')
        .setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guild = interaction.guild;

    try {
      const balance = await getCurrency(targetUser.id, guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Balance`)
        .setColor(0x3498db)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '💰 Currency', value: balance.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error fetching balance:', error);
      await interaction.reply({ content: 'An error occurred while fetching balance information.', ephemeral: true });
    }
  },
};