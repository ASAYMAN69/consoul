import { vfs } from '../core/vfs.js';

export default async function wc(args, shell) {
    const showLines = args.includes('-l');
    const showWords = args.includes('-w');
    const showChars = args.includes('-c');
    const path = args.filter(a => !a.startsWith('-'))[0];

    const input = shell.pipeInput || '';
    let content = input;

    if (path) {
        const node = vfs.getNode(path, shell.cwd);
        if (!node) return `wc: ${path}: No such file or directory`;
        if (node.type === 'dir') return `wc: ${path}: Is a directory`;
        content = node.content || '';
    }

    if (!content && !shell.pipeInput && !path) return '0 0 0';

    const lines = content.split('\n').length;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = content.length;

    if (!showLines && !showWords && !showChars) {
        return `${lines} ${words} ${chars} ${path || ''}`;
    }

    let result = '';
    if (showLines) result += lines + ' ';
    if (showWords) result += words + ' ';
    if (showChars) result += chars + ' ';
    
    return result.trim() + (path ? ` ${path}` : '');
}
