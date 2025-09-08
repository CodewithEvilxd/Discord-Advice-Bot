const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snippet')
    .setDescription('Share a formatted code snippet')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Programming language (e.g., javascript, python, java)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to share')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title for the code snippet')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of the code')
        .setRequired(false)),

  async execute(interaction) {
    const language = interaction.options.getString('language').toLowerCase();
    const code = interaction.options.getString('code');
    const title = interaction.options.getString('title') || 'Code Snippet';
    const description = interaction.options.getString('description');

    try {
      // Language mapping for better display
      const languageNames = {
        'js': 'JavaScript',
        'javascript': 'JavaScript',
        'py': 'Python',
        'python': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c++': 'C++',
        'c': 'C',
        'cs': 'C#',
        'csharp': 'C#',
        'php': 'PHP',
        'ruby': 'Ruby',
        'go': 'Go',
        'rust': 'Rust',
        'swift': 'Swift',
        'kotlin': 'Kotlin',
        'scala': 'Scala',
        'html': 'HTML',
        'css': 'CSS',
        'sql': 'SQL',
        'bash': 'Bash',
        'shell': 'Shell',
        'json': 'JSON',
        'xml': 'XML',
        'yaml': 'YAML',
        'yml': 'YAML'
      };

      const displayLanguage = languageNames[language] || language.charAt(0).toUpperCase() + language.slice(1);

      // Create the code block
      const codeBlock = `\`\`\`${language}\n${code}\n\`\`\``;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`💻 ${title}`)
        .setColor(getLanguageColor(language))
        .setTimestamp()
        .setFooter({ text: `Shared by ${interaction.user.tag} • Language: ${displayLanguage}` });

      // Add description if provided
      if (description) {
        embed.setDescription(description);
      }

      // Add code field
      embed.addFields({
        name: '📝 Code',
        value: codeBlock.length > 1024 ? `${codeBlock.substring(0, 1021)}...` : codeBlock,
        inline: false
      });

      // Add metadata
      const lines = code.split('\n').length;
      const characters = code.length;
      embed.addFields(
        { name: '📊 Stats', value: `Lines: ${lines}\nCharacters: ${characters}`, inline: true },
        { name: '🔧 Language', value: displayLanguage, inline: true }
      );

      await interaction.reply({ embeds: [embed] });

      logger.info(`Code snippet shared by ${interaction.user.tag} in ${language}`);
    } catch (error) {
      logger.error('Error sharing code snippet:', error);
      await interaction.reply({ content: 'An error occurred while sharing the code snippet.', ephemeral: true });
    }
  },
};

function getLanguageColor(language) {
  const colors = {
    'javascript': 0xf7df1e,
    'python': 0x3776ab,
    'java': 0xed8b00,
    'cpp': 0x00599c,
    'csharp': 0x239120,
    'php': 0x777bb4,
    'ruby': 0xcc342d,
    'go': 0x00add8,
    'rust': 0x000000,
    'html': 0xe34f26,
    'css': 0x1572b6,
    'sql': 0x336791,
    'bash': 0x4eaa25,
    'json': 0x000000,
    'yaml': 0xcb171e
  };

  return colors[language] || 0x3498db; // Default blue
}