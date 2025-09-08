const logger = require('../utils/logger');
const { addXP, getAutoRole, updateUserBehavior, logRaidDetection, addTempBan } = require('../utils/database');

// Raid detection tracking
const recentJoins = new Map();
const RAID_JOIN_THRESHOLD = 5; // 5 joins
const RAID_TIME_WINDOW = 60000; // 1 minute

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guild = member.guild;
    const user = member.user;
    const now = Date.now();

    logger.info(`New member joined: ${user.tag} in ${guild.name}`);

    // Raid detection
    if (!recentJoins.has(guild.id)) {
      recentJoins.set(guild.id, []);
    }

    const joins = recentJoins.get(guild.id);
    joins.push(now);

    // Remove old joins
    while (joins.length > 0 && joins[0] < now - RAID_TIME_WINDOW) {
      joins.shift();
    }

    // Check for raid
    if (joins.length >= RAID_JOIN_THRESHOLD) {
      await handleRaidDetection(guild, joins.length);
    }

    // Initialize user behavior tracking
    updateUserBehavior(user.id, guild.id, 'join');

    // Auto-role assignment
    try {
      const autoRoleId = await getAutoRole(guild.id);
      if (autoRoleId) {
        const role = guild.roles.cache.get(autoRoleId);
        if (role && role.position < guild.members.me.roles.highest.position) {
          await member.roles.add(role);
          logger.info(`Auto-assigned role ${role.name} to ${user.tag}`);
        }
      }
    } catch (error) {
      logger.error('Error assigning auto-role:', error);
    }

    // Welcome message
    try {
      const welcomeChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.name.includes('welcome'));
      if (welcomeChannel) {
        await welcomeChannel.send(`Welcome to ${guild.name}, ${user}! 🎉`);
      }
    } catch (error) {
      logger.error('Error sending welcome message:', error);
    }

    // Initialize XP for new member
    addXP(user.id, guild.id, 0); // Initialize with 0 XP
  },
};

async function handleRaidDetection(guild, joinCount) {
  const riskLevel = joinCount > 10 ? 'CRITICAL' : joinCount > 7 ? 'HIGH' : 'MEDIUM';
  const action = riskLevel === 'CRITICAL' ? 'Server lockdown initiated' : 'Enhanced monitoring activated';

  logRaidDetection(guild.id, joinCount, RAID_TIME_WINDOW / 1000, riskLevel, action);

  try {
    const alertChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0);
    if (alertChannel) {
      await alertChannel.send(`🚨 **RAID DETECTED!**\n${joinCount} members joined in ${RAID_TIME_WINDOW / 1000} seconds\nRisk Level: ${riskLevel}\nAction: ${action}`);
    }

    // Enable slowmode if possible
    if (alertChannel && riskLevel !== 'MEDIUM') {
      await alertChannel.setRateLimitPerUser(30); // 30 second slowmode
    }
  } catch (error) {
    logger.error('Error handling raid detection:', error);
  }
}
