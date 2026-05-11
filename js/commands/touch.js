import { vfs } from '../core/vfs.js';

export default async function touch(args, shell) {
    if (args.length === 0) return 'touch: missing operand';
    
    const path = args[0];
    const existing = vfs.getNode(path, shell.cwd);
    
    if (existing) {
        // In a real system, this would update the timestamp.
        return '';
    }

    if (vfs.createNode(path, 'file', '', shell.cwd)) {
        return '';
    } else {
        return `touch: cannot touch '${path}': Parent directory does not exist`;
    }
}
