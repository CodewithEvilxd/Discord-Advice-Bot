const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('screenshot')
    .setDescription('Take a screenshot of recent messages in a channel')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of messages to screenshot (max 50)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(50))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to screenshot (default: current)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const count = interaction.options.getInteger('count') || 10;
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to take screenshots.', ephemeral: true });
    }

    try {
      // Fetch recent messages
      const messages = await targetChannel.messages.fetch({ limit: count });

      // Format messages for display
      let screenshotText = `📸 **Screenshot of #${targetChannel.name}**\n`;
      screenshotText += `📅 **Date:** ${new Date().toLocaleString()}\n`;
      screenshotText += `👤 **Requested by:** ${interaction.user.tag}\n\n`;

      const messageArray = Array.from(messages.values()).reverse(); // Oldest first

      messageArray.forEach((msg, index) => {
        const timestamp = msg.createdAt.toLocaleString();
        const author = msg.author ? msg.author.tag : 'Unknown';
        const content = msg.content || '*[No text content]*';

        screenshotText += `**${index + 1}.** ${author} (${timestamp})\n`;
        screenshotText += `${content}\n`;

        // Add attachments if any
        if (msg.attachments.size > 0) {
          msg.attachments.forEach(attachment => {
            screenshotText += `📎 ${attachment.name} (${attachment.url})\n`;
          });
        }

        // Add embeds info
        if (msg.embeds.length > 0) {
          screenshotText += `🔗 Contains ${msg.embeds.length} embed(s)\n`;
        }

        screenshotText += '\n';
      });

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`📸 Channel Screenshot`)
        .setDescription(`Screenshot of the last ${count} messages in #${targetChannel.name}`)
        .setColor(0x3498db)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      // Split long messages if needed
      const maxLength = 4000;
      if (screenshotText.length > maxLength) {
        const chunks = screenshotText.match(new RegExp(`.{1,${maxLength}}`, 'g'));

        for (let i = 0; i < chunks.length; i++) {
          if (i === 0) {
            embed.setDescription(chunks[i]);
            await interaction.reply({ embeds: [embed] });
          } else {
            await interaction.followUp({ content: chunks[i], ephemeral: true });
          }
        }
      } else {
        embed.setDescription(screenshotText);
        await interaction.reply({ embeds: [embed] });
      }

      logger.info(`Screenshot taken by ${interaction.user.tag} in #${targetChannel.name}`);
    } catch (error) {
      logger.error('Error taking screenshot:', error);
      await interaction.reply({ content: 'An error occurred while taking the screenshot.', ephemeral: true });
    }
  },
};