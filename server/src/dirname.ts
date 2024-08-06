import path from "path";
import { fileURLToPath } from "url";

export const getDirname = (url: string) => path.dirname(fileURLToPath(url));

console.log(getDirname(import.meta.url));
