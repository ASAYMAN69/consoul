export default async function history(args, shell) {
    if (args.includes('-c')) {
        shell.history = [];
        localStorage.removeItem('consoul_history');
        return '';
    }
    return shell.history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
}
