import dotenv from 'dotenv';
import { Command } from 'commander';

const program = new Command();
program.option('-m, --mode <mode>', 'Modo de ejecución', 'dev');
program.parse();


dotenv.config({
    path:program.opts().mode==="dev"?'./.env.dev':'./.env.prod'
});

export default {
  app: {
    PORT: process.env.PORT || 8080,
  },
  mongo: {
    URL: process.env.MONGO_URL || "localhost:27017",
  },
  admin: {
    USER: process.env.ADMIN_EMAIL,
    PASS: process.env.ADMIN_PWD,
  },
  mailer: {
    USER: process.env.MAILER_USER,
    PASS: process.env.MAILER_PASSWORD,
  },
};