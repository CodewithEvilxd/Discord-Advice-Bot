const { getReactionRole } = require('../utils/database');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (user.bot) return;

    try {
      // Fetch the message if it's partial
      if (reaction.message.partial) {
        await reaction.message.fetch();
      }

      const emoji = reaction.emoji.name || reaction.emoji.id;
      const reactionRole = await getReactionRole(reaction.message.id, emoji);

      if (reactionRole) {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(reactionRole.role_id);

        if (role && !member.roles.cache.has(role.id)) {
          if (role.position < guild.members.me.roles.highest.position) {
            await member.roles.add(role);
            logger.info(`Reaction role ${role.name} added to ${user.tag}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error handling message reaction add:', error);
    }
  },
};