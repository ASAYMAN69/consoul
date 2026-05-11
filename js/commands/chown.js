import { vfs } from '../core/vfs.js';

export default async function chown(args, shell) {
    if (args.length < 2) return 'chown: usage: chown OWNER FILE';

    const owner = args[0];
    const path = args[1];

    if (vfs.setOwner(path, owner, shell.cwd)) {
        return '';
    } else {
        return `chown: cannot access '${path}': No such file or directory`;
    }
}
