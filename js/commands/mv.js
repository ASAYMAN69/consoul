import { vfs } from '../core/vfs.js';

export default async function mv(args, shell) {
    if (args.length < 2) return 'mv: missing destination file operand after destination';
    
    const src = args[0];
    const dest = args[1];

    const srcNode = vfs.getNode(src, shell.cwd);
    if (!srcNode) return `mv: cannot stat '${src}': No such file or directory`;

    // Simple move: create new, delete old
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
        vfs.removeNode(src, shell.cwd);
        return '';
    }
    return `mv: failed to move '${src}' to '${finalDest}'`;
}
