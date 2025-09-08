const { OpenAI } = require('openai');
const Filter = require('bad-words');
const config = require('../utils/config');
const logger = require('../utils/logger');
const { addWarning, logActivity, addXP, updateUserBehavior, getUserBehavior, addTempBan } = require('../utils/database');

const openai = new OpenAI({ apiKey: config.openaiApiKey });
const filter = new Filter();

// Anti-spam tracking
const userMessages = new Map();
const SPAM_THRESHOLD = 5; // messages per 10 seconds
const SPAM_TIME_WINDOW = 10000; // 10 seconds
const CAPS_THRESHOLD = 0.7; // 70% caps
const MENTION_THRESHOLD = 5; // max mentions

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const guild = message.guild;
    const user = message.author;
    const content = message.content;

    // Log activity
    logActivity(user.id, guild.id, message.channel.id, 'message');

    // Update user behavior for predictive analysis
    updateUserBehavior(user.id, guild.id, 'message');

    // Check for high-risk behavior
    const behavior = await getUserBehavior(user.id, guild.id);
    if (behavior && behavior.flagged) {
      await handleHighRiskUser(message);
    }

    // Anti-spam checks
    if (await checkSpam(message)) return;
    if (checkCapsLock(message)) return;
    if (checkExcessiveMentions(message)) return;

    // Link scanning
    if (await checkLinks(message)) return;

    // AI moderation
    await checkAIModeration(message);

    // Process commands
    if (!content.startsWith(config.prefix)) return;

    const args = content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
      const command = require(`../commands/${commandName}.js`);
      if (command.execute) {
        command.execute(message, args);
      }
    } catch (error) {
      logger.error(`Error executing command ${commandName}:`, error);
      message.reply('Sorry, I couldn\'t process that command.');
    }

    // Award XP for messages (not commands)
    if (!content.startsWith(config.prefix)) {
      const xpGain = Math.floor(Math.random() * 5) + 5; // 5-10 XP per message
      addXP(user.id, guild.id, xpGain, message.client);
    }
  },
};

async function checkSpam(message) {
  const userId = message.author.id;
  const now = Date.now();

  if (!userMessages.has(userId)) {
    userMessages.set(userId, []);
  }

  const messages = userMessages.get(userId);
  messages.push(now);

  // Remove old messages
  while (messages.length > 0 && messages[0] < now - SPAM_TIME_WINDOW) {
    messages.shift();
  }

  if (messages.length > SPAM_THRESHOLD) {
    await handleSpam(message);
    return true;
  }

  return false;
}

function checkCapsLock(message) {
  const content = message.content;
  if (content.length < 10) return false;

  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const capsRatio = capsCount / content.length;

  if (capsRatio > CAPS_THRESHOLD) {
    handleCapsLock(message);
    return true;
  }

  return false;
}

function checkExcessiveMentions(message) {
  const mentions = message.mentions.users.size + message.mentions.roles.size;
  if (mentions > MENTION_THRESHOLD) {
    handleExcessiveMentions(message);
    return true;
  }
  return false;
}

async function checkAIModeration(message) {
  try {
    const response = await openai.moderations.create({
      input: message.content
    });

    if (response.results[0].flagged) {
      await handleToxicContent(message, response.results[0]);
    }
  } catch (error) {
    logger.error('AI moderation error:', error);
  }
}

async function handleSpam(message) {
  const reason = 'Spam detected (too many messages in short time)';
  addWarning(message.author.id, 'BOT', reason, message.guild.id);

  try {
    await message.delete();
    await message.channel.send(`${message.author}, please stop spamming! You've been warned.`);
  } catch (error) {
    logger.error('Error handling spam:', error);
  }
}

async function handleCapsLock(message) {
  const reason = 'Excessive use of caps lock';
  addWarning(message.author.id, 'BOT', reason, message.guild.id);

  try {
    await message.delete();
    await message.channel.send(`${message.author}, please don't use excessive caps! You've been warned.`);
  } catch (error) {
    logger.error('Error handling caps lock:', error);
  }
}

async function handleExcessiveMentions(message) {
  const reason = 'Excessive mentions in message';
  addWarning(message.author.id, 'BOT', reason, message.guild.id);

  try {
    await message.delete();
    await message.channel.send(`${message.author}, please don't mention too many people! You've been warned.`);
  } catch (error) {
    logger.error('Error handling excessive mentions:', error);
  }
}

async function checkLinks(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.content.match(urlRegex);

  if (!urls) return false;

  // Known malicious domains (basic list)
  const maliciousDomains = [
    'bit.ly', 'tinyurl.com', 'goo.gl', // URL shorteners that can hide malicious links
    'discord-nitro.com', 'free-nitro.com', // Common scam sites
    'steamcommunity.com' // Can be used for phishing
  ];

  for (const url of urls) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      if (maliciousDomains.some(malicious => domain.includes(malicious))) {
        await handleMaliciousLink(message, url);
        return true;
      }
    } catch (error) {
      // Invalid URL, skip
    }
  }

  return false;
}

async function handleMaliciousLink(message, url) {
  const reason = `Malicious link detected: ${url}`;
  addWarning(message.author.id, 'BOT', reason, message.guild.id);

  try {
    await message.delete();
    await message.channel.send(`${message.author}, your message contained a potentially malicious link and has been removed. You've been warned.`);
  } catch (error) {
    logger.error('Error handling malicious link:', error);
  }
}

async function handleHighRiskUser(message) {
  const reason = 'High-risk behavior detected - enhanced monitoring active';
  addWarning(message.author.id, 'BOT', reason, message.guild.id);

  try {
    await message.channel.send(`${message.author}, your behavior has been flagged for additional monitoring. Please follow server rules.`);
  } catch (error) {
    logger.error('Error handling high-risk user:', error);
  }
}

async function handleToxicContent(message, moderationResult) {
  const categories = Object.keys(moderationResult.categories).filter(cat => moderationResult.categories[cat]);
  const reason = `Toxic content detected: ${categories.join(', ')}`;
  addWarning(message.author.id, 'BOT', reason, message.guild.id);

  // Update behavior for toxic content
  updateUserBehavior(message.author.id, message.guild.id, 'warning');

  try {
    await message.delete();
    await message.channel.send(`${message.author}, your message contained inappropriate content and has been removed. You've been warned.`);
  } catch (error) {
    logger.error('Error handling toxic content:', error);
  }
}