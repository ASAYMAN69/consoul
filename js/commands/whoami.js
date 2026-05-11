export default async function whoami(args, shell) {
    return shell.getEnv('USER');
}
