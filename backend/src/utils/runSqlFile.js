import fs from 'fs';
import path from 'path';
import db from '../config/db.js'

export async function runSqlFile(filename) {
    const filePath = path.resolve('src/utils', filename);
    const sql = fs.readFileSync(filePath, "utf8");
    await db.query(sql);
}