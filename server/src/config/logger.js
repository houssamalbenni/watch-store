import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });

const logger = {
  info: (msg) => {
    const line = `[INFO]  ${new Date().toISOString()} - ${msg}`;
    console.log(line);
    logStream.write(line + '\n');
  },
  warn: (msg) => {
    const line = `[WARN]  ${new Date().toISOString()} - ${msg}`;
    console.warn(line);
    logStream.write(line + '\n');
  },
  error: (msg) => {
    const line = `[ERROR] ${new Date().toISOString()} - ${msg}`;
    console.error(line);
    logStream.write(line + '\n');
  },
};

export default logger;
