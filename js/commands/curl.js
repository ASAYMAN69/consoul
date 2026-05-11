export default async function curl(args, shell) {
    if (args.length === 0) return 'curl: no URL specified!';

    const url = args[0];
    const { ui } = await import('../core/ui.js');
    ui.printOutput(`--- Consoul Network Simulation: Fetching ${url} ---`);
    ui.printOutput(`Seriously bruh? -_- ts made with pure HTML CSS and JS. why tf would you think that this command was gonna work huh?`);
    
    const simulatedEndpoints = {
        'google.com': '<html><title>Google</title><body>Search...</body></html>',
        'ayman.dev': '<html><title>Ayman is Goated</title><body>Welcome to my portfolio!</body></html>',
        'jerry.linux': 'Official Jerry Linux Repository'
    };

    // Try to find a simulated match
    for (const [key, content] of Object.entries(simulatedEndpoints)) {
        if (url.includes(key)) {
            return content;
        }
    }

    return `curl: (7) Failed to connect to ${url} port 80: Connection refused (Simulated)`;
}
