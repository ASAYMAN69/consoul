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
const tetrisCanvas = document.getElementById('tetris-canvas');

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

        // Add auto-copy listener
        document.addEventListener('selectionchange', () => this.handleSelection());

        // Load persisted theme
        const savedTheme = localStorage.getItem('consoul_theme');
        if (savedTheme) {
            document.body.classList.add(`theme-${savedTheme}`);
        } else {
            // Default to matrix if no theme set
            document.body.classList.add('theme-matrix');
        }

        // Start sys monitor
        setInterval(() => this.updateSysMonitor(), 2000);

        this.printBanner();
        this.updatePrompt();
    }

    handleSelection() {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            navigator.clipboard.writeText(selection.toString()).catch(err => {
                console.error("Auto-copy failed", err);
            });
        }
    }

    updateSysMonitor() {
        const cpu = Math.floor(Math.random() * 10);
        const mem = Math.floor(20 + Math.random() * 5);
        document.getElementById('sys-monitor').textContent = `CPU: ${cpu}% | MEM: ${mem}%`;
    }

    openEditor(filename, initialContent, onSave, onExit, editorType = 'edit') {
        this.isExclusive = true;
        editorContainer.classList.remove('hidden');
        
        if (editorType === 'nano') {
            editorHeader.textContent = `  GNU nano 6.2                        ${filename}`;
            document.getElementById('editor-footer').innerHTML = '^G Get Help  ^O Write Out  ^W Where Is  ^K Cut Text    ^J Justify    ^C Cur Pos\n^X Exit      ^R Read File  ^\\ Replace    ^U Uncut Text  ^T To Spell   ^_ Go To Line';
        } else {
            editorHeader.textContent = `Editing: ${filename}`;
            document.getElementById('editor-footer').innerHTML = '^S Save | ^X Exit';
        }

        editorTextArea.value = initialContent;
        editorTextArea.focus();

        let isModified = false;
        editorTextArea.addEventListener('input', () => { isModified = true; });

        const handleEditorKeydown = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'o')) {
                e.preventDefault();
                onSave(editorTextArea.value);
                isModified = false;
                const originalHeader = editorHeader.textContent;
                editorHeader.textContent = `[ Wrote ${editorTextArea.value.split('\n').length} lines ]`;
                setTimeout(() => editorHeader.textContent = originalHeader, 2000);
            } else if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                if (isModified) {
                    const confirmSave = confirm("Save modified buffer?");
                    if (confirmSave) {
                        onSave(editorTextArea.value);
                    }
                }
                this.closeEditor();
                editorTextArea.removeEventListener('keydown', handleEditorKeydown);
                onExit();
            }
        };

        editorTextArea.addEventListener('keydown', handleEditorKeydown);
        // Force focus back if user clicks away
        editorTextArea.addEventListener('blur', () => {
            if (this.isExclusive) {
                setTimeout(() => editorTextArea.focus(), 0);
            }
        });
    }

    closeEditor() {
        this.isExclusive = false;
        editorContainer.classList.add('hidden');
        terminalInput.focus();
    }

    openVim(filename, initialContent, onSave, onExit) {
        this.isExclusive = true;
        editorContainer.classList.remove('hidden');
        
        let mode = 'NORMAL';
        let commandLine = '';
        
        const updateVimUI = () => {
            editorHeader.textContent = `  ${filename}                                 `;
            if (mode === 'INSERT') {
                document.getElementById('editor-footer').textContent = '-- INSERT --';
            } else if (mode === 'COMMAND') {
                document.getElementById('editor-footer').textContent = ':' + commandLine;
            } else {
                document.getElementById('editor-footer').textContent = '';
            }
        };

        editorTextArea.value = initialContent;
        editorTextArea.readOnly = true;
        updateVimUI();
        editorTextArea.focus();

        const handleVimKeydown = (e) => {
            if (mode === 'NORMAL') {
                if (e.key === 'i') {
                    e.preventDefault();
                    mode = 'INSERT';
                    editorTextArea.readOnly = false;
                } else if (e.key === ':') {
                    e.preventDefault();
                    mode = 'COMMAND';
                    commandLine = '';
                }
            } else if (mode === 'INSERT') {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    mode = 'NORMAL';
                    editorTextArea.readOnly = true;
                }
            } else if (mode === 'COMMAND') {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const cmd = commandLine.trim();
                    if (cmd === 'w' || cmd === 'wq') {
                        onSave(editorTextArea.value);
                    }
                    if (cmd === 'q' || cmd === 'wq' || cmd === 'q!') {
                        this.closeVim();
                        editorTextArea.removeEventListener('keydown', handleVimKeydown);
                        onExit();
                    }
                    mode = 'NORMAL';
                    commandLine = '';
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    mode = 'NORMAL';
                    commandLine = '';
                } else if (e.key.length === 1) {
                    commandLine += e.key;
                } else if (e.key === 'Backspace') {
                    commandLine = commandLine.slice(0, -1);
                }
            }
            updateVimUI();
        };

        editorTextArea.addEventListener('keydown', handleVimKeydown);
    }

    closeVim() {
        this.isExclusive = false;
        editorContainer.classList.add('hidden');
        editorTextArea.readOnly = false;
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

    openTetris(onExit) {
        this.isExclusive = true;
        tetrisCanvas.classList.remove('hidden');
        
        const ctx = tetrisCanvas.getContext('2d');
        const COLS = 10;
        const ROWS = 20;
        const BLOCK_SIZE = 20;
        tetrisCanvas.width = COLS * BLOCK_SIZE;
        tetrisCanvas.height = ROWS * BLOCK_SIZE;

        let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let score = 0;

        const SHAPES = [
            [[1, 1, 1, 1]],
            [[1, 1], [1, 1]],
            [[0, 1, 0], [1, 1, 1]],
            [[1, 0, 0], [1, 1, 1]],
            [[0, 0, 1], [1, 1, 1]],
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1, 1], [1, 1, 0]]
        ];

        let piece = {
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            x: 3,
            y: 0
        };

        const draw = () => {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

            // Draw grid
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (grid[y][x]) {
                        ctx.fillStyle = "cyan";
                        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                    }
                }
            }

            // Draw piece
            ctx.fillStyle = "yellow";
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        ctx.fillRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                    }
                }
            }

            ctx.fillStyle = "white";
            ctx.font = "14px monospace";
            ctx.fillText(`Score: ${score}`, 5, 15);
        };

        const move = (dx, dy) => {
            piece.x += dx;
            piece.y += dy;
            if (collision()) {
                piece.x -= dx;
                piece.y -= dy;
                if (dy > 0) {
                    lock();
                    piece = {
                        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                        x: 3,
                        y: 0
                    };
                    if (collision()) {
                        clearInterval(game);
                        this.printOutput(`Game Over! Score: ${score}`);
                        this.closeTetris();
                        document.removeEventListener("keydown", handleKey);
                        onExit();
                    }
                }
                return false;
            }
            return true;
        };

        const rotate = () => {
            const oldShape = piece.shape;
            piece.shape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
            if (collision()) piece.shape = oldShape;
        };

        const collision = () => {
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        let nx = piece.x + x;
                        let ny = piece.y + y;
                        if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx])) return true;
                    }
                }
            }
            return false;
        };

        const lock = () => {
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        if (piece.y + y >= 0) grid[piece.y + y][piece.x + x] = 1;
                    }
                }
            }
            clearLines();
        };

        const clearLines = () => {
            for (let y = ROWS - 1; y >= 0; y--) {
                if (grid[y].every(cell => cell)) {
                    grid.splice(y, 1);
                    grid.unshift(Array(COLS).fill(0));
                    score += 100;
                    y++;
                }
            }
        };

        const handleKey = (e) => {
            if (e.keyCode === 37) move(-1, 0);      // Left
            else if (e.keyCode === 39) move(1, 0); // Right
            else if (e.keyCode === 40) move(0, 1); // Down
            else if (e.keyCode === 38) rotate();   // Up (Rotate)
            else if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
                clearInterval(game);
                this.closeTetris();
                document.removeEventListener("keydown", handleKey);
                onExit();
            }
            draw();
        };

        document.addEventListener("keydown", handleKey);
        let game = setInterval(() => {
            move(0, 1);
            draw();
        }, 500);
        draw();
    }

    closeTetris() {
        this.isExclusive = false;
        tetrisCanvas.classList.add('hidden');
        terminalInput.focus();
    }

    printBanner() {
        const banner = `
██████╗ ██████╗ ███╗   ██╗███████╗ ██████╗ ██╗   ██╗██╗     
██╔════╝██╔═══██╗████╗  ██║██╔════╝██╔═══██╗██║   ██║██║     
██║     ██║   ██║██╔██╗ ██║███████╗██║   ██║██║   ██║██║     
██║     ██║   ██║██║╚██╗██║╚════██║██║   ██║██║   ██║██║     
╚██████╗╚██████╔╝██║ ╚████║███████║╚██████╔╝╚██████╔╝███████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝
                                            
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
        
        // Syntax highlighting logic
        const tokens = input.trim().split(/\s+/);
        const commandName = tokens[0];
        if (commandName) {
            shell.suggest(commandName).then(suggestions => {
                const isValid = suggestions.includes(commandName);
                if (isValid) {
                    terminalInput.classList.remove('cmd-invalid');
                    terminalInput.classList.add('cmd-valid');
                } else {
                    terminalInput.classList.remove('cmd-valid');
                    terminalInput.classList.add('cmd-invalid');
                }
            });
        } else {
            terminalInput.classList.remove('cmd-valid', 'cmd-invalid');
        }

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
            terminalInput.classList.remove('cmd-valid', 'cmd-invalid');
            
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
        
        // Regex to detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const linkedOutput = output.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" title="Ctrl + left click to open in new tab" style="color: inherit;">${url}</a>`;
        });
        
        line.innerHTML = linkedOutput;
        
        // Add event listener for Ctrl+Click
        line.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (target && e.ctrlKey) {
                window.open(target.href, '_blank');
            }
        });
        
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
