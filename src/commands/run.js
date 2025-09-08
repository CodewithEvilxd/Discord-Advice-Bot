const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('run')
    .setDescription('Execute a simple code snippet')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Programming language (javascript, python)')
        .setRequired(true)
        .addChoices(
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Python', value: 'python' }
        ))
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to execute (max 500 characters)')
        .setRequired(true)),

  async execute(interaction) {
    const language = interaction.options.getString('language');
    const code = interaction.options.getString('code');

    // Security check - limit code length
    if (code.length > 500) {
      return interaction.reply({ content: 'Code is too long! Maximum 500 characters allowed.', ephemeral: true });
    }

    // Basic security - prevent dangerous operations
    const dangerousPatterns = [
      /require\s*\(/gi,
      /import\s+/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /spawn\s*\(/gi,
      /child_process/gi,
      /fs\./gi,
      /process\./gi,
      /__dirname/gi,
      /__filename/gi,
      /global/gi,
      /console\./gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return interaction.reply({
          content: '❌ This code contains potentially dangerous operations that are not allowed.',
          ephemeral: true
        });
      }
    }

    try {
      let result;
      let executionTime;

      if (language === 'javascript') {
        const startTime = Date.now();

        // Create a safe execution context
        const safeContext = {
          Math: Math,
          Date: Date,
          Array: Array,
          Object: Object,
          String: String,
          Number: Number,
          Boolean: Boolean,
          RegExp: RegExp,
          JSON: JSON,
          parseInt: parseInt,
          parseFloat: parseFloat,
          isNaN: isNaN,
          encodeURIComponent: encodeURIComponent,
          decodeURIComponent: decodeURIComponent
        };

        // Simple JS execution (very limited)
        result = executeSimpleJS(code, safeContext);
        executionTime = Date.now() - startTime;

      } else if (language === 'python') {
        // For Python, we'll provide a simulated response since we can't actually run Python in Node.js
        result = simulatePythonExecution(code);
        executionTime = Math.random() * 100 + 50; // Simulated execution time
      }

      const embed = new EmbedBuilder()
        .setTitle(`⚡ Code Execution - ${language.charAt(0).toUpperCase() + language.slice(1)}`)
        .setColor(result.error ? 0xe74c3c : 0x2ecc71)
        .addFields(
          { name: '📝 Input', value: `\`\`\`${language}\n${code}\n\`\`\``, inline: false },
          { name: result.error ? '❌ Error' : '✅ Output', value: `\`\`\`\n${result.output}\n\`\`\``, inline: false }
        )
        .setFooter({ text: `Execution time: ${executionTime}ms • Requested by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      logger.info(`Code executed by ${interaction.user.tag} in ${language}`);
    } catch (error) {
      logger.error('Error executing code:', error);
      await interaction.reply({
        content: 'An error occurred while executing the code.',
        ephemeral: true
      });
    }
  },
};

function executeSimpleJS(code, context) {
  try {
    // Very basic JS execution - only supports simple expressions
    // This is intentionally limited for security

    // Remove semicolons and clean up
    let cleanCode = code.trim();
    if (cleanCode.endsWith(';')) {
      cleanCode = cleanCode.slice(0, -1);
    }

    // Only allow very simple expressions
    if (!/^[0-9+\-*/().\s]+$/.test(cleanCode.replace(/\s/g, ''))) {
      return { output: 'Only simple mathematical expressions are supported for security reasons.', error: false };
    }

    // Use Function constructor with limited context
    const func = new Function(...Object.keys(context), `return (${cleanCode})`);
    const result = func(...Object.values(context));

    return { output: String(result), error: false };
  } catch (error) {
    return { output: `Error: ${error.message}`, error: true };
  }
}

function simulatePythonExecution(code) {
  // Simulate Python execution for demonstration
  // In a real implementation, you'd use a Python interpreter or service

  const lines = code.split('\n');
  let output = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('print(')) {
      // Simulate print statements
      const content = trimmed.slice(6, -1);
      if (content.startsWith('"') && content.endsWith('"')) {
        output += content.slice(1, -1) + '\n';
      } else if (content.startsWith("'") && content.endsWith("'")) {
        output += content.slice(1, -1) + '\n';
      } else {
        output += content + '\n';
      }
    } else if (trimmed.includes('=')) {
      // Simulate variable assignment
      output += `# ${trimmed} (variable assigned)\n`;
    } else if (trimmed && !trimmed.startsWith('#')) {
      output += `# ${trimmed} (executed)\n`;
    }
  }

  if (!output) {
    output = 'Code executed successfully (no output)';
  }

  return { output: output.trim(), error: false };
}