export const randInt = (max = 2 ** 32) => (Math.random() * max) | 0;
export const randId = () => Math.random().toString(36).slice(2, 12);
export const randItem = <T,>(items: T[]) => items[randInt(items.length)];
