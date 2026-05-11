export default async function uptime(args, shell) {
    const start = window.performance.timing.navigationStart;
    const now = Date.now();
    const up = Math.floor((now - start) / 1000);
    const hrs = Math.floor(up / 3600);
    const mins = Math.floor((up % 3600) / 60);
    const secs = up % 60;
    return `up ${hrs} hours, ${mins} minutes, ${secs} seconds, 1 user, load average: 0.00, 0.00, 0.00`;
}
