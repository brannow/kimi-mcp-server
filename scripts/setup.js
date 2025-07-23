#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { EOL } from 'os';
import path from 'path';
import readline from 'readline';
import { homedir } from 'os';
import crypto from 'crypto';
import { defaults } from '../src/config/defaults.ts';

// Load .env file to merge with system environment
const envFile = process.env.KIMI_ENV_FILE || '.env';
const envPath = path.resolve(envFile);

if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    for (const line of envLines) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0 && !process.env[key.trim()]) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(q) {
    return new Promise((resolve) => rl.question(q, resolve));
}

function getFileHash(filePath) {
    if (!existsSync(filePath)) return null;
    const content = readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

function isMcpServerRegistered(serverName) {
    try {
        const result = execSync(`claude mcp list`, { encoding: 'utf8', stdio: 'pipe' });
        return result.includes(serverName);
    } catch {
        return false;
    }
}

async function installSlashCommands() {
    const claudeDir = path.join(homedir(), '.claude');
    const commandsDir = path.join(claudeDir, 'commands');
    const sourceCommandsDir = path.resolve('commands');
    const commandFiles = ['kimi.md', 'kimi-plan.md'];
    
    if (!existsSync(sourceCommandsDir)) {
        console.log('commands directory not found in project - skipping slash commands setup');
        return;
    }

    // Check which commands need updating
    const commandsToUpdate = [];
    const commandsAlreadyUpToDate = [];
    
    for (const file of commandFiles) {
        const sourcePath = path.join(sourceCommandsDir, file);
        const targetPath = path.join(commandsDir, file);
        
        if (existsSync(sourcePath)) {
            const sourceHash = getFileHash(sourcePath);
            const targetHash = getFileHash(targetPath);
            
            if (sourceHash !== targetHash) {
                commandsToUpdate.push(file);
            } else {
                commandsAlreadyUpToDate.push(file);
            }
        }
    }
    
    if (commandsAlreadyUpToDate.length > 0) {
        console.log('Commands already up to date:');
        commandsAlreadyUpToDate.forEach(file => {
            console.log(`  - /${file.replace('.md', '')}`);
        });
    }
    
    if (commandsToUpdate.length === 0) {
        console.log('All Kimi commands are already up to date.');
        return;
    }
    
    console.log(`Found ${commandsToUpdate.length} Kimi command(s) to install/update:`);
    commandsToUpdate.forEach(file => {
        const targetPath = path.join(commandsDir, file);
        const status = existsSync(targetPath) ? '(update)' : '(new)';
        console.log(`  - /${file.replace('.md', '')} ${status}`);
    });
    
    const installCommands = await question(
        'Install/update Kimi slash commands to ~/.claude/commands/? (y/n) [y]: '
    );
    
    if (installCommands.trim().toLowerCase() === 'n') {
        console.log('Skipping slash commands installation.');
        return;
    }
    
    // Create ~/.claude/commands directory if it doesn't exist
    if (!existsSync(commandsDir)) {
        mkdirSync(commandsDir, { recursive: true });
        console.log('Created ~/.claude/commands directory');
    }
    
    // Install/update command files
    let installedCount = 0;
    
    for (const file of commandsToUpdate) {
        const sourcePath = path.join(sourceCommandsDir, file);
        const targetPath = path.join(commandsDir, file);
        
        if (existsSync(sourcePath)) {
            const content = readFileSync(sourcePath, 'utf8');
            writeFileSync(targetPath, content);
            const action = existsSync(targetPath) ? 'Updated' : 'Installed';
            console.log(`${action} /${file.replace('.md', '')} command`);
            installedCount++;
        } else {
            console.log(`Source file ${file} not found`);
        }
    }
    
    if (installedCount > 0) {
        console.log(`\nSuccessfully processed ${installedCount} Kimi slash command(s)!`);
        console.log('You can now use /kimi and /kimi-plan directly in Claude Code.');
    } else {
        console.log('No commands were processed.');
    }
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
    let apiUrl = process.env.KIMI_API_URL;
    let apiModel = process.env.KIMI_API_MODEL;
    
    if (apiKey) {
        console.log('Configuration already exists.');
        console.log('  To change settings, edit your .env file or set environment variables.');
        console.log('  Current API key is set, proceeding with build and registration.\n');
    } else {
        console.log('Setting up Kimi MCP Server configuration...\n');
        console.log('API Provider Options:');
        console.log('1. Moonshot AI (Direct) - https://platform.moonshot.ai/console');
        console.log('2. OpenRouter (Free tier available) - https://openrouter.ai');
        
        const provider = await question('Choose provider (1=Moonshot, 2=OpenRouter) [1]: ');
        
        if (provider.trim() === '2') {
            apiUrl = defaults.OPENROUTER_API_URL;
            apiModel = defaults.OPENROUTER_API_MODEL;
            console.log('Using OpenRouter API endpoint.');
        } else {
            apiUrl = defaults.KIMI_API_URL;
            apiModel = defaults.KIMI_API_MODEL;
            console.log('Using Moonshot AI API endpoint.');
        }
        
        // Ask about model configuration
        console.log(`\nDefault model: ${apiModel}`);
        const useDefaultModel = await question('Use default model? (y/n) [y]: ');
        
        if (useDefaultModel.trim().toLowerCase() === 'n') {
            apiModel = await question('Enter custom model name: ');
            if (!apiModel.trim()) {
                console.log('Using default model.');
                apiModel = provider.trim() === '2' ? defaults.OPENROUTER_API_MODEL : defaults.KIMI_API_MODEL;
            }
        }
        
        apiKey = await question('Enter your API key: ');
        if (!apiKey.trim()) {
            const skip = await question(
                'No key provided. skip setup? (y/n) [y]: '
            );
            if (skip.trim().toLowerCase() !== 'n') {
                const exampleUrl = provider === '2' ? defaults.OPENROUTER_API_URL : defaults.KIMI_API_URL;
                const exampleModel = provider === '2' ? defaults.OPENROUTER_API_MODEL : defaults.KIMI_API_MODEL;
                console.info(
                    'To set the keys later:\n' +
                    '  • export KIMI_API_KEY=your_key_here         (shell)\n' +
                    `  • export KIMI_API_URL=${exampleUrl}  (optional)\n` +
                    `  • export KIMI_API_MODEL=${exampleModel}     (optional)\n` +
                    `  • or: echo "KIMI_API_KEY=your_key_here\\nKIMI_API_URL=${exampleUrl}\\nKIMI_API_MODEL=${exampleModel}" > ${envFile}`
                );
                rl.close();
                return;
            }
            console.error('API key is required.');
            process.exit(1);
        }

        // Write configuration to env file
        const dotEnvPath = path.resolve(envFile);
        let envContent = `KIMI_API_KEY=${apiKey.trim()}${EOL}`;
        if (apiUrl) {
            envContent += `KIMI_API_URL=${apiUrl}${EOL}`;
        }
        if (apiModel) {
            envContent += `KIMI_API_MODEL=${apiModel}${EOL}`;
        }
        writeFileSync(dotEnvPath, envContent);
        console.log(`Configuration saved to ${envFile}\n`);
    }

    if (!existsSync('node_modules')) {
        console.log('Installing dependencies…');
        execSync('npm install', { stdio: 'inherit' });
    }

    console.log('Building TypeScript…');
    execSync('npm run build', { stdio: 'inherit' });

    const absPath = path.resolve('dist/server.js');

    try {
        execSync('which claude', { stdio: 'ignore' });
        
        // Check if server is already registered (any scope)
        const isRegistered = isMcpServerRegistered('kimi-server');
        
        if (isRegistered) {
            console.log('MCP server \'kimi-server\' is already registered.');
            
            const updateRegistration = await question(
                'Update the existing registration? (y/n) [n]: '
            );
            
            if (updateRegistration.trim().toLowerCase() === 'y') {
                // Remove existing registration (no scope needed)
                try {
                    execSync(`claude mcp remove kimi-server`, { stdio: 'inherit' });
                    console.log('Removed existing registration.');
                } catch (error) {
                    console.log(`Warning: Could not remove existing registration: ${error.message}`);
                }

                // Ask for new scope
                const scope = await question(
                    'Choose new scope:\n' +
                    '  1 = user (global, all projects)\n' +
                    '  2 = project (team-shared)\n' +
                    '[1]: '
                );

                const trimmedScope = scope.trim() || '1';
                const scopeName = (trimmedScope === '2' || trimmedScope.toLowerCase() === 'project') ? 'project' : 'user';

                try {
                    execSync(`claude mcp add --scope ${scopeName} kimi-server node ${absPath}`, { stdio: 'inherit' });
                    console.log(`Re-registered kimi-server in ${scopeName} scope.`);
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log(`kimi-server already registered in ${scopeName} scope.`);
                    } else {
                        throw error;
                    }
                }
            }
        } else {
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
                try {
                    execSync(`claude mcp add --scope user kimi-server node ${absPath}`, { stdio: 'inherit' });
                    console.log('Registered kimi-server in user scope.');
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log('kimi-server already registered in user scope.');
                    } else {
                        throw error;
                    }
                }
            } else if (trimmedScope === '2' || trimmedScope.toLowerCase() === 'project') {
                // Register with project scope
                try {
                    execSync(`claude mcp add --scope project kimi-server node ${absPath}`, { stdio: 'inherit' });
                    console.log('Registered kimi-server in project scope.');
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log('kimi-server already registered in project scope.');
                    } else {
                        throw error;
                    }
                }
            } else {
                console.log('Skipping MCP registration.');
            }
        }
    } catch(err) {
        console.log('Claude CLI not found – skipping MCP registration.', err);
    }

    // Install slash commands
    await installSlashCommands();

    rl.close();
})();
