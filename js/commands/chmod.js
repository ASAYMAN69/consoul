import { vfs } from '../core/vfs.js';

export default async function chmod(args, shell) {
    if (args.length < 2) return 'chmod: usage: chmod MODE FILE';

    const mode = args[0];
    const path = args[1];

    let perms = mode;
    // Simple numeric mapping
    const mapping = {
        '777': 'rwxrwxrwx',
        '755': 'rwxr-xr-x',
        '644': 'rw-r--r--',
        '600': 'rw-------',
        '700': 'rwx------'
    };

    if (mapping[mode]) perms = mapping[mode];

    if (vfs.setPermissions(path, perms, shell.cwd)) {
        return '';
    } else {
        return `chmod: cannot access '${path}': No such file or directory`;
    }
}
