const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger');
const db = require('../utils/database');
const { checkCooldown } = require('../utils/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('advice')
    .setDescription('Get a random piece of advice'),
  name: 'advice',
  description: 'Get a random piece of advice',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    const cooldownCheck = checkCooldown(userId, 'advice', 10000); // 10 seconds
    if (cooldownCheck.onCooldown) {
      const embed = new EmbedBuilder()
        .setTitle('Cooldown')
        .setDescription(`Please wait ${cooldownCheck.timeLeft} seconds before requesting another advice.`)
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
      return;
    }

    let embed = new EmbedBuilder()
      .setTitle('**__Advice__**')
      .setColor(Math.floor(Math.random() * 16777215));

    let advice = '';

    try {
      const response = await fetch('https://api.adviceslip.com/advice');
      const json = await response.json();
      advice = json.slip.advice;
      db.incrementAdviceCount(userId, false);
    } catch (error) {
      logger.error('Error fetching advice:', error);
      advice = 'Sorry, I couldn\'t fetch advice right now. Try again later!';
    }

    embed.setDescription(`"${advice}"`);

    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },
};