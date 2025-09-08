const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
const config = require('../utils/config');
const logger = require('../utils/logger');
const db = require('../utils/database');
const { checkCooldown } = require('../utils/cooldown');

const openai = new OpenAI({ apiKey: config.openaiApiKey });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai-advice')
    .setDescription('Get AI-generated advice')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('The topic for advice')
        .setRequired(false)),
  name: 'ai-advice',
  description: 'Get AI-generated advice',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;
    const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;
    const topic = isSlash ? interactionOrMessage.options.getString('topic') : args.join(' ');

    const cooldownCheck = checkCooldown(userId, 'ai-advice', 30000); // 30 seconds for AI
    if (cooldownCheck.onCooldown) {
      const embed = new EmbedBuilder()
        .setTitle('Cooldown')
        .setDescription(`Please wait ${cooldownCheck.timeLeft} seconds before requesting another AI advice.`)
        .setColor(0xff0000);

      if (isSlash) {
        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interactionOrMessage.reply({ embeds: [embed] });
      }
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('**__AI Advice__**')
      .setColor(Math.floor(Math.random() * 16777215));

    try {
      const prompt = topic ? `Give me advice about ${topic}` : 'Give me some general life advice';

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      });

      const advice = completion.choices[0].message.content;
      embed.setDescription(`"${advice}"`);
      db.incrementAdviceCount(userId, true);
    } catch (error) {
      logger.error('Error generating AI advice:', error);
      embed.setDescription('Sorry, I couldn\'t generate AI advice right now. Try again later!');
    }

    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },
};