# discord-bot-template

Production-ready Discord bot template

A production-ready Discord bot template with plugin-based architecture, comprehensive security, and REST API management interface.

## Features

- **Plugin System**: Auto-discovery for commands, slash commands, interactions, and message handlers
- **Security**: Role-based permissions with database-backed rate limiting
- **Database**: SQLite with migration system and audit trails
- **API**: REST endpoints for external management and monitoring
- **Monitoring**: Performance benchmarking and comprehensive logging
- **Architecture**: Modular design following DRY/KISS principles

## Quick Start

```bash
# Clone and install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env with your bot token and settings

# Run the bot
npm start

# Development mode with hot reload
npm run dev

# Run performance benchmarks
npm test

# Generate documentation
npm run docs
```

## Configuration

Edit `.env` file with the following options:

- **DISCORD_TOKEN**: your_bot_token_here
- **CLIENT_ID**: your_client_id_here
- **DB_PATH**: ./data/bot.db
- **API_PORT**: 3000
- **API_ENABLED**: false
- **API_TOKEN**: your_secure_api_token_here
- **CORS_ORIGIN**: *
- **RATE_LIMIT_WINDOW**: 60000
- **RATE_LIMIT_MAX_REQUESTS**: 10
- **LOG_LEVEL**: info

## Project Structure

```
api\middleware.js (36 lines)
api\routes.js (86 lines)
api\server.js (85 lines)
core\client.js (41 lines)
core\config.js (60 lines)
core\constants.js (113 lines)
core\shutdown.js (40 lines)
data\database.js (68 lines)
data\helpers.js (56 lines)
data\index.js (19 lines)
data\operations.js (95 lines)
handlers\audit.js (115 lines)
handlers\command.js (99 lines)
handlers\interaction.js (119 lines)
handlers\message.js (133 lines)
handlers\slash.js (127 lines)
main.js (16 lines)
plugins\commands\ping.js (15 lines)
plugins\interactions\button.js (22 lines)
plugins\messages\welcome.js (14 lines)
plugins\slash\info.js (19 lines)
security\permissions.js (110 lines)
security\ratelimit.js (143 lines)
utils\docs-generator.js (140 lines)
utils\docs\analyzer.js (66 lines)
utils\docs\ast-parser.js (100 lines)
utils\docs\file-scanner.js (40 lines)
utils\docs\module-parser.js (110 lines)
utils\docs\readme-generator.js (150 lines)
utils\docs\writer.js (48 lines)
utils\logger.js (87 lines)
```

## Plugin Development

### Command Plugin Example

```javascript
// src/plugins/commands/hello.js
module.exports = {
    type: 'command',
    name: 'hello',
    description: 'Greet users',
    permission: null,

    async execute(message, args) {
        await message.reply(`Hello ${message.author.username}!`);
    }
};
```

### Slash Command Plugin Example

```javascript
// src/plugins/slash/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    type: 'slash',
    name: 'ping',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    async execute(interaction) {
        const ping = interaction.client.ws.ping;
        await interaction.reply(`Pong! ${ping}ms`);
    }
};
```

## API Endpoints

The REST API provides external access to bot management:

- `GET /health` - System health check
- `GET /api/stats` - Plugin and system statistics
- `GET /api/servers` - List managed servers
- `GET /api/servers/:id/config` - Server configuration
- `PUT /api/servers/:id/config` - Update server config
- `GET /api/servers/:id/audit` - Audit logs

Authentication required via `Authorization: Bearer <API_TOKEN>` header.

## Database Management

The bot uses SQLite for data persistence. Manual database access:

```bash
# Open database
sqlite3 ./data/bot.db

# View tables
.tables

# Query audit logs
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;

# Export data
.dump > backup.sql
```

## Performance

Benchmark results show optimal performance:
- Configuration loading: < 1ms
- Database operations: < 10ms
- Permission checks: < 2ms
- Plugin loading: < 1ms

Run `npm test` to benchmark your environment.

## License

MIT License - see LICENSE file for details.
