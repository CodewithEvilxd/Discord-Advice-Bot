const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getOnboardingSteps, getUserOnboarding, updateUserOnboarding } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-onboarding')
    .setDescription('Start the interactive onboarding process'),

  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;

    try {
      // Check if user already completed onboarding
      const userProgress = await getUserOnboarding(user.id, guild.id);
      if (userProgress && userProgress.completed_at) {
        return interaction.reply({
          content: 'You have already completed the onboarding process! 🎉',
          ephemeral: true
        });
      }

      // Get onboarding steps
      const steps = await getOnboardingSteps(guild.id);
      if (steps.length === 0) {
        return interaction.reply({
          content: 'No onboarding steps have been set up yet. Please contact an administrator.',
          ephemeral: true
        });
      }

      // Start onboarding
      const currentStep = userProgress ? userProgress.current_step : 1;
      const step = steps.find(s => s.step_number === currentStep);

      if (!step) {
        return interaction.reply({
          content: 'Onboarding process is not properly configured.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`🎯 Onboarding Step ${step.step_number}`)
        .setDescription(step.description)
        .addFields(
          { name: '📍 Location', value: `<#${step.channel_id}>`, inline: true },
          { name: '🎁 Reward', value: `${step.reward_xp} XP`, inline: true },
          { name: '📝 Action Required', value: step.required_action, inline: false }
        )
        .setColor(0x3498db)
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId(`onboarding_step_${step.step_number}`)
        .setLabel('Mark as Complete')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder()
        .addComponents(button);

      // Initialize user onboarding if not exists
      if (!userProgress) {
        updateUserOnboarding(user.id, guild.id, 1, '[]');
      }

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });

      logger.info(`User ${user.tag} started onboarding at step ${currentStep}`);
    } catch (error) {
      logger.error('Error starting onboarding:', error);
      await interaction.reply({ content: 'An error occurred while starting onboarding.', ephemeral: true });
    }
  },
};