const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../core/config');
const routes = require('./routes');
const middleware = require('./middleware');

let server = null;

function createApiServer() {
    const app = express();
    
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.use(express.json({ limit: '10mb' }));
    
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'Too many requests' }
    });
    app.use(limiter);
    
    app.use(middleware.authenticate);
    
    app.use('/api', routes);
    
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    app.use((req, res) => {
        res.status(404).json({ error: 'Endpoint not found' });
    });
    
    app.use((error, req, res, next) => {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
    
    return app;
}

function startApiServer() {
    if (!config.api.enabled || server) return null;
    
    const app = createApiServer();
    
    return new Promise((resolve, reject) => {
        server = app.listen(config.api.port, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`API server running on port ${config.api.port}`);
            resolve(server);
        });
        
        server.setTimeout(config.api.timeout);
    });
}

function stopApiServer() {
    return new Promise((resolve) => {
        if (server) {
            server.close(() => {
                server = null;
                console.log('API server stopped');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    startApiServer,
    stopApiServer,
    isRunning: () => server !== null
};