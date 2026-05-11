# Consoul Terminal

Consoul is a robust, modular, and persistent browser-based terminal emulator that mimics a real Unix-like environment. It features a tree-based Virtual File System (VFS), a powerful shell with command piping, and immersive retro aesthetics.

## Features

- **Modular Architecture**: Commands are lazy-loaded as ES modules.
- **Persistent VFS**: Files and directories are stored in `localStorage`.
- **Intelligent Shell**:
    - **Tab Completion**: Intelligent command/path completion.
    - **ZSH-style Autosuggestions**: Inline ghost-text history suggestions.
    - **Piping & Redirection**: Support for `|`, `>`, and `>>`.
    - **Scripting Engine**: Run `.sh` files with `sh`.
- **Advanced Editors**: Includes both `nano` and `vim` interactive modes.
- **Unix Utilities**: 30+ built-in commands (`ls`, `grep`, `fetch`, `ps`, `wc`, etc.).
- **Themes**: Switch between `matrix`, `ubuntu`, `retro`, `classic`, `nord`, and `monokai`.
- **Immersive UI**: CRT scanlines, screen flicker, live system monitor, and interactive link handling.

## Authentication

Consoul includes a `sudo` command for privileged operations.

- **Password**: `aymanisgoated`

## Usage

1. Open `index.html` in any modern web browser.
2. Type `help` to see a full list of available commands.
3. Use `theme [name]` to switch between the supported color palettes.
4. Try `nano filename.txt` or `vim filename.txt` for full-screen editing.

## Technical Details

- **Language**: Vanilla JavaScript (ES Modules), HTML5, CSS3.
- **Persistence**: `localStorage` (VFS, history, theme, aliases).
- **Environment**: Default home directory is `/home/ayman`. Machine name is `jerry`.

---
*Built with love for terminal enthusiasts.*
