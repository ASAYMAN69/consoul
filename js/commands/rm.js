import { vfs } from '../core/vfs.js';

export default async function rm(args, shell) {
    if (args.length === 0) return 'rm: missing operand';
    
    const recursive = args.includes('-r') || args.includes('-rf');
    const path = args.filter(a => !a.startsWith('-'))[0];

    if (!path) return 'rm: missing operand';

    const node = vfs.getNode(path, shell.cwd);
    if (!node) return `rm: cannot remove '${path}': No such file or directory`;

    if (node.type === 'dir' && !recursive) {
        return `rm: cannot remove '${path}': Is a directory`;
    }

    if (vfs.removeNode(path, shell.cwd)) {
        return '';
    } else {
        return `rm: failed to remove '${path}'`;
    }
}
