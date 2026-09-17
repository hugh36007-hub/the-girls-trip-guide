import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const commit = process.env.GITHUB_SHA;
assert.match(commit || '', /^[a-f0-9]{40}$/, 'An exact source commit is required');
const config = JSON.parse(await readFile('capacitor.config.json', 'utf8'));
const gradle = await readFile('android/app/build.gradle', 'utf8');
const versionCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
const versionName = gradle.match(/versionName\s+"([^"]+)"/)?.[1];
assert(Number.isInteger(versionCode) && versionCode > 1);
assert(versionName);
const aab = await readFile('android/app/build/outputs/bundle/release/app-release.aab');
const lock = await readFile('package-lock.json');
const sha256 = b => createHash('sha256').update(b).digest('hex');
const report = {
  repository: process.env.GITHUB_REPOSITORY,
  commit,
  workflowRun: process.env.GITHUB_RUN_ID,
  workflowAttempt: process.env.GITHUB_RUN_ATTEMPT,
  applicationId: config.appId,
  versionCode,
  versionName,
  aabSha256: sha256(aab),
  lockfileSha256: sha256(lock),
  physicalDeviceAcceptance: 'PENDING'
};
await writeFile('release-provenance.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

