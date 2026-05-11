import { ui } from '../core/ui.js';

export default async function snake(args, shell) {
    return new Promise((resolve) => {
        ui.openSnake(() => {
            resolve('');
        });
    });
}
