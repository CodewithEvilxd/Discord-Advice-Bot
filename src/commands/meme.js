const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger');
const { checkCooldown } = require('../utils/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),
  name: 'meme',
  description: 'Get a random meme',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    const cooldownCheck = checkCooldown(userId, 'meme', 10000); // 10 seconds
    if (cooldownCheck.onCooldown) {
      const embed = new EmbedBuilder()
        .setTitle('Cooldown')
        .setDescription(`Please wait ${cooldownCheck.timeLeft} seconds before requesting another meme.`)
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
      return;
    }

    let embed = new EmbedBuilder()
      .setTitle('**__🤣 Random Meme __**')
      .setColor(Math.floor(Math.random() * 16777215));

    try {
      const response = await fetch('https://meme-api.com/gimme');
      const json = await response.json();

      if (json.url) {
        embed.setImage(json.url);
        embed.setDescription(`**${json.title}**`);
        if (json.author) {
          embed.setFooter({ text: `Posted by: ${json.author}` });
        }
      } else {
        embed.setDescription('Sorry, I couldn\'t fetch a meme right now. Try again later!');
      }
    } catch (error) {
      logger.error('Error fetching meme:', error);
      embed.setDescription('Sorry, I couldn\'t fetch a meme right now. Try again later!');
    }

    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },
};