import { Express } from "express";
import path from "path";
import fs from "fs";

export async function routes(app: Express) {
  const currentDir = path.dirname(import.meta.url);
  const currentDir2 = currentDir.replace(/^file:\/\/\//, "");
  fs.readdirSync(currentDir2)
    .filter(
      (file) =>
        file !== "index.js" && !file.includes(".map") && file.includes("Routes")
    )
    .forEach(async (file) => {
      const model: any = await import(path.join(currentDir, file));

      app.use(model.default);
    });
}
