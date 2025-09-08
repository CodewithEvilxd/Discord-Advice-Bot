const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPaste, incrementPasteViews } = require('./paste');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-paste')
    .setDescription('View a shared code paste by ID')
    .addStringOption(option =>
      option.setName('paste_id')
        .setDescription('The paste ID to view')
        .setRequired(true)),

  async execute(interaction) {
    const pasteId = interaction.options.getString('paste_id');
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

    const embed = new EmbedBuilder()
      .setTitle(`📄 ${paste.title}`)
      .setDescription(`**Language:** ${paste.language}\n**Author:** ${paste.author}\n**Created:** ${paste.createdAt.toLocaleString()}\n**Views:** ${paste.views}`)
      .setColor(0x9b59b6)
      .setTimestamp();

    // Handle long code by splitting if necessary
    const maxLength = 4000;
    const codeBlock = `\`\`\`${paste.language}\n${paste.code}\n\`\`\``;

    if (codeBlock.length > maxLength) {
      // Split into multiple messages
      const chunks = codeBlock.match(new RegExp(`.{1,${maxLength}}`, 'g'));

      embed.addFields({
        name: '📝 Code (Part 1)',
        value: chunks[0],
        inline: false
      });

      await interaction.reply({ embeds: [embed] });

      // Send remaining chunks as follow-ups
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({
          content: `**Code (Part ${i + 1}):**\n${chunks[i]}`,
          ephemeral: true
        });
      }
    } else {
      embed.addFields({
        name: '📝 Code',
        value: codeBlock,
        inline: false
      });

      await interaction.reply({ embeds: [embed] });
    }

    logger.info(`Paste viewed: ${pasteId} by ${interaction.user.tag}`);
  },
};