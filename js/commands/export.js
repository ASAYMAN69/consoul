export default async function export_cmd(args, shell) {
    if (args.length === 0) {
        return Object.entries(shell.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
    }

    const [key, value] = args[0].split('=');
    if (key && value) {
        shell.setEnv(key, value);
        return '';
    }
    return 'export: usage: export KEY=VALUE';
}
