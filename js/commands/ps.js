export default async function ps(args, shell) {
    const processes = [
        { pid: 1, tty: '?', time: '00:00:01', cmd: 'systemd' },
        { pid: 2, tty: '?', time: '00:00:00', cmd: 'kthreadd' },
        { pid: 452, tty: '?', time: '00:00:05', cmd: 'dbus-daemon' },
        { pid: 890, tty: 'pts/0', time: '00:00:00', cmd: 'bash' },
        { pid: 1024, tty: 'pts/0', time: '00:00:00', cmd: 'ps' }
    ];

    let output = '  PID TTY          TIME CMD\n';
    output += processes.map(p => {
        return `${p.pid.toString().padStart(5)} ${p.tty.padEnd(12)} ${p.time} ${p.cmd}`;
    }).join('\n');

    return output;
}
