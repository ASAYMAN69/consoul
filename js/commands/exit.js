export default async function exit(args, shell) {
    window.close();
    return 'Session terminated. You can close this tab.';
}
