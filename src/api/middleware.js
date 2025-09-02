function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const validToken = process.env.API_TOKEN;
    
    if (!validToken) {
        return res.status(500).json({ error: 'API not configured' });
    }
    
    if (!token || token !== validToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
}

function validateGuildId(req, res, next) {
    const { guildId } = req.params;
    
    if (!guildId || !/^\d+$/.test(guildId)) {
        return res.status(400).json({ error: 'Invalid guild ID' });
    }
    
    next();
}

function handleAsync(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    authenticate,
    validateGuildId,
    handleAsync
};