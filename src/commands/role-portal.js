const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-portal')
    .setDescription('Create a self-assign role portal')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title for the role portal')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description for the role portal')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description') || 'Choose your roles below!';
    const guild = interaction.guild;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to create role portals.', ephemeral: true });
    }

    // Get available roles (excluding managed roles and roles higher than bot)
    const availableRoles = guild.roles.cache
      .filter(role =>
        !role.managed &&
        role.position < guild.members.me.roles.highest.position &&
        role.name !== '@everyone'
      )
      .sort((a, b) => b.position - a.position)
      .first(25); // Discord limit for select menus

    if (availableRoles.length === 0) {
      return interaction.reply({ content: 'No roles available for self-assignment.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x3498db)
      .setTimestamp();

    // Create select menu options
    const options = availableRoles.map(role => ({
      label: role.name,
      value: role.id,
      description: `Click to ${interaction.member.roles.cache.has(role.id) ? 'remove' : 'add'} this role`,
      emoji: '🎭'
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('role_select')
      .setPlaceholder('Choose roles to add/remove')
      .setMinValues(0)
      .setMaxValues(options.length)
      .addOptions(options);

    const row = new ActionRowBuilder()
      .addComponents(selectMenu);

    try {
      await interaction.reply({ embeds: [embed], components: [row] });
      logger.info(`Role portal created by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error creating role portal:', error);
      await interaction.reply({ content: 'An error occurred while creating the role portal.', ephemeral: true });
    }
  },
};