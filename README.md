# 🎯 Discord Advice Bot

A comprehensive Discord bot with AI-powered advice, moderation tools, economy system, and community management features. Built with Discord.js v14 and modern JavaScript.

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

**Owner:** [codewithevilxd](https://github.com/codewithevilxd)

## ✨ Features

### 🎉 Entertainment & Fun
- **Random Advice**: Get inspirational advice from external APIs
- **AI-Powered Advice**: Generate personalized advice using OpenAI GPT
- **Jokes**: Random jokes from JokeAPI
- **Quotes**: Inspirational quotes from ZenQuotes
- **Memes**: Random memes from Reddit

### 📊 Statistics & Leaderboards
- **User Statistics**: Track advice usage and XP
- **XP System**: Gain XP for interactions and level up
- **Leaderboards**: View top users by XP
- **Rank System**: Check your level and progress
- **Global Stats**: Admin-only global bot statistics

### 💰 Economy System
- **Currency System**: Earn and spend virtual currency
- **Shop**: Purchase roles and items
- **Balance Tracking**: Check your currency balance
- **Item Management**: Admin-controlled shop items

### 🔧 Utilities
- **Code Paste**: Share and view code snippets with syntax highlighting
- **XP Tracking**: Monitor user engagement
- **Cooldown System**: Prevent spam with intelligent rate limiting

### ⚡ Advanced Moderation
- **Smart Warning System**: Automated warnings with risk assessment
- **Temporary Bans**: Time-based bans with automatic unbanning
- **Temporary Roles**: Assign roles with expiration
- **Auto-Moderation**: AI-powered content filtering
- **Raid Detection**: Protect against mass joins

### 🎭 Role Management
- **Auto-Role**: Automatically assign roles to new members
- **Reaction Roles**: Self-assign roles via reactions
- **Role Portals**: Interactive role selection menus
- **Role Decay**: Automatic role removal after time

### 📝 Community Tools
- **Survey System**: Create and manage community surveys
- **Interactive Embeds**: Rich Discord embeds for all features
- **Button Interactions**: Modern Discord UI components

### 🛡️ Security & Anti-Abuse
- **Spam Detection**: Advanced spam filtering
- **Caps Lock Detection**: Prevent excessive caps usage
- **Link Scanning**: Malicious link detection
- **Mention Limits**: Control excessive mentions
- **Behavior Tracking**: User risk scoring

## 🚀 Quick Start

### Adding the Bot to Your Server

#### 🚀 Quick Add (Easiest Method)
**Just click the button below to add the bot instantly:**

[![Add to Discord](https://img.shields.io/badge/Add_to_Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1414452126221860865&scope=bot&permissions=8)

**Steps:**
1. Click the "Add to Discord" button above
2. Select your Discord server from the dropdown
3. Click "Authorize" to add the bot
4. Complete the CAPTCHA if prompted
5. The bot will join your server automatically!

*This link gives the bot all necessary permissions to work properly.*

#### 📱 Mobile Instructions
If you're on mobile:
1. Tap the "Add to Discord" button
2. The Discord app will open automatically
3. Select your server and authorize
4. Bot will be added instantly

#### 🖥️ Desktop Instructions
On desktop:
1. Click the "Add to Discord" button
2. Choose your server from the list
3. Click "Continue" then "Authorize"
4. Complete any verification
5. Bot joins your server

#### ✅ What Happens After Adding
Once the bot is added:
- ✅ Bot appears in your member list
- ✅ Use `/help` to see all commands
- ✅ Start using commands like `/advice`, `/meme`, etc.
- ✅ Bot will respond to slash commands

#### 🛠️ Manual Setup (Advanced)
If you prefer to set up manually:

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Sign in with your Discord account

2. **Create or Select Application**
   - Click "New Application" or select existing one
   - Note: Application ID is `1414452126221860865`

3. **Generate Invite Link**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Choose permissions (or use Administrator for simplicity)
   - Copy the generated URL

4. **Invite the Bot**
   - Paste the URL in your browser
   - Select your server
   - Click "Authorize"

#### ❓ Troubleshooting
- **Bot not responding?** Make sure it has proper permissions
- **Commands not working?** Try `/help` first
- **Bot offline?** Check if the bot owner has it running
- **Permission errors?** Ensure bot has "Administrator" or required permissions

#### 📋 Required Permissions
The bot needs these permissions for full functionality:
- **Administrator** (simplest) OR individual permissions:
  - Send Messages, Use Slash Commands, Embed Links
  - Read Message History, Manage Roles, Manage Messages
  - Ban Members, Kick Members, View Channels

### Installation

```bash
# Clone the repository
git clone https://github.com/codewithevilxd/Discord-Advice-Bot.git
cd Discord-Advice-Bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Configuration

Edit the `.env` file with your credentials:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
OPENAI_API_KEY=your_openai_key_here
PREFIX=!
ADMIN_IDS=user_id_1,user_id_2
LOG_LEVEL=info
```

### Running the Bot

```bash
# Register slash commands (run once)
node deploy.js

# Start the bot
node index.js

# Or use the development script
npm run dev
```

## 📋 Complete Command List

### 🎉 Fun Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/advice` | Get random advice | `/advice` |
| `/ai-advice` | AI-generated advice | `/ai-advice topic:life` |
| `/joke` | Random joke | `/joke` |
| `/quote` | Inspirational quote | `/quote` |
| `/meme` | Random meme | `/meme` |

### 📊 Statistics
| Command | Description | Usage |
|---------|-------------|-------|
| `/stats` | Your statistics | `/stats` |
| `/leaderboard` | XP leaderboard | `/leaderboard limit:10` |
| `/rank` | Your rank & level | `/rank user:@user` |
| `/admin-stats` | Global stats (Admin) | `/admin-stats` |

### 💰 Economy
| Command | Description | Usage |
|---------|-------------|-------|
| `/balance` | Check balance | `/balance user:@user` |
| `/shop` | View shop items | `/shop` |
| `/buy` | Purchase item | `/buy item_number:1` |

### 🔧 Utilities
| Command | Description | Usage |
|---------|-------------|-------|
| `/paste` | Create code paste | `/paste language:javascript code:console.log('Hello')` |
| `/view-paste` | View code paste | `/view-paste paste_id:abc123` |

### ⚡ Moderation
| Command | Description | Usage |
|---------|-------------|-------|
| `/warn` | Warn user | `/warn user:@user reason:Spamming` |
| `/warnings` | View warnings | `/warnings user:@user` |
| `/temp-ban` | Temp ban user | `/temp-ban user:@user duration:1d reason:Violation` |
| `/temp-role` | Temp role | `/temp-role user:@user role:@Role duration:1h` |

### 🎭 Role Management
| Command | Description | Usage |
|---------|-------------|-------|
| `/set-autorole` | Set auto-role | `/set-autorole role:@Member` |
| `/reaction-role` | Setup reaction role | `/reaction-role message_id:123 emoji:✅ role:@Role` |
| `/role-portal` | Create role portal | `/role-portal title:Choose Roles description:Pick your roles` |

### 📝 Community
| Command | Description | Usage |
|---------|-------------|-------|
| `/create-survey` | Create survey | `/create-survey title:Server Survey question1:Rate the server` |
| `/help` | Show help | `/help` |

## ⚙️ Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DISCORD_TOKEN` | Bot token | Yes | - |
| `CLIENT_ID` | Application ID | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | No | - |
| `PREFIX` | Command prefix | No | `!` |
| `ADMIN_IDS` | Admin user IDs | No | - |
| `LOG_LEVEL` | Logging level | No | `info` |
| `DATABASE_PATH` | Database file path | No | `database.sqlite` |

### Config.json (Alternative)

```json
{
  "TOKEN": "your_bot_token",
  "CLIENT_ID": "your_client_id",
  "PREFIX": "!",
  "ADMIN_IDS": ["user_id_1", "user_id_2"],
  "OPENAI_API_KEY": "your_openai_key"
}
```

## 🗄️ Database Schema

The bot uses SQLite with the following main tables:

- `user_stats` - User XP and advice counts
- `warnings` - User warnings and moderation history
- `temp_roles` - Temporary role assignments
- `temp_bans` - Temporary bans
- `shop_items` - Shop items and purchases
- `reaction_roles` - Reaction role configurations
- `surveys` - Community surveys

## 🔧 Development

### Project Structure

```
Discord-Advice-Bot/
├── src/
│   ├── commands/     # Slash commands
│   ├── events/       # Discord events
│   └── utils/        # Utility functions
├── config.json       # Configuration file
├── database.sqlite   # SQLite database
├── index.js          # Main bot file
├── deploy.js         # Command deployment
└── package.json      # Dependencies
```

### Adding New Commands

1. Create a new file in `src/commands/`
2. Export a module with `data` (SlashCommandBuilder) and `execute` function
3. The bot will automatically load it

### Scripts

```bash
npm start      # Start the bot
npm run dev    # Start with nodemon
npm test       # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 Requirements

- **Node.js**: 18.0.0 or higher
- **Discord.js**: v14
- **SQLite3**: For database
- **OpenAI API**: For AI features (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue on GitHub
- Join our Discord server (if available)
- Check the documentation

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [OpenAI](https://openai.com/) - AI-powered features
- [Advice Slip API](https://api.adviceslip.com/) - Random advice
- [JokeAPI](https://v2.jokeapi.dev/) - Jokes
- [ZenQuotes](https://zenquotes.io/) - Quotes
- [Meme API](https://meme-api.com/) - Memes

---

**Made with ❤️ by [codewithevilxd](https://github.com/codewithevilxd)**
