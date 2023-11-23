import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function upViews(sequelize: Sequelize): Promise<void> {
  const sqlDir = path.resolve(__dirname, '../../sql');
  const files = await fs.readdir(sqlDir);

  for (const file of files) {
    if (path.extname(file) === '.sql') {
      const filePath = path.join(sqlDir, file);
      const query = await fs.readFile(filePath, 'utf8');
      await sequelize.query(query);
    }
  }
}

export async function dropViews(sequelize: Sequelize): Promise<void> {
  const sqlDir = path.resolve(__dirname, '../../sql');
  const files = await fs.readdir(sqlDir);

  for (const file of files) {
    if (path.extname(file) === '.sql') {
      const viewName = path.basename(file, '.sql');
      const query = `DROP VIEW IF EXISTS ${viewName} CASCADE;`;
      await sequelize.query(query);
    }
  }
}
