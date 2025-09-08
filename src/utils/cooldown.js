const logger = require('./logger');

const cooldowns = new Map();

function checkCooldown(userId, commandName, cooldownTime = 5000) { // 5 seconds default
  const key = `${userId}-${commandName}`;
  const now = Date.now();

  if (cooldowns.has(key)) {
    const expirationTime = cooldowns.get(key) + cooldownTime;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return { onCooldown: true, timeLeft: Math.ceil(timeLeft) };
    }
  }

  cooldowns.set(key, now);
  return { onCooldown: false };
}

function clearCooldown(userId, commandName) {
  const key = `${userId}-${commandName}`;
  cooldowns.delete(key);
}

function cleanupCooldowns() {
  const now = Date.now();
  for (const [key, timestamp] of cooldowns.entries()) {
    if (now - timestamp > 300000) { // 5 minutes
      cooldowns.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupCooldowns, 300000);

module.exports = {
  checkCooldown,
  clearCooldown,
};