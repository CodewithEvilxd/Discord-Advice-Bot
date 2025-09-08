const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addOnboardingStep } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-onboarding')
    .setDescription('Set up an onboarding step for new members')
    .addIntegerOption(option =>
      option.setName('step_number')
        .setDescription('The step number in the onboarding process')
        .setRequired(true)
        .setMinValue(1))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the onboarding step')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of what the user needs to do')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where this step should be completed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Required action (e.g., "send_message", "react", "read")')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('reward_xp')
        .setDescription('XP reward for completing this step')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const stepNumber = interaction.options.getInteger('step_number');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const channel = interaction.options.getChannel('channel');
    const action = interaction.options.getString('action');
    const rewardXp = interaction.options.getInteger('reward_xp') || 10;
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You do not have permission to set up onboarding.', ephemeral: true });
    }

    try {
      addOnboardingStep(guild.id, stepNumber, title, description, channel.id, action, rewardXp, stepNumber + 1);

      await interaction.reply({
        content: `✅ Onboarding step ${stepNumber} set up!\n**Title:** ${title}\n**Description:** ${description}\n**Channel:** ${channel.name}\n**Action:** ${action}\n**XP Reward:** ${rewardXp}`,
        ephemeral: true
      });

      logger.info(`Onboarding step ${stepNumber} set up by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting up onboarding step:', error);
      await interaction.reply({ content: 'An error occurred while setting up the onboarding step.', ephemeral: true });
    }
  },
};