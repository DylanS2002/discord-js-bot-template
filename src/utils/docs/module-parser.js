const fs = require('fs').promises;
const ASTParser = require('./ast-parser');

class ModuleParser {
    constructor() {
        this.astParser = new ASTParser();
    }

    async parseFile(filePath, relativePath) {
        const content = await fs.readFile(filePath, 'utf8');
        
        const astResult = await this.astParser.parseFile(filePath);
        
        if (astResult) {
            return {
                path: relativePath,
                exports: astResult.exports,
                dependencies: astResult.dependencies,
                lineCount: content.split('\n').length,
                description: this.getDescription(relativePath),
                parserUsed: 'AST'
            };
        } else {
            return {
                path: relativePath,
                exports: this.extractExports(content),
                dependencies: this.extractDependencies(content),
                lineCount: content.split('\n').length,
                description: this.getDescription(relativePath),
                parserUsed: 'regex'
            };
        }
    }

    extractExports(content) {
        const exports = [];
        const match = content.match(/module\.exports\s*=\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/);
        
        if (match) {
            const objectContent = match[1];
            const properties = objectContent
                .split(',')
                .map(prop => {
                    const colonIndex = prop.indexOf(':');
                    if (colonIndex === -1) return prop.trim();
                    return prop.slice(0, colonIndex).trim();
                })
                .map(prop => prop.replace(/['"]/g, ''))
                .filter(prop => prop && !prop.startsWith('//') && /^[a-zA-Z_$][\w$]*$/.test(prop));
            
            exports.push(...properties);
        } else {
            const singleMatch = content.match(/module\.exports\s*=\s*(\w+)/);
            if (singleMatch) {
                exports.push(singleMatch[1]);
            }
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