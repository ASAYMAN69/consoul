import { vfs } from '../core/vfs.js';

export default async function ls(args, shell) {
    const flags = args.filter(arg => arg.startsWith('-')).join('');
    const showAll = flags.includes('a');
    const longFormat = flags.includes('l');
    const pathArg = args.filter(arg => !arg.startsWith('-'))[0] || '.';
    
    // Resolve correctly for '.'
    const target = pathArg === '.' ? shell.cwd : pathArg;
    const node = vfs.getNode(target, shell.cwd);

    if (!node) {
        return `ls: cannot access '${pathArg}': No such file or directory`;
    }

    if (node.type === 'file') {
        return pathArg;
    }

    let children = Object.keys(node.children);
    if (!showAll) {
        children = children.filter(name => !name.startsWith('.'));
    }
    children.sort();

    function colorize(name, node, path) {
        let cls = 'ls-file';
        if (node.type === 'dir') cls = 'ls-dir';
        else if (path.startsWith('/bin') || (node.permissions && node.permissions.includes('x'))) cls = 'ls-bin';
        return `<span class="${cls}">${name}</span>`;
    }

    if (longFormat) {
        return children.map(name => {
            const child = node.children[name];
            const type = child.type === 'dir' ? 'd' : '-';
            const perms = child.permissions || (child.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--');
            const owner = child.owner || 'user';
            const size = child.content ? child.content.length : 0;
            const fullPath = vfs.resolvePath(name, vfs.resolvePath(pathArg, shell.cwd));
            const coloredName = colorize(name, child, fullPath);
            return `${type}${perms} ${owner} ${owner} ${size.toString().padStart(5)} May 11 ${coloredName}`;
        }).join('\n');
    }

    return children.map(name => {
        const child = node.children[name];
        const fullPath = vfs.resolvePath(name, vfs.resolvePath(pathArg, shell.cwd));
        return colorize(name, child, fullPath);
    }).join('  ');
}
