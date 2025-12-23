import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

const root = process.cwd();
const envPath = path.join(root, '.env');

const result = {
  hasWarn: false,
  hasFail: false,
};

const logOk = (message) => console.log(`OK   ${message}`);
const logWarn = (message) => {
  result.hasWarn = true;
  console.warn(`WARN ${message}`);
};
const logFail = (message) => {
  result.hasFail = true;
  console.error(`FAIL ${message}`);
};

const checkNode = () => {
  const major = Number(process.versions.node.split('.')[0]);
  if (Number.isNaN(major)) {
    logWarn(`Unable to parse Node version (${process.versions.node}).`);
    return;
  }
  if (major < 18) {
    logFail(`Node ${process.versions.node} detected. Require >= 18.`);
  } else {
    logOk(`Node ${process.versions.node}.`);
  }
};

const checkEnv = () => {
  if (!existsSync(envPath)) {
    logFail('Missing .env (expected DATABASE_URL).');
    return;
  }
  dotenv.config({ path: envPath });
  if (!process.env.DATABASE_URL) {
    logFail('DATABASE_URL missing in .env.');
    return;
  }
  logOk('DATABASE_URL present.');
};

const checkDatabase = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logWarn('Skip DB check (DATABASE_URL not set).');
    return;
  }
  if (!databaseUrl.startsWith('file:')) {
    logOk(`DATABASE_URL uses non-file provider (${databaseUrl}).`);
    return;
  }
  const relativePath = databaseUrl.replace('file:', '');
  const schemaDir = path.join(root, 'prisma');
  const dbPathFromRoot = path.resolve(root, relativePath);
  const dbPathFromSchema = path.resolve(schemaDir, relativePath);
  const candidates = Array.from(new Set([dbPathFromRoot, dbPathFromSchema]));

  const existing = candidates.filter((candidate) => existsSync(candidate));
  if (existing.length === 0) {
    logFail(
      `SQLite file missing. Checked: ${candidates.join(', ')}. Run: npm run db:push`
    );
    return;
  }

  const sizes = existing.map((candidate) => ({
    path: candidate,
    size: statSync(candidate).size,
  }));
  const nonEmpty = sizes.find((entry) => entry.size > 0);
  if (!nonEmpty) {
    logWarn(
      `SQLite file exists but is empty (${sizes.map((e) => e.path).join(', ')}). Run: npm run db:push`
    );
    return;
  }
  logOk(`SQLite file ready (${nonEmpty.path}).`);
  if (sizes.length > 1 && sizes.some((entry) => entry.size === 0)) {
    logWarn(
      `Multiple SQLite files detected. Consider aligning DATABASE_URL. Found: ${sizes
        .map((entry) => `${entry.path} (${entry.size} bytes)`)
        .join(', ')}`
    );
  }
};

const listPdfFiles = (dir) => {
  try {
    return readdirSync(dir).filter((file) => file.toLowerCase().endsWith('.pdf'));
  } catch (error) {
    return [];
  }
};

const checkTemplates = () => {
  const appTemplates = path.join(root, 'public', 'plantillas');
  if (!existsSync(appTemplates)) {
    logWarn(`Missing templates folder: ${appTemplates}`);
    return;
  }

  const appPdfs = listPdfFiles(appTemplates);
  if (appPdfs.length === 0) {
    logWarn(`No PDFs in ${appTemplates}`);
  } else {
    logOk(`PDF templates found: ${appPdfs.length} in public/plantillas.`);
  }

  const externalTemplates = path.resolve(root, '..', 'plantillas');
  if (existsSync(externalTemplates)) {
    const externalPdfs = listPdfFiles(externalTemplates);
    if (externalPdfs.length > 0 && appPdfs.length === 0) {
      logWarn(
        `Found ${externalPdfs.length} PDFs in ${externalTemplates} but none in public/plantillas.`
      );
    }
  }
};

const checkNodeModules = () => {
  const nodeModules = path.join(root, 'node_modules');
  if (!existsSync(nodeModules)) {
    logFail('node_modules not found. Run: npm install');
  } else {
    logOk('node_modules present.');
  }
};

const run = () => {
  console.log('NeuroDoc Doctor');
  console.log('--------------');
  checkNode();
  checkNodeModules();
  checkEnv();
  checkDatabase();
  checkTemplates();

  if (result.hasFail) {
    process.exitCode = 1;
  } else if (result.hasWarn) {
    process.exitCode = 2;
  } else {
    process.exitCode = 0;
  }
};

run();
