const fs = require('fs').promises;
const path = require('path');

class ModuleParser {
    async parseFile(filePath, relativePath) {
        const content = await fs.readFile(filePath, 'utf8');
        
        return {
            path: relativePath,
            exports: this.extractExports(content),
            dependencies: this.extractDependencies(content),
            lineCount: content.split('\n').length,
            description: this.getDescription(relativePath)
        };
    }

    extractExports(content) {
        const exports = [];
        const exportRegex = /module\.exports\s*=\s*{([^}]+)}/;
        const match = content.match(exportRegex);
        
        if (match) {
            const exportList = match[1]
                .split(',')
                .map(e => e.trim().split(':')[0].trim())
                .filter(e => e && !e.startsWith('//'));
            exports.push(...exportList);
        }
        
        const singleExport = /module\.exports\s*=\s*(\w+)/;
        const singleMatch = content.match(singleExport);
        if (singleMatch && !match) {
            exports.push(singleMatch[1]);
        }
        
        return exports;
    }

    extractDependencies(content) {
        const deps = new Set();
        const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
        let match;
        
        while ((match = requireRegex.exec(content)) !== null) {
            const dep = match[1];
            if (!dep.startsWith('.')) {
                deps.add(dep);
            }
        }
        
        return Array.from(deps);
    }

    getDescription(relativePath) {
        const descriptions = {
            'core/config.js': 'Environment configuration management with validation',
            'core/constants.js': 'Application constants and enums',
            'core/client.js': 'Discord client initialization and setup',
            'core/shutdown.js': 'Graceful shutdown handling',
            'data/database.js': 'SQLite connection management',
            'data/operations.js': 'Generic database CRUD operations',
            'data/helpers.js': 'Database helper functions',
            'data/index.js': 'Database module exports',
            'security/permissions.js': 'Role-based permission validation',
            'security/ratelimit.js': 'Rate limiting with database storage',
            'handlers/message.js': 'Plugin-based message processing',
            'handlers/slash.js': 'Slash command handling with plugins',
            'handlers/interaction.js': 'Discord interaction processing',
            'handlers/command.js': 'Event handler registration and management',
            'handlers/audit.js': 'Audit logging and monitoring',
            'api/server.js': 'REST API server setup',
            'api/routes.js': 'API endpoint definitions',
            'api/middleware.js': 'API middleware and authentication',
            'utils/logger.js': 'File logging with rotation',
            'utils/docs-generator.js': 'Documentation generation orchestrator',
            'utils/docs/analyzer.js': 'Project structure analysis',
            'utils/docs/file-scanner.js': 'File system scanning utilities',
            'utils/docs/module-parser.js': 'Module metadata extraction',
            'utils/docs/readme-generator.js': 'README.md content generation',
            'utils/docs/writer.js': 'Documentation file writing'
        };
        
        return descriptions[relativePath] || 'Module functionality';
    }
}

module.exports = ModuleParser;