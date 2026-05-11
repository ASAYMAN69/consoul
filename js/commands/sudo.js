export default async function sudo(args, shell) {
    if (args.length === 0) return 'usage: sudo command [args]';

    shell.authMode = true;
    shell.pendingSudoCommand = args.join(' ');
    
    // We don't return an output yet, the UI will change the prompt via updatePrompt
    return '';
}
