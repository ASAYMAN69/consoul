import { vfs } from '../core/vfs.js';

export default async function grep(args, shell) {
    const invert = args.includes('-v');
    const showLineNumbers = args.includes('-n');
    const ignoreCase = args.includes('-i');
    
    const pattern = args.filter(a => !a.startsWith('-'))[0];
    const path = args.filter(a => !a.startsWith('-'))[1];

    let content = shell.pipeInput || '';

    if (path) {
        const node = vfs.getNode(path, shell.cwd);
        if (node && node.type === 'file') {
            content = node.content || '';
        } else if (node && node.type === 'dir') {
            return `grep: ${path}: Is a directory`;
        } else {
            return `grep: ${path}: No such file or directory`;
        }
    }
    
    if (!pattern) return content;

    const lines = content.split('\n');
    const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    
    const matches = lines.map((line, index) => {
        const isMatch = regex.test(line);
        const shouldInclude = invert ? !isMatch : isMatch;
        
        if (shouldInclude) {
            return (showLineNumbers ? `${index + 1}:` : '') + line;
        }
        return null;
    }).filter(l => l !== null);
    
    return matches.join('\n');
}
