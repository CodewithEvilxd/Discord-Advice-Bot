const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with bot commands'),
  name: 'help',
  description: 'Get help with bot commands',
  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.isCommand?.() || false;

    const embed = new EmbedBuilder()
      .setTitle('Bot Help')
      .setDescription('Here are the available commands:')
      .addFields(
        { name: '🎉 **Fun Commands**', value: '\u200B', inline: false },
        { name: '/advice', value: 'Get a random piece of advice', inline: true },
        { name: '/ai-advice [topic]', value: 'Get AI-generated advice on a topic', inline: true },
        { name: '/joke', value: 'Get a random joke', inline: true },
        { name: '/quote', value: 'Get an inspirational quote', inline: true },
        { name: '/meme', value: 'Get a random meme', inline: true },
        { name: '📊 **Statistics**', value: '\u200B', inline: false },
        { name: '/stats', value: 'View your advice statistics', inline: true },
        { name: '/leaderboard', value: 'View the XP leaderboard', inline: true },
        { name: '/rank', value: 'Check your XP and level', inline: true },
        { name: '/admin-stats', value: 'View global bot statistics (Admin only)', inline: true },
        { name: '💰 **Economy**', value: '\u200B', inline: false },
        { name: '/balance', value: 'Check your currency balance', inline: true },
        { name: '/shop', value: 'Browse available shop items', inline: true },
        { name: '/buy [item_number]', value: 'Purchase an item from the shop', inline: true },
        { name: '🔧 **Utilities**', value: '\u200B', inline: false },
        { name: '/paste [language] [code]', value: 'Create a shareable code paste', inline: true },
        { name: '/view-paste [id]', value: 'View a shared code paste', inline: true },
        { name: '⚡ **Moderation**', value: '\u200B', inline: false },
        { name: '/warn [user] [reason]', value: 'Warn a user for rule violations', inline: true },
        { name: '/warnings [user]', value: 'View warnings for a user', inline: true },
        { name: '/temp-ban [user] [duration]', value: 'Temporarily ban a user', inline: true },
        { name: '/temp-role [user] [role] [duration]', value: 'Assign a temporary role', inline: true },
        { name: '🎭 **Role Management**', value: '\u200B', inline: false },
        { name: '/set-autorole [role]', value: 'Set auto-role for new members', inline: true },
        { name: '/reaction-role [message_id] [emoji] [role]', value: 'Set up reaction roles', inline: true },
        { name: '/role-portal [title]', value: 'Create a self-assign role portal', inline: true },
        { name: '📝 **Community**', value: '\u200B', inline: false },
        { name: '/create-survey [title] [questions...]', value: 'Create a community survey', inline: true },
        { name: '/help', value: 'Show this help message', inline: true }
      )
      .setColor(0x0099ff);

    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },
};