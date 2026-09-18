import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('renovate.json', 'utf8'));

assert.equal(
  config.$schema,
  'https://docs.renovatebot.com/renovate-schema.json',
  'Renovate config must keep the official schema reference',
);

assert.ok(
  Array.isArray(config.extends) && config.extends.includes('config:recommended'),
  'Renovate must extend config:recommended',
);

const managers = new Set(config.enabledManagers ?? []);
assert.deepEqual(
  managers,
  new Set(['npm', 'github-actions']),
  'Renovate must cover exactly npm and GitHub Actions for this repository',
);

assert.equal(config.dependencyDashboard, true, 'Dependency Dashboard must remain enabled');
assert.equal(config.timezone, 'Europe/Madrid', 'Renovate timezone must match the repository operating timezone');
assert.equal(config.minimumReleaseAge, '3 days', 'Fresh releases should age before routine update PRs');
assert.ok(Number.isInteger(config.prHourlyLimit) && config.prHourlyLimit > 0 && config.prHourlyLimit <= 2);
assert.ok(Number.isInteger(config.prConcurrentLimit) && config.prConcurrentLimit > 0 && config.prConcurrentLimit <= 5);

assert.equal(
  config.automerge,
  false,
  'Automerge must stay disabled until main has enforced required status checks',
);
assert.equal(
  config.platformAutomerge,
  false,
  'GitHub platform automerge must stay disabled while main is unprotected',
);

const rules = config.packageRules ?? [];
const findRule = (manager, updateType) =>
  rules.find(
    (rule) =>
      (rule.matchManagers ?? []).includes(manager)
      && (rule.matchUpdateTypes ?? []).includes(updateType),
  );

for (const manager of ['npm', 'github-actions']) {
  for (const updateType of ['patch', 'minor']) {
    const rule = findRule(manager, updateType);
    assert.ok(rule, `Missing ${manager} ${updateType} grouping rule`);
    assert.ok(
      typeof rule.groupName === 'string' && rule.groupName.length > 0,
      `${manager} ${updateType} updates must have a reviewable group`,
    );
  }
}

const majorRule = rules.find((rule) => (rule.matchUpdateTypes ?? []).includes('major'));
assert.ok(majorRule, 'Missing explicit major-update policy');
assert.equal(majorRule.automerge, false, 'Major updates must never auto-merge');
assert.ok((majorRule.addLabels ?? []).includes('major-update'), 'Major updates should be visibly labeled');

for (const rule of rules) {
  assert.notEqual(
    rule.automerge,
    true,
    `Package rule "${rule.description?.[0] ?? 'unnamed'}" must not enable automerge while main is unprotected`,
  );
}

console.log('Renovate policy validation passed: npm + GitHub Actions enabled, conservative grouping, automerge disabled.');
