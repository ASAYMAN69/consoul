import { ui } from '../core/ui.js';

export default async function tetris(args, shell) {
    return new Promise((resolve) => {
        ui.openTetris(() => {
            resolve('');
        });
    });
}
