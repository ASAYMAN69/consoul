export default async function alias(args, shell) {
    if (args.length === 0) {
        return Object.entries(shell.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
    }

    const match = args.join(' ').match(/^([^=]+)=['"]?([^'"]+)['"]?$/);
    if (match) {
        const [, name, command] = match;
        shell.aliases[name.trim()] = command.trim();
        return '';
    }
    return 'alias: usage: alias name=command';
}
