#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import ignore from "ignore";

const REMOTE_URL = "https://github.com/alguina/tests-gsi.git";
const BRANCH = "main";
const AUTHOR = {
  name: "Alex",
  email: "alex@users.noreply.github.com",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function ensureRepository() {
  const gitDir = path.join(ROOT, ".git");
  const hasGitDir = await pathExists(gitDir);
  const hasHead = await pathExists(path.join(gitDir, "HEAD"));

  if (!hasGitDir || !hasHead) {
    if (hasGitDir) {
      await fs.rm(gitDir, { recursive: true, force: true });
    }

    await git.init({ fs, dir: ROOT, defaultBranch: BRANCH });
    console.log("Initialized git repository.");
  }

  await git.setConfig({ fs, dir: ROOT, path: "user.name", value: AUTHOR.name });
  await git.setConfig({ fs, dir: ROOT, path: "user.email", value: AUTHOR.email });
}

async function readGitignore() {
  const ig = ignore();
  const gitignorePath = path.join(ROOT, ".gitignore");

  try {
    const contents = await fs.readFile(gitignorePath, "utf8");
    ig.add(contents);
  } catch {
    ig.add("node_modules");
  }

  ig.add(".git");
  return ig;
}

async function walkFiles(dir, ig, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT, fullPath).split(path.sep).join("/");

    if (!relativePath || ig.ignores(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await walkFiles(fullPath, ig, files);
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

async function ensureRemote() {
  const remotes = await git.listRemotes({ fs, dir: ROOT });
  const origin = remotes.find((remote) => remote.remote === "origin");

  if (!origin) {
    await git.addRemote({
      fs,
      dir: ROOT,
      remote: "origin",
      url: REMOTE_URL,
    });
    console.log(`Added remote origin -> ${REMOTE_URL}`);
    return;
  }

  if (origin.url !== REMOTE_URL) {
    await git.deleteRemote({ fs, dir: ROOT, remote: "origin" });
    await git.addRemote({
      fs,
      dir: ROOT,
      remote: "origin",
      url: REMOTE_URL,
    });
    console.log(`Updated remote origin -> ${REMOTE_URL}`);
    return;
  }

  console.log(`Remote origin already set -> ${REMOTE_URL}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldPush = args.has("--push");

  await ensureRepository();
  await ensureRemote();

  const ig = await readGitignore();
  const files = await walkFiles(ROOT, ig);

  for (const filepath of files) {
    await git.add({ fs, dir: ROOT, filepath });
  }

  const statusMatrix = await git.statusMatrix({ fs, dir: ROOT });
  const hasChanges = statusMatrix.some(([, head, workdir, stage]) => {
    return head !== workdir || head !== stage;
  });

  if (hasChanges) {
    const sha = await git.commit({
      fs,
      dir: ROOT,
      message: "Initial commit: GSI A2 study app with i18n and import flow.",
      author: AUTHOR,
    });
    console.log(`Created commit ${sha.slice(0, 7)}`);
  } else {
    console.log("No changes to commit.");
  }

  if (!shouldPush) {
    console.log("\nLocal repo is connected to GitHub.");
    console.log("Push with: npm run git:push");
    return;
  }

  try {
    await git.push({
      fs,
      http,
      dir: ROOT,
      remote: "origin",
      ref: BRANCH,
      force: false,
    });
    console.log(`Pushed ${BRANCH} to origin.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\nPush failed:", message);
    console.error(
      "\nAuthenticate with GitHub, then push from Terminal:\n" +
        "  npm run git:push\n" +
        "\nIf the remote README blocks the first push:\n" +
        "  git pull origin main --allow-unrelated-histories\n" +
        "  git push -u origin main",
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
