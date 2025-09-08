const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getShopItems } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View available items in the shop'),

  async execute(interaction) {
    const guild = interaction.guild;

    try {
      const items = await getShopItems(guild.id);

      if (items.length === 0) {
        return interaction.reply({
          content: 'The shop is empty! Ask an admin to add some items.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🛒 Server Shop')
        .setColor(0x9b59b6)
        .setTimestamp();

      items.forEach((item, index) => {
        embed.addFields({
          name: `${index + 1}. ${item.name} - ${item.price} 💰`,
          value: item.description,
          inline: false
        });
      });

      embed.setFooter({ text: 'Use /buy <item_number> to purchase an item' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error fetching shop items:', error);
      await interaction.reply({ content: 'An error occurred while fetching shop items.', ephemeral: true });
    }
  },
};