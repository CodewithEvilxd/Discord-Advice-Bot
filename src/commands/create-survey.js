const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const { createSurvey } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-survey')
    .setDescription('Create an automated survey for community feedback')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the survey')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('question1')
        .setDescription('First question')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('question2')
        .setDescription('Second question (optional)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('question3')
        .setDescription('Third question (optional)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1d, 1w)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const questions = [];

    for (let i = 1; i <= 3; i++) {
      const question = interaction.options.getString(`question${i}`);
      if (question) questions.push(question);
    }

    const duration = interaction.options.getString('duration');
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to create surveys.', ephemeral: true });
    }

    if (questions.length === 0) {
      return interaction.reply({ content: 'At least one question is required.', ephemeral: true });
    }

    // Parse duration
    let expiresAt = null;
    if (duration) {
      const durationMs = parseDuration(duration);
      if (durationMs) {
        expiresAt = new Date(Date.now() + durationMs).toISOString();
      }
    }

    try {
      createSurvey(guild.id, title, JSON.stringify(questions), interaction.user.id, expiresAt);

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${title}`)
        .setDescription('Please answer the following questions:')
        .setColor(0x9b59b6)
        .setTimestamp();

      questions.forEach((question, index) => {
        embed.addFields({
          name: `Question ${index + 1}`,
          value: question,
          inline: false
        });
      });

      if (expiresAt) {
        embed.setFooter({ text: `Expires: ${new Date(expiresAt).toLocaleString()}` });
      }

      // Create response options for each question
      const components = [];
      questions.forEach((question, index) => {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`survey_q${index + 1}`)
          .setPlaceholder(`Answer Question ${index + 1}`)
          .addOptions(
            { label: 'Strongly Agree', value: '5' },
            { label: 'Agree', value: '4' },
            { label: 'Neutral', value: '3' },
            { label: 'Disagree', value: '2' },
            { label: 'Strongly Disagree', value: '1' }
          );

        components.push(new ActionRowBuilder().addComponents(selectMenu));
      });

      await interaction.reply({
        content: '📊 Survey created successfully!',
        embeds: [embed],
        components: components.slice(0, 5) // Discord limit
      });

      logger.info(`Survey "${title}" created by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error creating survey:', error);
      await interaction.reply({ content: 'An error occurred while creating the survey.', ephemeral: true });
    }
  },
};

function parseDuration(duration) {
  const regex = /^(\d+)([smhdw])$/;
  const match = duration.toLowerCase().match(regex);

  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}