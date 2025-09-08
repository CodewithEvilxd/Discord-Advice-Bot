const { SlashCommandBuilder } = require('discord.js');
const { getShopItems, purchaseItem } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item from the shop')
    .addIntegerOption(option =>
      option.setName('item_number')
        .setDescription('The number of the item to buy (from /shop)')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction) {
    const itemNumber = interaction.options.getInteger('item_number') - 1; // Convert to 0-based index
    const guild = interaction.guild;
    const user = interaction.user;

    try {
      const items = await getShopItems(guild.id);

      if (itemNumber < 0 || itemNumber >= items.length) {
        return interaction.reply({
          content: 'Invalid item number. Use /shop to see available items.',
          ephemeral: true
        });
      }

      const item = items[itemNumber];

      const purchasedItem = await purchaseItem(user.id, guild.id, item.id);

      // Grant the role if it's a role item
      if (purchasedItem.type === 'role' && purchasedItem.role_id) {
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(purchasedItem.role_id);

        if (role && role.position < guild.members.me.roles.highest.position) {
          await member.roles.add(role);
        }
      }

      await interaction.reply({
        content: `✅ Successfully purchased **${purchasedItem.name}** for ${purchasedItem.price} 💰!`,
        ephemeral: true
      });

      logger.info(`${user.tag} purchased ${purchasedItem.name} for ${purchasedItem.price} currency`);
    } catch (error) {
      logger.error('Error purchasing item:', error);

      let errorMessage = 'An error occurred while purchasing the item.';
      if (error.message === 'Insufficient funds') {
        errorMessage = 'You don\'t have enough currency for this item!';
      } else if (error.message === 'Item not found') {
        errorMessage = 'Item not found. The shop might have been updated.';
      }

      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  },
};