import { vfs } from '../core/vfs.js';

export default async function write(args, shell) {
    if (args.length < 2) return 'write: usage: write [file] [content]';
    
    const path = args[0];
    const content = args.slice(1).join(' ');
    
    const existing = vfs.getNode(path, shell.cwd);
    if (!existing) {
        vfs.createNode(path, 'file', content, shell.cwd);
    } else {
        vfs.updateFile(path, content, false, shell.cwd);
    }
    return '';
}
