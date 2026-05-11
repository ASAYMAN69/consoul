export default async function cd(args, shell) {
    const path = args[0] || shell.env['HOME'] || '/';
    
    if (shell.setCWD(path)) {
        return '';
    } else {
        return `cd: no such file or directory: ${path}`;
    }
}
