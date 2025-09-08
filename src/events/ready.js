const logger = require('../utils/logger');
const cron = require('node-cron');
const { getExpiredTempRoles, removeTempRole, getExpiredTempBans, removeTempBan, getExpiredEventRoles, removeEventRole, getInactiveRoles } = require('../utils/database');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`🚀 ${client.user.tag} is ready!`);
    logger.info('❤️ Developer: github.com/codewithevilxd');

    // Start cron job to check expired temp roles and bans every minute
    cron.schedule('* * * * *', async () => {
      try {
        // Handle expired temp roles
        const expiredRoles = await getExpiredTempRoles();
        for (const roleData of expiredRoles) {
          try {
            const guild = client.guilds.cache.get(roleData.guild_id);
            if (!guild) continue;

            const member = await guild.members.fetch(roleData.user_id);
            const role = guild.roles.cache.get(roleData.role_id);

            if (member && role) {
              await member.roles.remove(role);
              logger.info(`Removed expired temp role ${role.name} from ${member.user.tag}`);
            }

            removeTempRole(roleData.id);
          } catch (error) {
            logger.error('Error removing expired temp role:', error);
            removeTempRole(roleData.id);
          }
        }

        // Handle expired temp bans
        const expiredBans = await getExpiredTempBans();
        for (const banData of expiredBans) {
          try {
            const guild = client.guilds.cache.get(banData.guild_id);
            if (!guild) continue;

            await guild.members.unban(banData.user_id);
            logger.info(`Unbanned user ${banData.user_id} from ${guild.name} (temp ban expired)`);

            removeTempBan(banData.id);
          } catch (error) {
            logger.error('Error removing expired temp ban:', error);
            removeTempBan(banData.id);
          }
        }

        // Handle expired event roles
        const expiredEventRoles = await getExpiredEventRoles();
        for (const eventRole of expiredEventRoles) {
          try {
            const guild = client.guilds.cache.get(eventRole.guild_id);
            if (!guild) continue;

            const role = guild.roles.cache.get(eventRole.role_id);
            if (role) {
              // Remove role from all members who have it
              const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));
              for (const member of membersWithRole.values()) {
                if (role.position < guild.members.me.roles.highest.position) {
                  await member.roles.remove(role);
                }
              }
              logger.info(`Removed expired event role ${role.name} from all members`);
            }

            removeEventRole(eventRole.id);
          } catch (error) {
            logger.error('Error removing expired event role:', error);
            removeEventRole(eventRole.id);
          }
        }

        // Handle inactive role decay
        const inactiveRoles = await getInactiveRoles();
        for (const decayData of inactiveRoles) {
          try {
            const guild = client.guilds.cache.get(decayData.guild_id);
            if (!guild) continue;

            const role = guild.roles.cache.get(decayData.role_id);
            if (role) {
              // Remove role from inactive members
              const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));
              for (const member of membersWithRole.values()) {
                if (role.position < guild.members.me.roles.highest.position) {
                  await member.roles.remove(role);
                  logger.info(`Removed decayed role ${role.name} from ${member.user.tag} due to inactivity`);
                }
              }
            }
          } catch (error) {
            logger.error('Error processing role decay:', error);
          }
        }
      } catch (error) {
        logger.error('Error in cleanup cron job:', error);
      }
    });

    logger.info('⏰ Temp role cleanup scheduler started');
  },
};