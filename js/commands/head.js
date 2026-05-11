import { vfs } from '../core/vfs.js';

export default async function head(args, shell) {
    let linesToRead = 10;
    let path = args[0];

    if (args[0] === '-n' && args[1]) {
        linesToRead = parseInt(args[1]);
        path = args[2];
    }

    const input = shell.pipeInput || '';
    let content = input;

    if (path) {
        const node = vfs.getNode(path, shell.cwd);
        if (!node) return `head: cannot open '${path}' for reading: No such file or directory`;
        if (node.type === 'dir') return `head: error reading '${path}': Is a directory`;
        content = node.content || '';
    }

    if (!content && !shell.pipeInput) return '';

    return content.split('\n').slice(0, linesToRead).join('\n');
}
