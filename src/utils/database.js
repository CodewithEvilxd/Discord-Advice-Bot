const sqlite3 = require('sqlite3').verbose();
const config = require('./config');
const logger = require('./logger');

const db = new sqlite3.Database(config.databasePath, (err) => {
  if (err) {
    logger.error('Error opening database:', err.message);
  } else {
    logger.info('Connected to the SQLite database.');
    initializeTables();
  }
});

function initializeTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      advice_count INTEGER DEFAULT 0,
      ai_advice_count INTEGER DEFAULT 0,
      last_advice DATETIME
    )
  `, (err) => {
    if (err) {
      logger.error('Error creating user_stats table:', err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      preferred_language TEXT DEFAULT 'en',
      notifications_enabled INTEGER DEFAULT 1
    )
  `, (err) => {
    if (err) {
      logger.error('Error creating user_preferences table:', err.message);
    }
  });

  // New tables for advanced features
  db.run(`
    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      moderator_id TEXT,
      reason TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      guild_id TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating warnings table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS temp_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      role_id TEXT,
      guild_id TEXT,
      expires_at DATETIME,
      reason TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating temp_roles table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user_xp (
      user_id TEXT PRIMARY KEY,
      guild_id TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      last_message DATETIME
    )
  `, (err) => {
    if (err) logger.error('Error creating user_xp table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS server_currency (
      user_id TEXT,
      guild_id TEXT,
      balance INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, guild_id)
    )
  `, (err) => {
    if (err) logger.error('Error creating server_currency table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      guild_id TEXT,
      channel_id TEXT,
      action TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) logger.error('Error creating activity_logs table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      task_type TEXT,
      data TEXT,
      execute_at DATETIME,
      executed INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) logger.error('Error creating scheduled_tasks table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      type TEXT,
      config TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating integrations table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      name TEXT,
      description TEXT,
      price INTEGER,
      role_id TEXT,
      type TEXT DEFAULT 'role'
    )
  `, (err) => {
    if (err) logger.error('Error creating shop_items table:', err.message);
  });

  // Advanced Moderation Tables
  db.run(`
    CREATE TABLE IF NOT EXISTS user_behavior (
      user_id TEXT,
      guild_id TEXT,
      join_date DATETIME,
      message_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      last_activity DATETIME,
      risk_score INTEGER DEFAULT 0,
      flagged BOOLEAN DEFAULT 0,
      PRIMARY KEY (user_id, guild_id)
    )
  `, (err) => {
    if (err) logger.error('Error creating user_behavior table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS raid_detection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      detection_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      join_count INTEGER,
      time_window INTEGER,
      risk_level TEXT,
      action_taken TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating raid_detection table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS temp_bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      guild_id TEXT,
      reason TEXT,
      banned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      moderator_id TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating temp_bans table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS auto_roles (
      guild_id TEXT PRIMARY KEY,
      role_id TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating auto_roles table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS reaction_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      message_id TEXT,
      emoji TEXT,
      role_id TEXT
    )
  `, (err) => {
    if (err) logger.error('Error creating reaction_roles table:', err.message);
  });

  // Advanced Role Management Tables
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      role_id TEXT,
      required_level INTEGER,
      required_xp INTEGER
    )
  `, (err) => {
    if (err) logger.error('Error creating activity_roles table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      role_id TEXT,
      quiz_name TEXT,
      required_score INTEGER
    )
  `, (err) => {
    if (err) logger.error('Error creating skill_roles table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS event_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      role_id TEXT,
      event_name TEXT,
      expires_at DATETIME
    )
  `, (err) => {
    if (err) logger.error('Error creating event_roles table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS role_decay (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      role_id TEXT,
      decay_days INTEGER,
      last_active DATETIME
    )
  `, (err) => {
    if (err) logger.error('Error creating role_decay table:', err.message);
  });

  // Community Onboarding Tables
  db.run(`
    CREATE TABLE IF NOT EXISTS onboarding_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      step_number INTEGER,
      title TEXT,
      description TEXT,
      channel_id TEXT,
      required_action TEXT,
      reward_xp INTEGER DEFAULT 0,
      next_step_id INTEGER
    )
  `, (err) => {
    if (err) logger.error('Error creating onboarding_steps table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user_onboarding (
      user_id TEXT,
      guild_id TEXT,
      current_step INTEGER DEFAULT 1,
      completed_steps TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      PRIMARY KEY (user_id, guild_id)
    )
  `, (err) => {
    if (err) logger.error('Error creating user_onboarding table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      title TEXT,
      questions TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    )
  `, (err) => {
    if (err) logger.error('Error creating surveys table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER,
      user_id TEXT,
      responses TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) logger.error('Error creating survey_responses table:', err.message);
  });
}

function incrementAdviceCount(userId, isAi = false) {
  const column = isAi ? 'ai_advice_count' : 'advice_count';
  db.run(`
    INSERT INTO user_stats (user_id, ${column}, last_advice)
    VALUES (?, 1, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      ${column} = ${column} + 1,
      last_advice = datetime('now')
  `, [userId], function(err) {
    if (err) {
      logger.error('Error incrementing advice count:', err.message);
    }
  });
}

function getUserStats(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM user_stats WHERE user_id = ?', [userId], (err, row) => {
      if (err) {
        logger.error('Error getting user stats:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function setUserPreference(userId, key, value) {
  db.run(`
    INSERT INTO user_preferences (user_id, ${key})
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET ${key} = ?
  `, [userId, value, value], function(err) {
    if (err) {
      logger.error('Error setting user preference:', err.message);
    }
  });
}

function getUserPreference(userId, key) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${key} FROM user_preferences WHERE user_id = ?`, [userId], (err, row) => {
      if (err) {
        logger.error('Error getting user preference:', err.message);
        reject(err);
      } else {
        resolve(row ? row[key] : null);
      }
    });
  });
}

function addWarning(userId, moderatorId, reason, guildId) {
  db.run(`
    INSERT INTO warnings (user_id, moderator_id, reason, guild_id)
    VALUES (?, ?, ?, ?)
  `, [userId, moderatorId, reason, guildId], function(err) {
    if (err) logger.error('Error adding warning:', err.message);
  });
}

function getWarnings(userId, guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, rows) => {
      if (err) {
        logger.error('Error getting warnings:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addTempRole(userId, roleId, guildId, expiresAt, reason) {
  db.run(`
    INSERT INTO temp_roles (user_id, role_id, guild_id, expires_at, reason)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, roleId, guildId, expiresAt, reason], function(err) {
    if (err) logger.error('Error adding temp role:', err.message);
  });
}

function getExpiredTempRoles() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM temp_roles WHERE expires_at < datetime("now")', [], (err, rows) => {
      if (err) {
        logger.error('Error getting expired temp roles:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function removeTempRole(id) {
  db.run('DELETE FROM temp_roles WHERE id = ?', [id], function(err) {
    if (err) logger.error('Error removing temp role:', err.message);
  });
}

function addXP(userId, guildId, xpAmount, client) {
  db.get('SELECT level, xp FROM user_xp WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, row) => {
    if (err) {
      logger.error('Error getting current XP:', err.message);
      return;
    }

    const currentLevel = row ? row.level : 1;
    const currentXP = row ? row.xp : 0;
    const newXP = currentXP + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1;

    db.run(`
      INSERT INTO user_xp (user_id, guild_id, xp, level, last_message)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        xp = ?,
        level = ?,
        last_message = datetime('now')
    `, [userId, guildId, newXP, newLevel, newXP, newLevel], function(err) {
      if (err) {
        logger.error('Error adding XP:', err.message);
        return;
      }

      // Award currency for leveling up
      if (newLevel > currentLevel) {
        const currencyReward = newLevel * 10; // 10 currency per level
        addCurrency(userId, guildId, currencyReward);
        logger.info(`User ${userId} leveled up to ${newLevel} and received ${currencyReward} currency`);

        // Check for activity-based role promotions
        if (client) {
          checkActivityRolePromotion(userId, guildId, newLevel, client);
        }
      }
    });
  });
}

async function checkActivityRolePromotion(userId, guildId, newLevel, client) {
  try {
    const activityRoles = await getActivityRoles(guildId);
    const guild = client.guilds.cache.get(guildId);

    if (!guild) return;

    const member = await guild.members.fetch(userId);
    if (!member) return;

    for (const roleData of activityRoles) {
      if (newLevel >= roleData.required_level) {
        const role = guild.roles.cache.get(roleData.role_id);
        if (role && !member.roles.cache.has(role.id) && role.position < guild.members.me.roles.highest.position) {
          await member.roles.add(role);
          logger.info(`Promoted ${member.user.tag} to ${role.name} for reaching level ${newLevel}`);

          // Update role activity
          updateRoleActivity(guildId, roleData.role_id);
        }
      }
    }
  } catch (error) {
    logger.error('Error checking activity role promotion:', error);
  }
}

function getUserXP(userId, guildId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM user_xp WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, row) => {
      if (err) {
        logger.error('Error getting user XP:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getTopUsersByXP(guildId, limit = 10) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user_xp WHERE guild_id = ? ORDER BY xp DESC LIMIT ?', [guildId, limit], (err, rows) => {
      if (err) {
        logger.error('Error getting top users by XP:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addCurrency(userId, guildId, amount) {
  db.run(`
    INSERT INTO server_currency (user_id, guild_id, balance)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, guild_id) DO UPDATE SET balance = balance + ?
  `, [userId, guildId, amount, amount], function(err) {
    if (err) logger.error('Error adding currency:', err.message);
  });
}

function getCurrency(userId, guildId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT balance FROM server_currency WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, row) => {
      if (err) {
        logger.error('Error getting currency:', err.message);
        reject(err);
      } else {
        resolve(row ? row.balance : 0);
      }
    });
  });
}

function logActivity(userId, guildId, channelId, action) {
  db.run(`
    INSERT INTO activity_logs (user_id, guild_id, channel_id, action)
    VALUES (?, ?, ?, ?)
  `, [userId, guildId, channelId, action], function(err) {
    if (err) logger.error('Error logging activity:', err.message);
  });
}

function addScheduledTask(guildId, taskType, data, executeAt) {
  db.run(`
    INSERT INTO scheduled_tasks (guild_id, task_type, data, execute_at)
    VALUES (?, ?, ?, ?)
  `, [guildId, taskType, data, executeAt], function(err) {
    if (err) logger.error('Error adding scheduled task:', err.message);
  });
}

function getPendingTasks() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM scheduled_tasks WHERE execute_at <= datetime("now") AND executed = 0', [], (err, rows) => {
      if (err) {
        logger.error('Error getting pending tasks:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function markTaskExecuted(id) {
  db.run('UPDATE scheduled_tasks SET executed = 1 WHERE id = ?', [id], function(err) {
    if (err) logger.error('Error marking task executed:', err.message);
  });
}

function setAutoRole(guildId, roleId) {
  db.run(`
    INSERT INTO auto_roles (guild_id, role_id)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET role_id = ?
  `, [guildId, roleId, roleId], function(err) {
    if (err) logger.error('Error setting auto-role:', err.message);
  });
}

function getAutoRole(guildId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT role_id FROM auto_roles WHERE guild_id = ?', [guildId], (err, row) => {
      if (err) {
        logger.error('Error getting auto-role:', err.message);
        reject(err);
      } else {
        resolve(row ? row.role_id : null);
      }
    });
  });
}

function addReactionRole(guildId, messageId, emoji, roleId) {
  db.run(`
    INSERT INTO reaction_roles (guild_id, message_id, emoji, role_id)
    VALUES (?, ?, ?, ?)
  `, [guildId, messageId, emoji, roleId], function(err) {
    if (err) logger.error('Error adding reaction role:', err.message);
  });
}

function getReactionRole(messageId, emoji) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM reaction_roles WHERE message_id = ? AND emoji = ?', [messageId, emoji], (err, row) => {
      if (err) {
        logger.error('Error getting reaction role:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function removeReactionRole(messageId, emoji) {
  db.run('DELETE FROM reaction_roles WHERE message_id = ? AND emoji = ?', [messageId, emoji], function(err) {
    if (err) logger.error('Error removing reaction role:', err.message);
  });
}

function getShopItems(guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM shop_items WHERE guild_id = ?', [guildId], (err, rows) => {
      if (err) {
        logger.error('Error getting shop items:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addShopItem(guildId, name, description, price, roleId, type = 'role') {
  db.run(`
    INSERT INTO shop_items (guild_id, name, description, price, role_id, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [guildId, name, description, price, roleId, type], function(err) {
    if (err) logger.error('Error adding shop item:', err.message);
  });
}

function purchaseItem(userId, guildId, itemId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM shop_items WHERE id = ? AND guild_id = ?', [itemId, guildId], (err, item) => {
      if (err) {
        logger.error('Error getting shop item:', err.message);
        reject(err);
        return;
      }

      if (!item) {
        reject(new Error('Item not found'));
        return;
      }

      getCurrency(userId, guildId).then(balance => {
        if (balance < item.price) {
          reject(new Error('Insufficient funds'));
          return;
        }

        // Deduct currency
        addCurrency(userId, guildId, -item.price);

        resolve(item);
      }).catch(reject);
    });
  });
}

// Advanced Moderation Functions
function updateUserBehavior(userId, guildId, action) {
  const now = new Date().toISOString();

  db.run(`
    INSERT INTO user_behavior (user_id, guild_id, join_date, last_activity)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, guild_id) DO UPDATE SET
      message_count = message_count + CASE WHEN ? = 'message' THEN 1 ELSE 0 END,
      warning_count = warning_count + CASE WHEN ? = 'warning' THEN 1 ELSE 0 END,
      last_activity = ?,
      risk_score = CASE
        WHEN message_count > 100 AND warning_count > 2 THEN risk_score + 10
        WHEN message_count > 50 AND warning_count > 0 THEN risk_score + 5
        ELSE risk_score + 1
      END,
      flagged = CASE WHEN risk_score > 50 THEN 1 ELSE 0 END
  `, [userId, guildId, now, now, action, action, now], function(err) {
    if (err) logger.error('Error updating user behavior:', err.message);
  });
}

function getUserBehavior(userId, guildId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM user_behavior WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, row) => {
      if (err) {
        logger.error('Error getting user behavior:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function logRaidDetection(guildId, joinCount, timeWindow, riskLevel, action) {
  db.run(`
    INSERT INTO raid_detection (guild_id, join_count, time_window, risk_level, action_taken)
    VALUES (?, ?, ?, ?, ?)
  `, [guildId, joinCount, timeWindow, riskLevel, action], function(err) {
    if (err) logger.error('Error logging raid detection:', err.message);
  });
}

function addTempBan(userId, guildId, reason, durationMinutes, moderatorId) {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  db.run(`
    INSERT INTO temp_bans (user_id, guild_id, reason, expires_at, moderator_id)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, guildId, reason, expiresAt, moderatorId], function(err) {
    if (err) logger.error('Error adding temp ban:', err.message);
  });
}

function getExpiredTempBans() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM temp_bans WHERE expires_at < datetime("now")', [], (err, rows) => {
      if (err) {
        logger.error('Error getting expired temp bans:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function removeTempBan(id) {
  db.run('DELETE FROM temp_bans WHERE id = ?', [id], function(err) {
    if (err) logger.error('Error removing temp ban:', err.message);
  });
}

// Advanced Role Management Functions
function addActivityRole(guildId, roleId, requiredLevel, requiredXp) {
  db.run(`
    INSERT INTO activity_roles (guild_id, role_id, required_level, required_xp)
    VALUES (?, ?, ?, ?)
  `, [guildId, roleId, requiredLevel, requiredXp], function(err) {
    if (err) logger.error('Error adding activity role:', err.message);
  });
}

function getActivityRoles(guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM activity_roles WHERE guild_id = ? ORDER BY required_level ASC', [guildId], (err, rows) => {
      if (err) {
        logger.error('Error getting activity roles:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addSkillRole(guildId, roleId, quizName, requiredScore) {
  db.run(`
    INSERT INTO skill_roles (guild_id, role_id, quiz_name, required_score)
    VALUES (?, ?, ?, ?)
  `, [guildId, roleId, quizName, requiredScore], function(err) {
    if (err) logger.error('Error adding skill role:', err.message);
  });
}

function addEventRole(guildId, roleId, eventName, expiresAt) {
  db.run(`
    INSERT INTO event_roles (guild_id, role_id, event_name, expires_at)
    VALUES (?, ?, ?, ?)
  `, [guildId, roleId, eventName, expiresAt], function(err) {
    if (err) logger.error('Error adding event role:', err.message);
  });
}

function getExpiredEventRoles() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM event_roles WHERE expires_at < datetime("now")', [], (err, rows) => {
      if (err) {
        logger.error('Error getting expired event roles:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function removeEventRole(id) {
  db.run('DELETE FROM event_roles WHERE id = ?', [id], function(err) {
    if (err) logger.error('Error removing event role:', err.message);
  });
}

function addRoleDecay(guildId, roleId, decayDays) {
  db.run(`
    INSERT INTO role_decay (guild_id, role_id, decay_days, last_active)
    VALUES (?, ?, ?, datetime('now'))
  `, [guildId, roleId, decayDays], function(err) {
    if (err) logger.error('Error adding role decay:', err.message);
  });
}

function updateRoleActivity(guildId, roleId) {
  db.run(`
    UPDATE role_decay SET last_active = datetime('now')
    WHERE guild_id = ? AND role_id = ?
  `, [guildId, roleId], function(err) {
    if (err) logger.error('Error updating role activity:', err.message);
  });
}

function getInactiveRoles() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT rd.*, datetime(rd.last_active, '+' || rd.decay_days || ' days') as decay_date
      FROM role_decay rd
      WHERE datetime(rd.last_active, '+' || rd.decay_days || ' days') < datetime('now')
    `, [], (err, rows) => {
      if (err) {
        logger.error('Error getting inactive roles:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Community Onboarding Functions
function addOnboardingStep(guildId, stepNumber, title, description, channelId, requiredAction, rewardXp, nextStepId) {
  db.run(`
    INSERT INTO onboarding_steps (guild_id, step_number, title, description, channel_id, required_action, reward_xp, next_step_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [guildId, stepNumber, title, description, channelId, requiredAction, rewardXp, nextStepId], function(err) {
    if (err) logger.error('Error adding onboarding step:', err.message);
  });
}

function getOnboardingSteps(guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM onboarding_steps WHERE guild_id = ? ORDER BY step_number ASC', [guildId], (err, rows) => {
      if (err) {
        logger.error('Error getting onboarding steps:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getUserOnboarding(userId, guildId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM user_onboarding WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, row) => {
      if (err) {
        logger.error('Error getting user onboarding:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function updateUserOnboarding(userId, guildId, currentStep, completedSteps) {
  db.run(`
    INSERT INTO user_onboarding (user_id, guild_id, current_step, completed_steps)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, guild_id) DO UPDATE SET
      current_step = ?,
      completed_steps = ?
  `, [userId, guildId, currentStep, completedSteps, currentStep, completedSteps], function(err) {
    if (err) logger.error('Error updating user onboarding:', err.message);
  });
}

function completeUserOnboarding(userId, guildId) {
  db.run(`
    UPDATE user_onboarding SET completed_at = datetime('now')
    WHERE user_id = ? AND guild_id = ?
  `, [userId, guildId], function(err) {
    if (err) logger.error('Error completing user onboarding:', err.message);
  });
}

function createSurvey(guildId, title, questions, createdBy, expiresAt) {
  db.run(`
    INSERT INTO surveys (guild_id, title, questions, created_by, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `, [guildId, title, questions, createdBy, expiresAt], function(err) {
    if (err) logger.error('Error creating survey:', err.message);
  });
}

function getActiveSurveys(guildId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM surveys
      WHERE guild_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `, [guildId], (err, rows) => {
      if (err) {
        logger.error('Error getting active surveys:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function submitSurveyResponse(surveyId, userId, responses) {
  db.run(`
    INSERT INTO survey_responses (survey_id, user_id, responses)
    VALUES (?, ?, ?)
  `, [surveyId, userId, responses], function(err) {
    if (err) logger.error('Error submitting survey response:', err.message);
  });
}

module.exports = {
  incrementAdviceCount,
  getUserStats,
  setUserPreference,
  getUserPreference,
  addWarning,
  getWarnings,
  addTempRole,
  getExpiredTempRoles,
  removeTempRole,
  addXP,
  getUserXP,
  getTopUsersByXP,
  addCurrency,
  getCurrency,
  logActivity,
  addScheduledTask,
  getPendingTasks,
  markTaskExecuted,
  setAutoRole,
  getAutoRole,
  addReactionRole,
  getReactionRole,
  removeReactionRole,
  getShopItems,
  addShopItem,
  purchaseItem,
  updateUserBehavior,
  getUserBehavior,
  logRaidDetection,
  addTempBan,
  getExpiredTempBans,
  removeTempBan,
  addActivityRole,
  getActivityRoles,
  addSkillRole,
  addEventRole,
  getExpiredEventRoles,
  removeEventRole,
  addRoleDecay,
  updateRoleActivity,
  getInactiveRoles,
  addOnboardingStep,
  getOnboardingSteps,
  getUserOnboarding,
  updateUserOnboarding,
  completeUserOnboarding,
  createSurvey,
  getActiveSurveys,
  submitSurveyResponse,
};