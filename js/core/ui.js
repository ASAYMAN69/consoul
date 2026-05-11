import { shell } from './shell.js';

const outputLog = document.getElementById('output-log');
const terminalInput = document.getElementById('terminal-input');
const promptLabel = document.getElementById('prompt');
const terminalContainer = document.getElementById('terminal-container');
const autoSuggestSpan = document.getElementById('autosuggest');
const editorContainer = document.getElementById('editor-container');
const editorTextArea = document.getElementById('editor-textarea');
const editorHeader = document.getElementById('editor-header');
const matrixCanvas = document.getElementById('matrix-canvas');
const snakeCanvas = document.getElementById('snake-canvas');

class UI {
    constructor() {
        this.historyIndex = -1;
        this.currentSuggestion = '';
        this.isExclusive = false;
        this.init();
    }

    init() {
        terminalInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        terminalInput.addEventListener('input', () => this.handleInput());
        terminalContainer.addEventListener('click', () => {
            if (!this.isExclusive) terminalInput.focus();
        });

        // Load persisted theme
        const savedTheme = localStorage.getItem('consoul_theme');
        if (savedTheme) document.body.classList.add(`theme-${savedTheme}`);

        this.printBanner();
        this.updatePrompt();
    }

    openEditor(filename, initialContent, onSave, onExit) {
        this.isExclusive = true;
        editorContainer.classList.remove('hidden');
        editorHeader.textContent = `Editing: ${filename}`;
        editorTextArea.value = initialContent;
        editorTextArea.focus();

        const handleEditorKeydown = (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                onSave(editorTextArea.value);
                editorHeader.textContent = `Editing: ${filename} (SAVED)`;
                setTimeout(() => editorHeader.textContent = `Editing: ${filename}`, 1000);
            } else if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                this.closeEditor();
                editorTextArea.removeEventListener('keydown', handleEditorKeydown);
                onExit();
            }
        };

        editorTextArea.addEventListener('keydown', handleEditorKeydown);
    }

    closeEditor() {
        this.isExclusive = false;
        editorContainer.classList.add('hidden');
        terminalInput.focus();
    }

    openMatrix(onExit) {
        this.isExclusive = true;
        matrixCanvas.classList.remove('hidden');
        
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~';
        const fontSize = 16;
        const columns = matrixCanvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleExit = (e) => {
            if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
                clearInterval(interval);
                this.closeMatrix();
                window.removeEventListener('keydown', handleExit);
                onExit();
            }
        };

        window.addEventListener('keydown', handleExit);
    }

    closeMatrix() {
        this.isExclusive = false;
        matrixCanvas.classList.add('hidden');
        terminalInput.focus();
    }

    openSnake(onExit) {
        this.isExclusive = true;
        snakeCanvas.classList.remove('hidden');
        
        const ctx = snakeCanvas.getContext('2d');
        const box = 20;
        snakeCanvas.width = 400;
        snakeCanvas.height = 400;

        let snake = [{x: 9 * box, y: 10 * box}];
        let food = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
        let d;
        let score = 0;

        const handleKey = (e) => {
            if (e.keyCode === 37 && d !== "RIGHT") d = "LEFT";
            else if (e.keyCode === 38 && d !== "DOWN") d = "UP";
            else if (e.keyCode === 39 && d !== "LEFT") d = "RIGHT";
            else if (e.keyCode === 40 && d !== "UP") d = "DOWN";
            else if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
                clearInterval(game);
                this.closeSnake();
                document.removeEventListener("keydown", handleKey);
                onExit();
            }
        };

        document.addEventListener("keydown", handleKey);

        const draw = () => {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

            for (let i = 0; i < snake.length; i++) {
                ctx.fillStyle = (i === 0) ? "green" : "lime";
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
                ctx.strokeStyle = "black";
                ctx.strokeRect(snake[i].x, snake[i].y, box, box);
            }

            ctx.fillStyle = "red";
            ctx.fillRect(food.x, food.y, box, box);

            let snakeX = snake[0].x;
            let snakeY = snake[0].y;

            if (d === "LEFT") snakeX -= box;
            if (d === "UP") snakeY -= box;
            if (d === "RIGHT") snakeX += box;
            if (d === "DOWN") snakeY += box;

            if (snakeX === food.x && snakeY === food.y) {
                score++;
                food = {
                    x: Math.floor(Math.random() * 19 + 1) * box,
                    y: Math.floor(Math.random() * 19 + 1) * box
                };
            } else {
                snake.pop();
            }

            let newHead = {x: snakeX, y: snakeY};

            if (snakeX < 0 || snakeX >= snakeCanvas.width || snakeY < 0 || snakeY >= snakeCanvas.height || collision(newHead, snake)) {
                clearInterval(game);
                this.printOutput(`Game Over! Score: ${score}`);
                this.closeSnake();
                document.removeEventListener("keydown", handleKey);
                onExit();
            }

            snake.unshift(newHead);

            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText(score, 2 * box, 1.6 * box);
        };

        function collision(head, array) {
            for (let i = 0; i < array.length; i++) {
                if (head.x === array[i].x && head.y === array[i].y) return true;
            }
            return false;
        }

        let game = setInterval(draw, 100);
    }

    closeSnake() {
        this.isExclusive = false;
        snakeCanvas.classList.add('hidden');
        terminalInput.focus();
    }

    printBanner() {
        const banner = `
   ______                               __ 
  / ____/___  ____  _________  __  ____/ /
 / /   / __ \\/ __ \\/ ___/ __ \\/ / / / __  / 
/ /___/ /_/ / / / (__  ) /_/ / /_/ / /_/ /  
\\____/\\____/_/ /_/____/\\____/\\__,_/\\__,_/   
                                            
Welcome to Consoul Terminal v1.0.0
Type 'help' to see available commands.
        `;
        this.printOutput(banner.trim());
    }

    updatePrompt() {
        if (shell.authMode) {
            promptLabel.textContent = `[sudo] password for ${shell.getEnv('USER')}: `;
            terminalInput.type = 'password';
            return;
        }

        terminalInput.type = 'text';
        const user = shell.getEnv('USER');
        const host = 'jerry';
        let displayCwd = shell.cwd;
        const home = shell.getEnv('HOME');
        
        if (displayCwd === home) displayCwd = '~';
        else if (displayCwd.startsWith(home)) displayCwd = '~' + displayCwd.slice(home.length);

        promptLabel.textContent = `${user}@${host}:${displayCwd}$ `;
    }

    handleInput() {
        if (shell.authMode) return;
        const input = terminalInput.value;
        this.currentSuggestion = shell.getHistorySuggestion(input);
        
        if (this.currentSuggestion) {
            autoSuggestSpan.textContent = this.currentSuggestion;
        } else {
            autoSuggestSpan.textContent = '';
        }
    }

    async handleKeydown(e) {
        if (e.key === 'Enter') {
            const input = terminalInput.value;
            terminalInput.value = '';
            autoSuggestSpan.textContent = '';
            
            if (!shell.authMode) {
                this.printCommand(input);
            } else {
                this.printOutput(''); // Just a newline for password
            }

            const output = await shell.execute(input);
            if (output) this.printOutput(output);
            
            this.updatePrompt();
            this.historyIndex = -1;
            this.scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.key === 'ArrowRight' || e.key === 'End') {
            if (this.currentSuggestion && terminalInput.selectionStart === terminalInput.value.length) {
                e.preventDefault();
                terminalInput.value = this.currentSuggestion;
                this.handleInput();
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            await this.handleTab();
        }
    }

    async handleTab() {
        const input = terminalInput.value;
        const suggestions = await shell.suggest(input);

        if (suggestions.length === 1) {
            const tokens = input.split(/\s+/);
            const lastToken = tokens[tokens.length - 1];
            const suggestion = suggestions[0];
            
            // Complete the token
            terminalInput.value = input.slice(0, input.length - lastToken.length) + suggestion;
        } else if (suggestions.length > 1) {
            this.printOutput(suggestions.join('  '));
            this.scrollToBottom();
        }
    }

    printCommand(input) {
        const line = document.createElement('div');
        line.className = 'line command-line';
        line.textContent = `${promptLabel.textContent}${input}`;
        outputLog.appendChild(line);
    }

    printOutput(output) {
        const line = document.createElement('div');
        line.className = 'line output-line';
        line.textContent = output;
        outputLog.appendChild(line);
    }

    navigateHistory(direction) {
        const history = shell.history;
        if (history.length === 0) return;

        if (this.historyIndex === -1) {
            this.historyIndex = history.length;
        }

        const newIndex = this.historyIndex + direction;
        if (newIndex >= 0 && newIndex < history.length) {
            this.historyIndex = newIndex;
            terminalInput.value = history[this.historyIndex];
        } else if (newIndex >= history.length) {
            this.historyIndex = -1;
            terminalInput.value = '';
        }
    }

    scrollToBottom() {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }
}

export const ui = new UI();
