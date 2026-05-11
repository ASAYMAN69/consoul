export default async function uname(args, shell) {
    if (args.includes('-a')) return 'Jerry Linux 5.15.0-generic #1-Web Browsers x86_64 GNU/Linux';
    return 'Jerry';
}
