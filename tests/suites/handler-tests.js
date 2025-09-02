const { MockGenerator } = require('../helpers');

async function run(benchmark) {
    await benchmark.testComponent('command_parsing', async () => {
        const message = MockGenerator.generateMessage(
            MockGenerator.generateId(),
            MockGenerator.generateId()
        );
        
        message.content = '!test command with args';
        
        const prefix = '!';
        if (!message.content.startsWith(prefix)) return null;
        
        const args = message.content.slice(prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        
        return { command, args };
    }, 3000);

    await benchmark.testComponent('plugin_loading', async () => {
        const { getLoadedPlugins } = require('../../src/handlers/command');
        const plugins = getLoadedPlugins();
        return plugins;
    }, 500);

    await benchmark.testComponent('audit_logging', async () => {
        const { initializeDatabase, closeDatabase } = require('../../src/data');
        const { logCommandExecution } = require('../../src/handlers/audit');
        
        await initializeDatabase();
        
        const guildId = MockGenerator.generateId();
        const userId = MockGenerator.generateId();
        await logCommandExecution(guildId, userId, 'test', [], true);
        
        await closeDatabase();
    }, 1000);

    await benchmark.testComponent('api_server_lifecycle', async () => {
        const { startApiServer, stopApiServer } = require('../../src/api/server');
        
        process.env.API_TOKEN = 'test_token';
        process.env.API_ENABLED = 'true';
        
        await startApiServer();
        await stopApiServer();
        
        return true;
    }, 100);

    await benchmark.testComponent('docs_generation', async () => {
        const DocsGenerator = require('../../src/utils/docs-generator');
        const generator = new DocsGenerator();
        
        const projectData = await generator.analyzer.analyze();
        const readme = generator.readmeGenerator.generate(projectData);
        
        return readme.length > 1000;
    }, 50);
}

module.exports = { run };