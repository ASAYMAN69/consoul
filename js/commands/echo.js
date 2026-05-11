export default async function echo(args, shell) {
    // Basic echo. Redirection (>) will be handled by the shell later.
    return args.join(' ');
}
