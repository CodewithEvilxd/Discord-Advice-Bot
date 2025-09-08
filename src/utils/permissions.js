const config = require('./config');

function isAdmin(userId) {
  // For simplicity, check if user ID is in a list or has admin role
  // In a real bot, you'd check guild permissions
  const adminIds = config.adminIds || [];
  return adminIds.includes(userId);
}

function hasPermission(userId, permission) {
  // Extend this for more permissions
  if (permission === 'admin') {
    return isAdmin(userId);
  }
  return true; // Default allow
}

module.exports = {
  isAdmin,
  hasPermission,
};