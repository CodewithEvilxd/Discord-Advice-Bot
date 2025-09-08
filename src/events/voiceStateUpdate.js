const logger = require('../utils/logger');
const { addWarning } = require('../utils/database');

// Voice activity tracking
const voiceActivity = new Map();
const VOICE_SPAM_THRESHOLD = 10; // rapid joins/leaves per minute
const VOICE_TIME_WINDOW = 60000; // 1 minute

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const user = newState.member.user;
    const guild = newState.guild;

    if (user.bot) return;

    const userId = user.id;
    const now = Date.now();

    // Track voice activity
    if (!voiceActivity.has(userId)) {
      voiceActivity.set(userId, []);
    }

    const activities = voiceActivity.get(userId);
    activities.push(now);

    // Remove old activities
    while (activities.length > 0 && activities[0] < now - VOICE_TIME_WINDOW) {
      activities.shift();
    }

    // Check for voice spam (rapid joining/leaving)
    if (activities.length > VOICE_SPAM_THRESHOLD) {
      await handleVoiceSpam(newState.member);
      return;
    }

    // Detect mic spam (if user is speaking too frequently)
    if (newState.selfMute !== oldState.selfMute || newState.mute !== oldState.mute) {
      // This is a basic check; more advanced detection would require voice data
      logger.info(`Voice state change for ${user.tag}: mute status changed`);
    }

    // Log voice activity
    let action = 'voice_join';
    if (oldState.channel && !newState.channel) {
      action = 'voice_leave';
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      action = 'voice_move';
    }

    // You could log this to database if needed
    logger.info(`${user.tag} ${action} in ${guild.name}`);
  },
};

async function handleVoiceSpam(member) {
  const reason = 'Voice spam detected (rapid joining/leaving channels)';
  addWarning(member.id, 'BOT', reason, member.guild.id);

  try {
    // Disconnect from voice
    if (member.voice.channel) {
      await member.voice.disconnect('Voice spam detected');
    }

    // Send warning message
    const channel = member.guild.systemChannel || member.guild.channels.cache.find(ch => ch.type === 0);
    if (channel) {
      await channel.send(`${member}, please stop voice spamming! You've been disconnected and warned.`);
    }
  } catch (error) {
    logger.error('Error handling voice spam:', error);
  }
}