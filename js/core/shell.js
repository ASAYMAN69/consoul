import { vfs } from './vfs.js';

class Shell {
    constructor() {
        this.cwd = '/home/ayman';
        this.history = this.loadHistory();
        this.env = {
            'HOME': '/home/ayman',
            'USER': 'ayman',
            'PATH': '/bin'
        };
        this.aliases = {};
        this.isRoot = false;
        this.authMode = false;
        this.pendingSudoCommand = null;
        this.validCommands = [
            'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 'echo', 'write', 'append', 
            'clear', 'grep', 'find', 'export', 'alias', 'help', 'history', 'reset', 
            'whoami', 'date', 'uptime', 'uname', 'exit', 'env', 'mv', 'cp',
            'sudo', 'chmod', 'chown', 'ps', 'top', 'who', 'head', 'tail', 'wc', 'edit', 'fetch', 'matrix',
            'sh', 'ping', 'curl', 'theme', 'snake', 'nano', 'vim'
        ];
    }

    loadHistory() {
        const data = localStorage.getItem('consoul_history');
        return data ? JSON.parse(data) : [];
    }

    saveHistory(command) {
        if (command && command.trim() && !this.authMode) {
            // Remove if already exists to move to end (most recent)
            this.history = this.history.filter(h => h !== command);
            this.history.push(command);
            if (this.history.length > 50) this.history.shift();
            localStorage.setItem('consoul_history', JSON.stringify(this.history));
        }
    }

    getHistorySuggestion(input) {
        if (!input.trim()) return '';
        // Find most recent command starting with input
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].startsWith(input) && this.history[i] !== input) {
                return this.history[i];
            }
        }
        return '';
    }

    async execute(input) {
        if (this.authMode) {
            return await this.verifySudo(input);
        }

        const trimmedInput = input.trim();
        if (!trimmedInput) return '';

        this.saveHistory(trimmedInput);

        // Check for redirection at the very end
        let redirectTarget = null;
        let redirectAppend = false;
        let commandPart = trimmedInput;

        if (trimmedInput.includes('>>')) {
            const parts = trimmedInput.split('>>');
            commandPart = parts[0].trim();
            redirectTarget = parts[1].trim();
            redirectAppend = true;
        } else if (trimmedInput.includes('>')) {
            const parts = trimmedInput.split('>');
            commandPart = parts[0].trim();
            redirectTarget = parts[1].trim();
            redirectAppend = false;
        }

        // Split by pipes
        const stages = commandPart.split('|').map(s => s.trim());
        let pipeInput = '';

        for (const stage of stages) {
            const tokens = this.tokenize(stage);
            if (tokens.length === 0) continue;
            
            const commandName = tokens[0];
            const args = tokens.slice(1);

            // Handle expansion (env vars)
            const expandedArgs = args.map(arg => {
                if (arg.startsWith('$')) {
                    return this.getEnv(arg.slice(1));
                }
                return arg;
            });

            this.pipeInput = pipeInput;

            // Check aliases
            const actualCommand = this.aliases[commandName] || commandName;

            if (!this.validCommands.includes(actualCommand)) {
                return `consoul: command not found: ${commandName}`;
            }

            try {
                const module = await import(`../commands/${actualCommand}.js`);
                if (module && module.default) {
                    pipeInput = await module.default(expandedArgs, this);
                } else {
                    return `consoul: internal error: ${actualCommand}.js is empty`;
                }
            } catch (e) {
                console.error(e);
                return `consoul: error executing command: ${commandName}`;
            }
        }

        // Handle redirection if present
        if (redirectTarget) {
            const existing = vfs.getNode(redirectTarget, this.cwd);
            if (!existing) {
                vfs.createNode(redirectTarget, 'file', pipeInput, this.cwd);
            } else {
                vfs.updateFile(redirectTarget, pipeInput, redirectAppend, this.cwd);
            }
            return ''; // Redirected output doesn't print to terminal
        }

        // Reset root status after command execution
        this.isRoot = false;
        return pipeInput;
    }

    async verifySudo(password) {
        this.authMode = false;
        if (password === 'aymanisgoated') {
            this.isRoot = true;
            const cmd = this.pendingSudoCommand;
            this.pendingSudoCommand = null;
            return await this.execute(cmd);
        } else {
            this.pendingSudoCommand = null;
            return 'sudo: 1 incorrect password attempt. You seriously didnt even read the docs? https://github.com/ASAYMAN69/consoul.git go read ts.';
        }
    }

    tokenize(input) {
        // Simple tokenizer handling spaces and tilde expansion
        const matches = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        return matches.map(token => {
            let t = token.replace(/"/g, '');
            if (t.startsWith('~/')) {
                t = this.env['HOME'] + t.slice(1);
            } else if (t === '~') {
                t = this.env['HOME'];
            }
            return t;
        });
    }

    setEnv(key, value) {
        this.env[key] = value;
    }

    getEnv(key) {
        return this.env[key] || '';
    }

    setCWD(path) {
        const node = vfs.getNode(path, this.cwd);
        if (node && node.type === 'dir') {
            this.cwd = vfs.resolvePath(path, this.cwd);
            return true;
        }
        return false;
    }

    async suggest(input) {
        const tokens = input.split(/\s+/);
        const lastToken = tokens[tokens.length - 1];
        
        if (tokens.length === 1) {
            // Suggest commands
            const commands = [
                'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 'echo', 'write', 'append', 
                'clear', 'grep', 'find', 'export', 'alias', 'help', 'history', 'reset', 
                'whoami', 'date', 'uptime', 'uname', 'exit', 'env', 'mv', 'cp',
                'sudo', 'chmod', 'chown', 'ps', 'top', 'who', 'head', 'tail', 'wc', 'edit', 'fetch', 'matrix',
                'sh', 'ping', 'curl', 'theme', 'snake', 'nano', 'vim'
            ];
            return commands.filter(c => c.startsWith(lastToken));
        } else {
            // Suggest paths
            return vfs.getSuggestions(lastToken, this.cwd);
        }
    }
}

export const shell = new Shell();
