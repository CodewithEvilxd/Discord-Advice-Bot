const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger');

// Simple in-memory storage for pastes (in production, use a database)
const pastes = new Map();
let pasteCounter = 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('paste')
    .setDescription('Create a shareable code paste')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Programming language')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to paste')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title for the paste')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('private')
        .setDescription('Make this paste private (only accessible via direct link)')
        .setRequired(false)),

  async execute(interaction) {
    const language = interaction.options.getString('language');
    const code = interaction.options.getString('code');
    const title = interaction.options.getString('title') || 'Untitled Paste';
    const isPrivate = interaction.options.getBoolean('private') || false;

    try {
      // Generate paste ID
      const pasteId = `paste_${pasteCounter++}_${Date.now()}`;

      // Store paste
      pastes.set(pasteId, {
        id: pasteId,
        language,
        code,
        title,
        author: interaction.user.tag,
        authorId: interaction.user.id,
        createdAt: new Date(),
        isPrivate,
        views: 0
      });

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`📄 ${title}`)
        .setDescription(`**Language:** ${language}\n**Author:** ${interaction.user.tag}\n**Created:** ${new Date().toLocaleString()}`)
        .setColor(0x9b59b6)
        .setTimestamp();

      // Add code preview (first 500 characters)
      const preview = code.length > 500 ? code.substring(0, 497) + '...' : code;
      embed.addFields({
        name: '📝 Code Preview',
        value: `\`\`\`${language}\n${preview}\n\`\`\``,
        inline: false
      });

      // Create buttons
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`view_paste_${pasteId}`)
            .setLabel('View Full Paste')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`raw_paste_${pasteId}`)
            .setLabel('Raw Code')
            .setStyle(ButtonStyle.Secondary)
        );

      if (!isPrivate) {
        embed.addFields({
          name: '🔗 Share Link',
          value: `||Paste ID: \`${pasteId}\`||`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], components: [row] });

      logger.info(`Code paste created by ${interaction.user.tag}: ${pasteId}`);
    } catch (error) {
      logger.error('Error creating paste:', error);
      await interaction.reply({ content: 'An error occurred while creating the paste.', ephemeral: true });
    }
  },
};

// Function to get paste by ID
function getPaste(pasteId) {
  return pastes.get(pasteId);
}

// Function to increment paste views
function incrementPasteViews(pasteId) {
  const paste = pastes.get(pasteId);
  if (paste) {
    paste.views++;
  }
}

module.exports.getPaste = getPaste;
module.exports.incrementPasteViews = incrementPasteViews;