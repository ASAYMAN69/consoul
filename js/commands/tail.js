import { vfs } from '../core/vfs.js';

export default async function tail(args, shell) {
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
        if (!node) return `tail: cannot open '${path}' for reading: No such file or directory`;
        if (node.type === 'dir') return `tail: error reading '${path}': Is a directory`;
        content = node.content || '';
    }

    if (!content && !shell.pipeInput) return '';

    const lines = content.split('\n');
    return lines.slice(Math.max(0, lines.length - linesToRead)).join('\n');
}
