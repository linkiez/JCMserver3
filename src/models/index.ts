import fs from 'fs';
import path from 'path';

export function models(): void {
  const currentDir = path.dirname(import.meta.url);
  const currentDir2 = currentDir.replace(/^file:\/\/\//, "");
  fs.readdirSync(currentDir2)
    .filter(file => file !== 'index.js' && !file.includes('.map'))
    .forEach(async(file) => {
      const model: any = await import(path.join(currentDir, file));
      if (typeof model.default.associate === 'function') {
        model.default.associate();
      }else{
        console.log('no associate', model);
      }
    });
}
