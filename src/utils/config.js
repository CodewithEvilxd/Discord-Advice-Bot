require('dotenv').config();

const config = {
  token: process.env.DISCORD_TOKEN || require('../../config.json').TOKEN,
  clientId: process.env.CLIENT_ID || require('../../config.json').CLIENT_ID,
  prefix: process.env.PREFIX || require('../../config.json').PREFIX,
  openaiApiKey: process.env.OPENAI_API_KEY,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  databasePath: process.env.DATABASE_PATH || './database.sqlite',
  logLevel: process.env.LOG_LEVEL || 'info',
  adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : require('../../config.json').ADMIN_IDS || [],
};

module.exports = config;