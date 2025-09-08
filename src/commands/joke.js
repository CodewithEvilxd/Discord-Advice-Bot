const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger');
const { checkCooldown } = require('../utils/cooldown');

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "Why did the math book look sad? Because it had too many problems.",
  "Why was the broom late? It over-swept!",
  "What do you call fake spaghetti? An impasta!",
  "Why did the bicycle fall over? It was two-tired!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why can't you give Elsa a balloon? Because she will let it go!",
  "What did one wall say to the other wall? I'll meet you at the corner!"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),
  name: 'joke',
  description: 'Get a random joke',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    const cooldownCheck = checkCooldown(userId, 'joke', 5000); // 5 seconds
    if (cooldownCheck.onCooldown) {
      const embed = new EmbedBuilder()
        .setTitle('Cooldown')
        .setDescription(`Please wait ${cooldownCheck.timeLeft} seconds before requesting another joke.`)
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
      return;
    }

    let embed = new EmbedBuilder()
      .setTitle('**__😂 Joke Time! __**')
      .setColor(Math.floor(Math.random() * 16777215));

    let joke = '';

    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any');
      const json = await response.json();
      if (json.type === 'single') {
        joke = json.joke;
      } else {
        joke = `${json.setup} - ${json.delivery}`;
      }
    } catch (error) {
      logger.error('Error fetching joke:', error);
      joke = jokes[Math.floor(Math.random() * jokes.length)];
    }

    embed.setDescription(joke);

    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },
};