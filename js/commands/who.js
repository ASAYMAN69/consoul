export default async function who(args, shell) {
    const user = shell.getEnv('USER');
    const dateStr = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `${user.padEnd(10)} pts/0        ${dateStr} (:0)`;
}
