import { vfs } from '../core/vfs.js';
import { ui } from '../core/ui.js';

export default async function vim(args, shell) {
    if (args.length === 0) return 'vim: missing filename';

    const filename = args[0];
    const node = vfs.getNode(filename, shell.cwd);
    
    if (node && node.type === 'dir') {
        return `vim: ${filename}: Is a directory`;
    }

    const initialContent = node ? (node.content || '') : '';

    return new Promise((resolve) => {
        ui.openVim(
            filename,
            initialContent,
            (newContent) => {
                // On Save
                if (!node) {
                    vfs.createNode(filename, 'file', newContent, shell.cwd);
                } else {
                    vfs.updateFile(filename, newContent, false, shell.cwd);
                }
            },
            () => {
                // On Exit
                resolve('');
            }
        );
    });
}
