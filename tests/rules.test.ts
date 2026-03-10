import * as path from 'path';
import { describe, expect, test } from '@jest/globals';
import { PrivacyScanner } from '../src/scanner/engine';
import { BUILTIN_RULES, loadExternalRulesFromJson } from '../src/scanner/detectors';
import { DetectionRule } from '../src/types/findings';

const externalRulesPath = path.resolve(process.cwd(), 'data/regex_list_1.json');
const externalRules = loadExternalRulesFromJson(externalRulesPath, { codingOnly: true });
const allRules: DetectionRule[] = [...BUILTIN_RULES, ...externalRules];

describe('rule coverage', () => {
  test('loads built-in and external coding rules', () => {
    expect(BUILTIN_RULES.length).toBeGreaterThan(0);
    expect(externalRules.length).toBeGreaterThan(0);
    expect(allRules.length).toBeGreaterThan(BUILTIN_RULES.length);
  });

  test.each(allRules)('rule metadata is valid: $id', (rule: DetectionRule) => {
    expect(rule.id).toBeTruthy();
    expect(rule.title).toBeTruthy();
    expect(rule.description).toBeTruthy();
    expect(rule.enabled).toBe(true);
    expect(rule.redactionStrategy).toBeTruthy();
  });

  test.each(allRules)('regex compiles: $id', (rule: DetectionRule) => {
    const compiled = typeof rule.pattern === 'string'
      ? new RegExp(rule.pattern, 'g')
      : new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);

    expect(compiled).toBeInstanceOf(RegExp);
  });

  test.each(allRules)('scanner can execute rule safely: $id', (rule: DetectionRule) => {
    const scanner = new PrivacyScanner([rule]);
    const input = [
      'const apiKey = "test";',
      'Authorization: Bearer abc123',
      '-----BEGIN PRIVATE KEY-----',
      'MIIEvQIBADANBgkqhki...',
      '-----END PRIVATE KEY-----',
    ].join('\n');

    expect(() => scanner.scan(input)).not.toThrow();
  });

  const rulesWithActionableExamples = allRules.filter((rule) => {
    if (!rule.examples || rule.examples.length === 0) return false;
    const firstExample = rule.examples[0];
    if (!firstExample || firstExample.trim().length === 0) return false;
    // External CSV-imported rules currently use title placeholders as examples.
    return firstExample !== rule.title;
  });

  test.each(rulesWithActionableExamples)('example triggers detection: $id', (rule: DetectionRule) => {
    const scanner = new PrivacyScanner([rule]);
    const sample = rule.examples[0];
    const result = scanner.scan(sample);
    const found = result.findings.some((finding) => finding.ruleId === rule.id);
    expect(found).toBe(true);
  });
});
