export default async function reset(args, shell) {
    localStorage.removeItem('consoul_vfs');
    localStorage.removeItem('consoul_history');
    location.reload();
    return 'Resetting terminal...';
}
