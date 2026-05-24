import { vfs } from '../core/vfs.js';

export default async function cat(args, shell) {
    if (args.length === 0) return shell.pipeInput || '';
    
    const path = args[0];
    const node = vfs.getNode(path, shell.cwd);
    
    if (!node) return `cat: ${path}: No such file or directory`;
    if (node.type === 'dir') return `cat: ${path}: Is a directory`;
    
    return node.content || '';
}
