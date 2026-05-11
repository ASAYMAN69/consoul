import { ui } from '../core/ui.js';

export default async function matrix(args, shell) {
    return new Promise((resolve) => {
        ui.openMatrix(() => {
            resolve('');
        });
    });
}
