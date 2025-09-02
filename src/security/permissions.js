const { DISCORD_PERMISSIONS } = require('../core/constants');
const { select, insert } = require('../data');
const { DATABASE_TABLES } = require('../core/constants');

function hasPermission(userPermissions, requiredPermission) {
    if (!Array.isArray(userPermissions)) return false;
    if (!requiredPermission) return true;
    
    if (userPermissions.includes(DISCORD_PERMISSIONS.ADMINISTRATOR)) {
        return true;
    }
    
    return userPermissions.includes(requiredPermission);
}

function hasAnyPermission(userPermissions, requiredPermissions) {
    if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
    
    if (userPermissions.includes(DISCORD_PERMISSIONS.ADMINISTRATOR)) {
        return true;
    }
    
    return requiredPermissions.some(permission => userPermissions.includes(permission));
}

function hasAllPermissions(userPermissions, requiredPermissions) {
    if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
    
    if (userPermissions.includes(DISCORD_PERMISSIONS.ADMINISTRATOR)) {
        return true;
    }
    
    return requiredPermissions.every(permission => userPermissions.includes(permission));
}

function checkRoleHierarchy(userRoles, targetRole) {
    if (!Array.isArray(userRoles) || !targetRole) return false;
    
    const highestUserRole = Math.max(...userRoles.map(role => role.position || 0));
    const targetPosition = targetRole.position || 0;
    
    return highestUserRole > targetPosition;
}

async function getUserPermissions(userId, guildId) {
    try {
        const user = await select(DATABASE_TABLES.USERS, { user_id: userId, guild_id: guildId });
        
        if (!user) {
            return [];
        }
        
        return JSON.parse(user.permissions || '[]');
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
}

async function setUserPermissions(userId, guildId, permissions) {
    try {
        const userData = {
            user_id: userId,
            guild_id: guildId,
            permissions: JSON.stringify(permissions),
            data: JSON.stringify({})
        };
        
        await insert(DATABASE_TABLES.USERS, userData);
        return true;
    } catch (error) {
        console.error('Error setting user permissions:', error);
        return false;
    }
}

function validateBotPermissions(botMember, requiredPermissions) {
    if (!botMember || !Array.isArray(requiredPermissions)) return false;
    
    const botPermissions = botMember.permissions.toArray();
    
    if (botPermissions.includes(DISCORD_PERMISSIONS.ADMINISTRATOR)) {
        return true;
    }
    
    return requiredPermissions.every(permission => botPermissions.includes(permission));
}

async function checkCommandPermission(userId, guildId, requiredPermission) {
    if (!requiredPermission) return true;
    
    try {
        const userPermissions = await getUserPermissions(userId, guildId);
        return hasPermission(userPermissions, requiredPermission);
    } catch (error) {
        console.error('Error checking command permission:', error);
        return false;
    }
}

module.exports = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkRoleHierarchy,
    getUserPermissions,
    setUserPermissions,
    validateBotPermissions,
    checkCommandPermission
};