#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { EOL } from 'os';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(q) {
    return new Promise((resolve) => rl.question(q, resolve));
}

(async () => {
    console.log('Kimi MCP Server – one-shot setup\n');

    const nodeVersion = process.versions.node;
    const major = Number(nodeVersion.split('.')[0]);
    if (major < 18) {
        console.error(`Node v18+ required (you have v${nodeVersion}).`);
        process.exit(1);
    }

    let apiKey = process.env.KIMI_API_KEY;
    let source = 'env';
    if (apiKey) {
        console.info('API key already set in system environment.');
        const useEnv = await question(
            'Use the system value (0) or create a local .env file (1)? [0]: '
        );
        if (useEnv.trim().toLowerCase() === '1') {
            source = 'prompt';
        } else {
            console.info('Proceeding without writing .env.');
        }
    } else {
        source = 'prompt';
    }

    if (source === 'prompt') {
        apiKey = await question('Enter your KIMI_API_KEY: ');
        if (!apiKey.trim()) {
            const skip = await question(
                'No key provided. skip setup? (y/n) [y]: '
            );
            if (skip.trim().toLowerCase() !== 'n') {
                console.info(
                    'To set the key later:\n' +
                    '  • export KIMI_API_KEY=sk-xxx         (shell)\n' +
                    '  • or: echo "KIMI_API_KEY=sk-xxx" > .env'
                );
                rl.close();
                return;
            }
            console.error('API key is required.');
            process.exit(1);
        }

        const dotEnvPath = path.resolve('.env');
        if (!existsSync(dotEnvPath)) {
            writeFileSync(dotEnvPath, `KIMI_API_KEY=${apiKey.trim()}${EOL}`);
            console.log('.env file created.');
        } else {
            console.log('.env already exists – skipping.');
        }
    }

    if (!existsSync('node_modules')) {
        console.log('Installing dependencies…');
        execSync('npm install', { stdio: 'inherit' });
    }

    console.log('Building TypeScript…');
    execSync('npm run build', { stdio: 'inherit' });

    try {
        execSync('which claude', { stdio: 'ignore' });
        const scope = await question(
            'Register server in Claude Code?\n' +
            '  1 = user (global, all projects)\n' +
            '  2 = project (team-shared)\n' +
            '  0 = skip\n' +
            '[0]: '
        );

        const trimmedScope = scope.trim() || '0';
        if (trimmedScope === '1' || trimmedScope.toLowerCase() === 'user') {
            // Register with user scope
            execSync(`claude mcp add --scope user kimi-server node ${absPath} -e KIMI_API_KEY=\${KIMI_API_KEY}`, { stdio: 'inherit' });
        } else if (trimmedScope === '2' || trimmedScope.toLowerCase() === 'project') {
            // Register with project scope
            execSync(`claude mcp add --scope project kimi-server node ${absPath} -e KIMI_API_KEY=\${KIMI_API_KEY}`, { stdio: 'inherit' });
        } else {
            console.log('Skipping MCP registration.');
        }
    } catch {
        console.log('Claude CLI not found – skipping MCP registration.');
    }

    rl.close();
})();
