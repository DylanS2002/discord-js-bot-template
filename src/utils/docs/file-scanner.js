const fs = require('fs').promises;
const path = require('path');

class FileScanner {
    async scanDirectory(dir, prefix = '') {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.join(prefix, entry.name);
            
            if (entry.isDirectory()) {
                const subFiles = await this.scanDirectory(fullPath, relativePath);
                files.push(...subFiles);
            } else if (entry.name.endsWith('.js')) {
                files.push({
                    fullPath,
                    relativePath,
                    name: entry.name
                });
            }
        }
        
        return files;
    }

    async getFileStats(filePath) {
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        
        return {
            size: stats.size,
            lineCount: content.split('\n').length,
            modifiedTime: stats.mtime
        };
    }
}

module.exports = FileScanner;