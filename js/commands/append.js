import { vfs } from '../core/vfs.js';

export default async function append(args, shell) {
    if (args.length < 1) return 'append: usage: append [file] [content]';
    
    const path = args[0];
    const content = args.length > 1 ? args.slice(1).join(' ') : (shell.pipeInput || '');
    
    const existing = vfs.getNode(path, shell.cwd);
    if (!existing) {
        vfs.createNode(path, 'file', content, shell.cwd);
    } else {
        vfs.updateFile(path, content, true, shell.cwd);
    }
    return '';
}
