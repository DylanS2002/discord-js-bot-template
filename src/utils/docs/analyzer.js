const fs = require('fs').promises;
const path = require('path');
const FileScanner = require('./file-scanner');
const ModuleParser = require('./module-parser');

class ProjectAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.srcPath = path.join(projectRoot, 'src');
        this.scanner = new FileScanner();
        this.parser = new ModuleParser();
        this.modules = new Map();
        this.packageInfo = null;
        this.configOptions = [];
    }

    async analyze() {
        await this.scanModules();
        await this.analyzePackageJson();
        await this.analyzeConfig();
        
        return {
            modules: this.modules,
            packageInfo: this.packageInfo,
            configOptions: this.configOptions
        };
    }

    async scanModules() {
        const files = await this.scanner.scanDirectory(this.srcPath);
        
        for (const file of files) {
            const module = await this.parser.parseFile(file.fullPath, file.relativePath);
            this.modules.set(file.relativePath, module);
        }
    }

    async analyzePackageJson() {
        const packagePath = path.join(this.projectRoot, 'package.json');
        const content = await fs.readFile(packagePath, 'utf8');
        const pkg = JSON.parse(content);
        
        this.packageInfo = {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
            dependencies: Object.keys(pkg.dependencies || {}),
            devDependencies: Object.keys(pkg.devDependencies || {})
        };
    }

    async analyzeConfig() {
        const envPath = path.join(this.projectRoot, '.env.template');
        const content = await fs.readFile(envPath, 'utf8');
        
        this.configOptions = content
            .split('\n')
            .filter(line => line.includes('=') && !line.startsWith('#'))
            .map(line => {
                const [key, value] = line.split('=');
                return { key: key.trim(), example: value.trim() };
            });
    }
}

module.exports = ProjectAnalyzer;