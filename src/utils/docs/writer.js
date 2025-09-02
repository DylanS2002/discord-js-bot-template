const fs = require('fs').promises;
const path = require('path');

class DocsWriter {
    constructor(projectRoot, docsPath) {
        this.projectRoot = projectRoot;
        this.docsPath = docsPath;
    }

    async writeAll(docs) {
        await this.ensureDocsDirectory();
        
        await this.writeReadme(docs.readme);
        await this.writeArchitecture(docs.architecture);
        await this.writeApi(docs.api);
        
        console.log('\nDocumentation generated:');
        console.log('- README.md');
        console.log('- docs/architecture.md');
        console.log('- docs/api.md');
    }

    async ensureDocsDirectory() {
        await fs.mkdir(this.docsPath, { recursive: true });
    }

    async writeReadme(content) {
        const readmePath = path.join(this.projectRoot, 'README.md');
        await fs.writeFile(readmePath, content);
    }

    async writeArchitecture(content) {
        const archPath = path.join(this.docsPath, 'architecture.md');
        await fs.writeFile(archPath, content);
    }

    async writeApi(content) {
        const apiPath = path.join(this.docsPath, 'api.md');
        await fs.writeFile(apiPath, content);
    }

    async writeFile(filename, content) {
        const filePath = path.join(this.docsPath, filename);
        await fs.writeFile(filePath, content);
    }
}

module.exports = DocsWriter;