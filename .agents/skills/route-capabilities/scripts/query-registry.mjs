import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const registryPath = resolve(here, '../../../capabilities/registry.json');
const rootPath = resolve(here, '../../../..');
const args = process.argv.slice(2);

function fail(message, details = []) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const stopwords = new Set([
  'a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'los', 'para', 'por',
  'que', 'un', 'una', 'y', 'the', 'to', 'for', 'of', 'and', 'in'
]);

function tokens(value) {
  return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter((token) =>
    token.length > 1 && !stopwords.has(token)
  ))];
}

function normalizedPhrase(value) {
  return tokens(value).join(' ');
}

function phraseIsPresent(text, phrase) {
  const normalizedText = ` ${normalizedPhrase(text)} `;
  const normalizedNeedle = normalizedPhrase(phrase);
  return normalizedNeedle.length > 0 && normalizedText.includes(` ${normalizedNeedle} `);
}

if (!existsSync(registryPath)) {
  fail('CAPABILITY_REGISTRY_NOT_FOUND', [registryPath]);
}

let registry;
try {
  registry = JSON.parse(readFileSync(registryPath, 'utf8'));
} catch (error) {
  fail('CAPABILITY_REGISTRY_INVALID_JSON', [error.message]);
}

const errors = [];
if (registry.schemaVersion !== 1) errors.push('schemaVersion debe ser 1');
if (!Array.isArray(registry.capabilities)) errors.push('capabilities debe ser un array');
if (!Array.isArray(registry.policy?.defaultAllowedStatuses)) {
  errors.push('policy.defaultAllowedStatuses debe ser un array');
}

const ids = new Set();
for (const [index, capability] of (registry.capabilities ?? []).entries()) {
  for (const field of ['id', 'name', 'kind', 'status', 'source', 'summary']) {
    if (!capability[field]) errors.push(`capabilities[${index}].${field} es obligatorio`);
  }
  if (!Array.isArray(capability.tags) || capability.tags.length === 0) {
    errors.push(`capabilities[${index}].tags debe tener al menos un valor`);
  }
  for (const optionalArray of ['triggers', 'excludes']) {
    if (capability[optionalArray] !== undefined && !Array.isArray(capability[optionalArray])) {
      errors.push(`capabilities[${index}].${optionalArray} debe ser un array`);
    }
  }
  if (ids.has(capability.id)) errors.push(`ID duplicado: ${capability.id}`);
  ids.add(capability.id);

  if (capability.id?.startsWith('internal:')) {
    const sourcePath = resolve(rootPath, capability.source);
    if (!existsSync(sourcePath)) errors.push(`Fuente interna inexistente: ${capability.source}`);
  }
}

if (errors.length > 0) fail('CAPABILITY_REGISTRY_VALIDATION_FAILED', errors);

if (args.includes('--validate')) {
  const countsByStatus = {};
  for (const capability of registry.capabilities) {
    countsByStatus[capability.status] = (countsByStatus[capability.status] ?? 0) + 1;
  }
  console.log(JSON.stringify({
    ok: true,
    schemaVersion: registry.schemaVersion,
    capabilities: registry.capabilities.length,
    countsByStatus
  }, null, 2));
  process.exit(0);
}

const query = valueAfter('--query');
if (!query) fail('USAGE', ['Usa --validate o --query "terminos"']);

const includeCandidates = args.includes('--include-candidates');
const allowed = new Set(registry.policy.defaultAllowedStatuses);
const queryTokens = tokens(query);

const matches = registry.capabilities
  .filter((capability) => includeCandidates || allowed.has(capability.status))
  .map((capability) => {
    const nameTokens = new Set(tokens(capability.name));
    const kindTokens = new Set(tokens(capability.kind));
    const summaryTokens = new Set(tokens(capability.summary));
    const tagTokens = new Set((capability.tags ?? []).flatMap(tokens));
    const triggerTokens = new Set((capability.triggers ?? []).flatMap(tokens));
    const excluded = (capability.excludes ?? []).some((phrase) => phraseIsPresent(query, phrase));
    let score = 0;
    const matched = [];

    if (excluded) return { capability, score: 0, matched, excluded: true };

    for (const token of queryTokens) {
      let tokenScore = 0;
      if (nameTokens.has(token)) tokenScore += 6;
      if (tagTokens.has(token)) tokenScore += 5;
      if (summaryTokens.has(token)) tokenScore += 2;
      if (kindTokens.has(token)) tokenScore += 1;
      if (triggerTokens.has(token)) tokenScore += 8;
      if (tokenScore > 0) matched.push(token);
      score += tokenScore;
    }

    for (const trigger of capability.triggers ?? []) {
      if (tokens(trigger).length > 1 && phraseIsPresent(query, trigger)) score += 12;
    }

    return { capability, score, matched };
  })
  .filter((entry) => entry.score > 0)
  .sort((a, b) => b.score - a.score || a.capability.name.localeCompare(b.capability.name))
  .slice(0, 8)
  .map(({ capability, score, matched }) => ({
    id: capability.id,
    name: capability.name,
    kind: capability.kind,
    status: capability.status,
    source: capability.source,
    score,
    matched
  }));

console.log(JSON.stringify({
  ok: true,
  query,
  allowedStatuses: includeCandidates ? 'ALL_FOR_REVIEW' : [...allowed],
  matches,
  next: matches.length > 0 ? 'REVIEW_MINIMUM_SET' : 'DISCOVERY_REVIEW_REQUIRED'
}, null, 2));
