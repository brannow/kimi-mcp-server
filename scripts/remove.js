#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(q) {
    return new Promise((resolve) => rl.question(q, resolve));
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

    // Try to remove from both scopes
    let removed = false;

    try {
        console.log('Removing from user scope...');
        execSync('claude mcp remove --scope user kimi-server', { stdio: 'inherit' });
        console.log('Removed from user scope');
        removed = true;
    } catch (error) {
        console.log('Not found in user scope (or already removed)');
    }

    try {
        console.log('Removing from project scope...');
        execSync('claude mcp remove --scope project kimi-server', { stdio: 'inherit' });
        console.log('Removed from project scope');
        removed = true;
    } catch (error) {
        console.log('Not found in project scope (or already removed)');
    }

    if (removed) {
        console.log('\n kimi-server has been successfully removed from Claude Code');
    } else {
        console.log('\n kimi-server was not found in any scope');
    }

    rl.close();
})();
