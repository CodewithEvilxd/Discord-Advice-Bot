const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger');
const { checkCooldown } = require('../utils/cooldown');

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "You miss 100% of the shots you don't take. - Wayne Gretzky",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "Keep your face always toward the sunshine—and shadows will fall behind you. - Walt Whitman",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Your time is limited, so don't waste it living someone else's life. - Steve Jobs"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get an inspirational quote'),
  name: 'quote',
  description: 'Get an inspirational quote',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    const cooldownCheck = checkCooldown(userId, 'quote', 3000); // 3 seconds
    if (cooldownCheck.onCooldown) {
      const embed = new EmbedBuilder()
        .setTitle('Cooldown')
        .setDescription(`Please wait ${cooldownCheck.timeLeft} seconds before requesting another quote.`)
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
      return;
    }

    let embed = new EmbedBuilder()
      .setTitle('**__💭 Inspirational Quote __**')
      .setColor(Math.floor(Math.random() * 16777215));

    let quote = '';
    let author = '';

    try {
      const response = await fetch('https://zenquotes.io/api/random');
      const json = await response.json();
      quote = json[0].q;
      author = json[0].a;
    } catch (error) {
      logger.error('Error fetching quote:', error);
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      [quote, author] = randomQuote.split(' - ');
    }

    embed.setDescription(`*"${quote}"*\n\n— ${author}`);

    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },
};