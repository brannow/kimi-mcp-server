#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(q) {
    return new Promise((resolve) => rl.question(q, resolve));
}

async function removeSlashCommands() {
    const claudeDir = path.join(homedir(), '.claude');
    const commandsDir = path.join(claudeDir, 'commands');
    
    if (!existsSync(commandsDir)) {
        console.log('~/.claude/commands directory not found - no slash commands to remove');
        return;
    }
    
    const commandFiles = ['kimi.md', 'kimi-plan.md'];
    const existingCommands = commandFiles.filter(file => 
        existsSync(path.join(commandsDir, file))
    );
    
    if (existingCommands.length === 0) {
        console.log('No Kimi slash commands found - nothing to remove');
        return;
    }
    
    console.log(`Found ${existingCommands.length} Kimi slash command(s):`);
    existingCommands.forEach(file => {
        console.log(`  - /${file.replace('.md', '')}`);
    });
    
    const removeCommands = await question(
        '\nRemove Kimi slash commands from ~/.claude/commands/? (y/n) [y]: '
    );
    
    if (removeCommands.trim().toLowerCase() === 'n') {
        console.log('Keeping slash commands.');
        return;
    }
    
    // Remove command files
    let removedCount = 0;
    
    for (const file of commandFiles) {
        const commandPath = path.join(commandsDir, file);
        if (existsSync(commandPath)) {
            try {
                execSync(`rm "${commandPath}"`, { stdio: 'ignore' });
                console.log(`Removed /${file.replace('.md', '')} command`);
                removedCount++;
            } catch (error) {
                console.log(`Could not remove ${file}: ${error.message}`);
            }
        }
    }
    
    if (removedCount > 0) {
        console.log(`\nSuccessfully removed ${removedCount} Kimi slash command(s)!`);
    } else {
        console.log('No commands were removed.');
    }
}

(async () => {
    console.log('Kimi MCP Server – Uninstall\n');

    try {
        execSync('which claude', { stdio: 'ignore' });
    } catch {
        console.log('Claude CLI not found – nothing to uninstall.');
        rl.close();
        return;
    }

    // Check what's currently registered
    console.log('Checking current MCP registrations...\n');

    try {
        const output = execSync('claude mcp list', { encoding: 'utf8' });
        if (!output.includes('kimi-server')) {
            console.log('kimi-server is not currently registered.');
            rl.close();
            return;
        }

        console.log('Current registrations:');
        console.log(output);
    } catch (error) {
        console.log('Could not list current registrations.');
    }

    const confirm = await question(
        'Remove kimi-server from Claude Code? (y/n) [y]: '
    );

    if (confirm.trim().toLowerCase() === 'n') {
        console.log('Uninstall cancelled.');
        rl.close();
        return;
    }

    // Remove server (no scope needed for remove command)
    try {
        console.log('Removing kimi-server...');
        execSync('claude mcp remove kimi-server', { stdio: 'inherit' });
        console.log('\nkimi-server has been successfully removed from Claude Code');
    } catch (error) {
        console.log(`\nCould not remove kimi-server: ${error.message}`);
        console.log('It may have already been removed or not registered.');
    }

    // Remove slash commands
    await removeSlashCommands();

    rl.close();
})();
