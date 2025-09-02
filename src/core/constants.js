// Global constants
const DISCORD_PERMISSIONS = Object.freeze({
    ADMINISTRATOR: 'Administrator',
    MANAGE_GUILD: 'ManageGuild',
    MANAGE_CHANNELS: 'ManageChannels',
    MANAGE_MESSAGES: 'ManageMessages',
    MANAGE_ROLES: 'ManageRoles',
    KICK_MEMBERS: 'KickMembers',
    BAN_MEMBERS: 'BanMembers',
    SEND_MESSAGES: 'SendMessages',
    VIEW_CHANNEL: 'ViewChannel',
    READ_MESSAGE_HISTORY: 'ReadMessageHistory'
});

const RESPONSE_STATUS = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    RATE_LIMITED: 'rate_limited',
    PERMISSION_DENIED: 'permission_denied',
    NOT_FOUND: 'not_found'
});

const RESPONSE_MESSAGES = Object.freeze({
    SUCCESS: 'Command executed successfully',
    ERROR: 'An error occurred while processing your request',
    PERMISSION_DENIED: 'You do not have permission to use this command',
    RATE_LIMITED: 'You are being rate limited. Please wait before trying again',
    NOT_FOUND: 'Command not found',
    DATABASE_ERROR: 'Database operation failed',
    INVALID_INPUT: 'Invalid input provided'
});

const DATABASE_TABLES = Object.freeze({
    SERVERS: 'servers',
    USERS: 'users',
    AUDIT_LOGS: 'audit_logs',
    RATE_LIMITS: 'rate_limits'
});

const DATABASE_COLUMNS = Object.freeze({
    SERVERS: {
        GUILD_ID: 'guild_id',
        CONFIG: 'config',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at'
    },
    USERS: {
        USER_ID: 'user_id',
        GUILD_ID: 'guild_id',
        PERMISSIONS: 'permissions',
        DATA: 'data',
        CREATED_AT: 'created_at'
    },
    AUDIT_LOGS: {
        ID: 'id',
        GUILD_ID: 'guild_id',
        USER_ID: 'user_id',
        ACTION: 'action',
        TIMESTAMP: 'timestamp',
        DATA: 'data'
    },
    RATE_LIMITS: {
        IDENTIFIER: 'identifier',
        COUNT: 'count',
        RESET_TIME: 'reset_time'
    }
});

const AUDIT_ACTIONS = Object.freeze({
    COMMAND_EXECUTED: 'command_executed',
    PERMISSION_DENIED: 'permission_denied',
    RATE_LIMITED: 'rate_limited',
    ERROR_OCCURRED: 'error_occurred',
    USER_JOINED: 'user_joined',
    USER_LEFT: 'user_left',
    SERVER_ADDED: 'server_added',
    SERVER_REMOVED: 'server_removed'
});

const LOG_LEVELS = Object.freeze({
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
});

const COMMAND_PREFIXES = Object.freeze({
    DEFAULT: '!',
    ADMIN: '!!',
    DEBUG: '?'
});

const INTENTS = Object.freeze({
    GUILDS: 'Guilds',
    GUILD_MESSAGES: 'GuildMessages',
    GUILD_MESSAGE_REACTIONS: 'GuildMessageReactions',
    MESSAGE_CONTENT: 'MessageContent',
    DIRECT_MESSAGES: 'DirectMessages'
});

module.exports = {
    DISCORD_PERMISSIONS,
    RESPONSE_STATUS,
    RESPONSE_MESSAGES,
    DATABASE_TABLES,
    DATABASE_COLUMNS,
    AUDIT_ACTIONS,
    LOG_LEVELS,
    COMMAND_PREFIXES,
    INTENTS
};