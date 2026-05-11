export default async function env(args, shell) {
    return Object.entries(shell.env).map(([k, v]) => `${k}=${v}`).join('\n');
}
