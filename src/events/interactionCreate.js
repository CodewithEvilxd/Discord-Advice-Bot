const logger = require('../utils/logger');
const { getOnboardingSteps, getUserOnboarding, updateUserOnboarding, completeUserOnboarding, addXP, submitSurveyResponse } = require('../utils/database');
const { getPaste, incrementPasteViews } = require('../commands/paste');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(`Error executing slash command ${interaction.commandName}:`, error);
        const reply = { content: 'There was an error while executing this command!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    }

    // Handle select menu interactions
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'role_select') {
        await handleRoleSelect(interaction);
      } else if (interaction.customId.startsWith('survey_q')) {
        await handleSurveyResponse(interaction);
      }
    }

    // Handle button interactions
    else if (interaction.isButton()) {
      if (interaction.customId.startsWith('onboarding_step_')) {
        await handleOnboardingStep(interaction);
      } else if (interaction.customId.startsWith('view_paste_')) {
        await handleViewPaste(interaction);
      } else if (interaction.customId.startsWith('raw_paste_')) {
        await handleRawPaste(interaction);
      }
    }
  },
};

async function handleRoleSelect(interaction) {
  const selectedRoles = interaction.values;
  const member = interaction.member;
  const guild = interaction.guild;

  if (!member) return;

  const addedRoles = [];
  const removedRoles = [];
  const failedRoles = [];

  for (const roleId of selectedRoles) {
    try {
      const role = guild.roles.cache.get(roleId);
      if (!role) continue;

      if (member.roles.cache.has(roleId)) {
        // Remove role
        if (role.position < guild.members.me.roles.highest.position) {
          await member.roles.remove(role);
          removedRoles.push(role.name);
        } else {
          failedRoles.push(`${role.name} (insufficient permissions)`);
        }
      } else {
        // Add role
        if (role.position < guild.members.me.roles.highest.position) {
          await member.roles.add(role);
          addedRoles.push(role.name);
        } else {
          failedRoles.push(`${role.name} (insufficient permissions)`);
        }
      }
    } catch (error) {
      logger.error('Error updating role:', error);
      failedRoles.push(roleId);
    }
  }

  let response = '';
  if (addedRoles.length > 0) {
    response += `✅ **Added:** ${addedRoles.join(', ')}\n`;
  }
  if (removedRoles.length > 0) {
    response += `❌ **Removed:** ${removedRoles.join(', ')}\n`;
  }
  if (failedRoles.length > 0) {
    response += `⚠️ **Failed:** ${failedRoles.join(', ')}\n`;
  }

  if (!response) {
    response = 'No roles were selected.';
  }

  try {
    await interaction.reply({ content: response, ephemeral: true });
  } catch (error) {
    logger.error('Error sending role update response:', error);
  }
}

async function handleOnboardingStep(interaction) {
  const stepNumber = parseInt(interaction.customId.split('_')[2]);
  const user = interaction.user;
  const guild = interaction.guild;

  try {
    const steps = await getOnboardingSteps(guild.id);
    const userProgress = await getUserOnboarding(user.id, guild.id);
    const currentStep = userProgress ? userProgress.current_step : 1;

    if (stepNumber !== currentStep) {
      return interaction.reply({
        content: 'This is not your current onboarding step.',
        ephemeral: true
      });
    }

    const step = steps.find(s => s.step_number === stepNumber);
    if (!step) {
      return interaction.reply({
        content: 'Onboarding step not found.',
        ephemeral: true
      });
    }

    // Award XP for completing the step
    if (step.reward_xp > 0) {
      addXP(user.id, guild.id, step.reward_xp, interaction.client);
    }

    // Update user progress
    const completedSteps = userProgress ? JSON.parse(userProgress.completed_steps || '[]') : [];
    completedSteps.push(stepNumber);

    const nextStep = step.next_step_id;
    if (nextStep && steps.find(s => s.step_number === nextStep)) {
      // Move to next step
      updateUserOnboarding(user.id, guild.id, nextStep, JSON.stringify(completedSteps));

      const nextStepData = steps.find(s => s.step_number === nextStep);
      const embed = {
        title: `🎯 Onboarding Step ${nextStep}`,
        description: nextStepData.description,
        fields: [
          { name: '📍 Location', value: `<#${nextStepData.channel_id}>`, inline: true },
          { name: '🎁 Reward', value: `${nextStepData.reward_xp} XP`, inline: true },
          { name: '📝 Action Required', value: nextStepData.required_action, inline: false }
        ],
        color: 0x3498db,
        timestamp: new Date()
      };

      const button = {
        type: 2,
        style: 3,
        custom_id: `onboarding_step_${nextStep}`,
        label: 'Mark as Complete'
      };

      await interaction.update({
        embeds: [embed],
        components: [{ type: 1, components: [button] }]
      });
    } else {
      // Complete onboarding
      completeUserOnboarding(user.id, guild.id);

      await interaction.update({
        content: '🎉 **Congratulations!** You have completed the onboarding process!\n\nYou now have access to all server features.',
        embeds: [],
        components: []
      });
    }

    logger.info(`User ${user.tag} completed onboarding step ${stepNumber}`);
  } catch (error) {
    logger.error('Error handling onboarding step:', error);
    await interaction.reply({
      content: 'An error occurred while processing your onboarding step.',
      ephemeral: true
    });
  }
}

async function handleSurveyResponse(interaction) {
  const questionNumber = parseInt(interaction.customId.split('q')[1]);
  const response = interaction.values[0];
  const user = interaction.user;

  try {
    // For now, we'll use a simple survey ID based on the message
    // In a real implementation, you'd want to track survey IDs properly
    const surveyId = 1; // This should be extracted from the message embed or stored data

    const responses = {};
    responses[`question_${questionNumber}`] = response;

    submitSurveyResponse(surveyId, user.id, JSON.stringify(responses));

    await interaction.reply({
      content: `✅ Thank you for your response to question ${questionNumber}!`,
      ephemeral: true
    });

    logger.info(`User ${user.tag} responded to survey question ${questionNumber}`);
  } catch (error) {
    logger.error('Error handling survey response:', error);
    await interaction.reply({
      content: 'An error occurred while recording your response.',
      ephemeral: true
    });
  }
}

async function handleViewPaste(interaction) {
  const pasteId = interaction.customId.split('view_paste_')[1];
  const paste = getPaste(pasteId);

  if (!paste) {
    return interaction.reply({
      content: 'Paste not found or has expired.',
      ephemeral: true
    });
  }

  // Check privacy
  if (paste.isPrivate && paste.authorId !== interaction.user.id) {
    return interaction.reply({
      content: 'This paste is private and can only be viewed by its author.',
      ephemeral: true
    });
  }

  incrementPasteViews(pasteId);

  const { EmbedBuilder } = require('discord.js');

  const embed = new EmbedBuilder()
    .setTitle(`📄 ${paste.title}`)
    .setDescription(`**Language:** ${paste.language}\n**Author:** ${paste.author}\n**Created:** ${paste.createdAt.toLocaleString()}\n**Views:** ${paste.views}`)
    .setColor(0x9b59b6)
    .setTimestamp();

  // Handle long code by splitting if necessary
  const maxLength = 4000;
  const codeBlock = `\`\`\`${paste.language}\n${paste.code}\n\`\`\``;

  if (codeBlock.length > maxLength) {
    embed.addFields({
      name: '📝 Code (Partial)',
      value: `\`\`\`${paste.language}\n${paste.code.substring(0, maxLength - 100)}...\n\`\`\``,
      inline: false
    });
  } else {
    embed.addFields({
      name: '📝 Code',
      value: codeBlock,
      inline: false
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleRawPaste(interaction) {
  const pasteId = interaction.customId.split('raw_paste_')[1];
  const paste = getPaste(pasteId);

  if (!paste) {
    return interaction.reply({
      content: 'Paste not found or has expired.',
      ephemeral: true
    });
  }

  // Check privacy
  if (paste.isPrivate && paste.authorId !== interaction.user.id) {
    return interaction.reply({
      content: 'This paste is private and can only be viewed by its author.',
      ephemeral: true
    });
  }

  incrementPasteViews(pasteId);

  // Send raw code
  const rawCode = `\`\`\`${paste.language}\n${paste.code}\n\`\`\``;

  if (rawCode.length > 2000) {
    await interaction.reply({
      content: 'Raw code is too long to display. Use the View Full Paste button instead.',
      ephemeral: true
    });
  } else {
    await interaction.reply({
      content: `**Raw Code for ${paste.title}:**\n${rawCode}`,
      ephemeral: true
    });
  }
}