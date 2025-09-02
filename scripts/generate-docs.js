#!/usr/bin/env node

const DocsGenerator = require('../src/utils/docs-generator');

async function main() {
    const generator = new DocsGenerator();
    
    try {
        await generator.generate();
        
        console.log('\nDocumentation generated:');
        console.log('- README.md');
        console.log('- docs/architecture.md');
        console.log('- docs/api.md');
        
    } catch (error) {
        console.error('Failed to generate docs:', error);
        process.exit(1);
    }
}

main();
