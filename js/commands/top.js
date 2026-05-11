export default async function top(args, shell) {
    const uptime = await (await import('./uptime.js')).default([], shell);
    const tasks = 'Tasks: 125 total,   1 running, 124 sleeping,   0 stopped,   0 zombie';
    const cpu = '%Cpu(s):  2.3 us,  1.1 sy,  0.0 ni, 96.6 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st';
    const mem = 'MiB Mem :   7954.1 total,   3412.5 free,   2145.2 used,   2396.4 buff/cache';
    
    const processes = [
        '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        '    1 root      20   0  168344  11820   8340 S   0.0   0.1   0:01.45 systemd',
        '  890 user      20   0   18452   5124   3412 S   0.0   0.1   0:00.05 bash',
        ' 1250 user      20   0   21456   4120   3145 R   1.5   0.1   0:00.01 top'
    ];

    return `${uptime}\n${tasks}\n${cpu}\n${mem}\n\n${processes.join('\n')}`;
}
