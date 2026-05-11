import { vfs } from '../core/vfs.js';

export default async function cp(args, shell) {
    if (args.length < 2) return 'cp: missing destination file operand';
    
    const src = args[0];
    const dest = args[1];

    const srcNode = vfs.getNode(src, shell.cwd);
    if (!srcNode) return `cp: cannot stat '${src}': No such file or directory`;
    if (srcNode.type === 'dir' && !args.includes('-r')) return `cp: -r not specified; omitting directory '${src}'`;

    const destNode = vfs.getNode(dest, shell.cwd);
    let finalDest = dest;
    if (destNode && destNode.type === 'dir') {
        finalDest = (dest.endsWith('/') ? dest : dest + '/') + src.split('/').pop();
    }

    if (vfs.createNode(finalDest, srcNode.type, srcNode.content, shell.cwd)) {
        if (srcNode.type === 'dir') {
            const newNode = vfs.getNode(finalDest, shell.cwd);
            newNode.children = JSON.parse(JSON.stringify(srcNode.children));
            vfs.save();
        }
        return '';
    }
    return `cp: failed to copy '${src}' to '${finalDest}'`;
}
