export default async function fetch(args, shell) {
    const user = shell.getEnv('USER');
    const host = 'jerry';
    const uptime = await (await import('./uptime.js')).default([], shell);
    const date = new Date().toLocaleDateString();

    const logo = [
        "   ______     ",
        "  / ____/___  ",
        " / /   / __ \\ ",
        "/ /___/ /_/ / ",
        "\\____/\\____/  ",
        "              "
    ];

    const info = [
        `\x1b[32m${user}\x1b[0m@\x1b[32m${host}\x1b[0m`,
        "------------",
        `OS: Jerry Linux x86_64`,
        `Kernel: 5.15.0-generic`,
        `Uptime: ${uptime.replace('up ', '')}`,
        `Packages: 42 (npm)`,
        `Shell: consoul-sh 1.0`,
        `Resolution: ${window.innerWidth}x${window.innerHeight}`,
        `Terminal: Consoul-Web`,
        `CPU: Virtualized Browser Core`,
        `Memory: 2145MiB / 7954MiB`
    ];

    // Merge logo and info
    let output = '\n';
    const maxLines = Math.max(logo.length, info.length);
    for (let i = 0; i < maxLines; i++) {
        const logoLine = (logo[i] || "").padEnd(20);
        const infoLine = info[i] || "";
        output += `${logoLine}${infoLine}\n`;
    }

    return output;
}
