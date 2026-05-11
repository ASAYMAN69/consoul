export default async function ping(args, shell) {
    if (args.length === 0) return 'usage: ping host';

    const host = args[0];
    const { ui } = await import('../core/ui.js');
    
    ui.printOutput(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);

    return new Promise((resolve) => {
        let count = 0;
        const maxCount = 4;
        
        const interval = setInterval(() => {
            const time = (Math.random() * 50 + 10).toFixed(2);
            ui.printOutput(`64 bytes from ${host} (127.0.0.1): icmp_seq=${count + 1} ttl=64 time=${time} ms`);
            count++;

            if (count >= maxCount) {
                clearInterval(interval);
                ui.printOutput(`\n--- ${host} ping statistics ---`);
                ui.printOutput(`${maxCount} packets transmitted, ${maxCount} received, 0% packet loss, time ${((maxCount * 1000) + Math.random() * 100).toFixed(0)}ms`);
                resolve('');
            }
        }, 1000);
    });
}
