export default async function sh(args, shell) {
    if (args.length === 0) return 'sh: missing filename';

    const filename = args[0];
    const { vfs } = await import('../core/vfs.js');
    const node = vfs.getNode(filename, shell.cwd);

    if (!node) return `sh: ${filename}: No such file or directory`;
    if (node.type === 'dir') return `sh: ${filename}: Is a directory`;

    const script = node.content || '';
    const lines = script.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

    let lastOutput = '';
    for (const line of lines) {
        lastOutput = await shell.execute(line);
        // We don't automatically print every line's output to keep it clean,
        // but the shell.execute will handle its own UI updates if we called it via the UI.
        // However, shell.execute in core doesn't print to UI directly.
        // So for scripts, we might want to print the output of each command if it exists.
        if (lastOutput) {
            const { ui } = await import('../core/ui.js');
            ui.printOutput(lastOutput);
        }
    }

    return '';
}
