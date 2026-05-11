import { vfs } from '../core/vfs.js';

export default async function mkdir(args, shell) {
    if (args.length === 0) return 'mkdir: missing operand';
    
    const path = args[0];
    if (vfs.createNode(path, 'dir', '', shell.cwd)) {
        return '';
    } else {
        return `mkdir: cannot create directory '${path}': File exists or parent directory does not exist`;
    }
}
