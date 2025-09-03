# Architecture Overview

## Module Dependencies

### api\middleware.js
- **Purpose**: Module functionality
- **Exports**: authenticate, validateGuildId, handleAsync
- **Dependencies**: 

### api\routes.js
- **Purpose**: Module functionality
- **Exports**: router
- **Dependencies**: express

### api\server.js
- **Purpose**: Module functionality
- **Exports**: startApiServer, stopApiServer, isRunning
- **Dependencies**: express, cors, express-rate-limit

### core\client.js
- **Purpose**: Module functionality
- **Exports**: client
- **Dependencies**: discord.js

### core\config.js
- **Purpose**: Module functionality
- **Exports**: config
- **Dependencies**: dotenv

### core\constants.js
- **Purpose**: Module functionality
- **Exports**: DISCORD_PERMISSIONS, RESPONSE_STATUS, RESPONSE_MESSAGES, DATABASE_TABLES, DATABASE_COLUMNS, AUDIT_ACTIONS, LOG_LEVELS, COMMAND_PREFIXES, INTENTS
- **Dependencies**: 

### core\shutdown.js
- **Purpose**: Module functionality
- **Exports**: shutdown
- **Dependencies**: 

### data\database.js
- **Purpose**: Module functionality
- **Exports**: initializeDatabase, closeDatabase, getDatabaseConnection, isDatabaseReady
- **Dependencies**: sqlite3, fs, path

### data\helpers.js
- **Purpose**: Module functionality
- **Exports**: insertAuditLog, cleanupExpiredRateLimits, insertServer, insertUser, insertRateLimit
- **Dependencies**: 

### data\index.js
- **Purpose**: Module functionality
- **Exports**: initializeDatabase, closeDatabase, isDatabaseReady, insert, select, deleteRows, parseJsonFields, prepareJsonData, insertAuditLog, cleanupExpiredRateLimits, insertServer, insertUser, insertRateLimit
- **Dependencies**: 

### data\operations.js
- **Purpose**: Module functionality
- **Exports**: insert, select, deleteRows, parseJsonFields, prepareJsonData
- **Dependencies**: 

### handlers\audit.js
- **Purpose**: Module functionality
- **Exports**: logCommandExecution, logPermissionDenied, logRateLimit, logError, logUserJoin, logUserLeave, logServerAdd, logServerRemove, queryAuditLogs, getAuditStats
- **Dependencies**: 

### handlers\command.js
- **Purpose**: Module functionality
- **Exports**: registerEventHandlers, reloadAllPlugins, getLoadedPlugins
- **Dependencies**: 

### handlers\interaction.js
- **Purpose**: Module functionality
- **Exports**: processInteraction, reloadInteractionPlugins, getLoadedPlugins
- **Dependencies**: fs, path

### handlers\message.js
- **Purpose**: Module functionality
- **Exports**: processMessage, reloadPlugins, getLoadedPlugins, commands
- **Dependencies**: fs, path

### handlers\slash.js
- **Purpose**: Module functionality
- **Exports**: processSlashCommand, getSlashCommandData, reloadSlashPlugins, getLoadedPlugins
- **Dependencies**: fs, path

### main.js
- **Purpose**: Module functionality
- **Exports**: 
- **Dependencies**: 

### plugins\commands\ping.js
- **Purpose**: Module functionality
- **Exports**: 
- **Dependencies**: 

### plugins\interactions\button.js
- **Purpose**: Module functionality
- **Exports**: 
- **Dependencies**: 

### plugins\messages\welcome.js
- **Purpose**: Module functionality
- **Exports**: 
- **Dependencies**: 

### plugins\slash\info.js
- **Purpose**: Module functionality
- **Exports**: 
- **Dependencies**: discord.js

### security\permissions.js
- **Purpose**: Module functionality
- **Exports**: hasPermission, hasAnyPermission, hasAllPermissions, checkRoleHierarchy, getUserPermissions, setUserPermissions, validateBotPermissions, checkCommandPermission
- **Dependencies**: 

### security\ratelimit.js
- **Purpose**: Module functionality
- **Exports**: checkRateLimit, getRemainingTime, resetUserRateLimit, getUserRateLimitInfo, cleanupOldRateLimits
- **Dependencies**: 

### utils\docs\analyzer.js
- **Purpose**: Module functionality
- **Exports**: ProjectAnalyzer
- **Dependencies**: fs, path

### utils\docs\ast-parser.js
- **Purpose**: Module functionality
- **Exports**: ASTParser
- **Dependencies**: fs, @babel/parser

### utils\docs\file-scanner.js
- **Purpose**: Module functionality
- **Exports**: FileScanner
- **Dependencies**: fs, path

### utils\docs\module-parser.js
- **Purpose**: Module functionality
- **Exports**: ModuleParser
- **Dependencies**: fs

### utils\docs\readme-generator.js
- **Purpose**: Module functionality
- **Exports**: ReadmeGenerator
- **Dependencies**: discord.js

### utils\docs\writer.js
- **Purpose**: Module functionality
- **Exports**: DocsWriter
- **Dependencies**: fs, path

### utils\docs-generator.js
- **Purpose**: Module functionality
- **Exports**: DocsGenerator
- **Dependencies**: fs, path

### utils\logger.js
- **Purpose**: Module functionality
- **Exports**: write, rotateLogFile, cleanupOldLogs
- **Dependencies**: fs, path


## Performance Characteristics

All modules are designed for production performance:
- Database operations under 10ms
- Memory usage optimized
- Concurrent operation support
- Graceful error handling

## Plugin System Architecture

The plugin system uses runtime discovery:
1. Scan plugin directories on startup
2. Load modules matching plugin interface
3. Register with appropriate handlers
4. Apply security and rate limiting
5. Isolate errors per plugin

undefined

undefined