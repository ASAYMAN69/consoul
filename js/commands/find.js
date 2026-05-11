import { vfs } from '../core/vfs.js';

export default async function find(args, shell) {
    const startPath = args[0] || '.';
    const results = [];

    function search(path, name) {
        const node = vfs.getNode(path, shell.cwd);
        if (!node) return;

        results.push(path);

        if (node.type === 'dir') {
            for (const childName of Object.keys(node.children)) {
                const childPath = (path === '/' ? '' : path) + '/' + childName;
                search(childPath, childName);
            }
        }
    }

    const resolvedStart = vfs.resolvePath(startPath, shell.cwd);
    search(resolvedStart, startPath);
    
    return results.join('\n');
}
