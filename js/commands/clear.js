export default async function clear(args, shell) {
    const outputLog = document.getElementById('output-log');
    if (outputLog) {
        outputLog.innerHTML = '';
    }
    return '';
}
