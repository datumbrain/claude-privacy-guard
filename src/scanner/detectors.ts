/**
 * Pattern detectors for sensitive data
 */

import { DetectionRule } from '../types/findings.js';
import * as fs from 'fs';

interface ExternalRegexEntry {
  name: string;
  description: string;
  regex: string;
  risk: number;
  category: string;
}

interface ExternalRuleOptions {
  codingOnly?: boolean;
}

/**
 * Built-in detection rules
 * Start with high-value patterns that catch the most dangerous leaks
 */
export const BUILTIN_RULES: DetectionRule[] = [
  {
    id: 'email-address',
    title: 'Email Address',
    description: 'Detects email addresses that could be PII',
    severity: 'medium',
    category: 'pii',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    examples: ['user@example.com', 'john.doe@company.co.uk'],
    redactionStrategy: 'semantic',
    enabled: true,
  },
  {
    id: 'jwt-token',
    title: 'JWT Token',
    description: 'Detects JSON Web Tokens that contain authentication data',
    severity: 'high',
    category: 'auth-token',
    pattern: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'],
    redactionStrategy: 'token-replace',
    enabled: true,
  },
  {
    id: 'bearer-token',
    title: 'Bearer Token',
    description: 'Detects Bearer authentication tokens',
    severity: 'high',
    category: 'auth-token',
    pattern: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
    examples: ['Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'],
    redactionStrategy: 'token-replace',
    enabled: true,
  },
  {
    id: 'aws-api-key',
    title: 'AWS API Key',
    description: 'Detects AWS access key IDs',
    severity: 'critical',
    category: 'secret',
    pattern: /\b(AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
    examples: ['AKIAIOSFODNN7EXAMPLE'],
    redactionStrategy: 'token-replace',
    enabled: true,
  },
  {
    id: 'openai-api-key',
    title: 'OpenAI API Key',
    description: 'Detects OpenAI API keys',
    severity: 'critical',
    category: 'secret',
    pattern: /sk-(?:proj-)?[A-Za-z0-9]{8,}/g,
    examples: ['sk-proj-1234567890abcdefghij', 'sk-1234567890abcdefghij'],
    redactionStrategy: 'token-replace',
    enabled: true,
  },
  {
    id: 'stripe-api-key',
    title: 'Stripe API Key',
    description: 'Detects Stripe secret keys',
    severity: 'critical',
    category: 'secret',
    pattern: /\bsk_(live|test)_[0-9a-zA-Z]{24,}\b/g,
    examples: ['sk_live_51AbCdEfGhIjKlMnOpQrStUv'],
    redactionStrategy: 'token-replace',
    enabled: true,
  },
  {
    id: 'private-key',
    title: 'Private Key',
    description: 'Detects SSH and PEM private keys',
    severity: 'critical',
    category: 'secret',
    pattern: /-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----[\s\S]*?-----END (RSA |OPENSSH |EC )?PRIVATE KEY-----/g,
    examples: ['-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----'],
    redactionStrategy: 'token-replace',
    enabled: true,
  },
];

const CODING_SECRET_KEYWORDS = [
  'api key',
  'apikey',
  'access key',
  'token',
  'secret',
  'password',
  'passwd',
  'private key',
  'credential',
  'bearer',
  'jwt',
  'oauth',
  'auth',
  'ssh',
  'pgp',
];

function riskToSeverity(risk: number): DetectionRule['severity'] {
  if (risk >= 8) return 'critical';
  if (risk >= 6) return 'high';
  if (risk >= 3) return 'medium';
  return 'low';
}

function sourceCategoryToRuleCategory(sourceCategory: string): DetectionRule['category'] {
  if (sourceCategory.toLowerCase() === 'pii') {
    return 'pii';
  }

  return 'secret';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isCodingSecretPattern(entry: ExternalRegexEntry): boolean {
  const text = `${entry.name} ${entry.description} ${entry.regex}`.toLowerCase();
  return CODING_SECRET_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * Load rules from external JSON converted from CSV regex lists.
 */
export function loadExternalRulesFromJson(
  jsonPath: string,
  options: ExternalRuleOptions = {}
): DetectionRule[] {
  if (!fs.existsSync(jsonPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as ExternalRegexEntry[];
    const codingOnly = options.codingOnly ?? true;
    const rules: DetectionRule[] = [];
    const usedIds = new Set<string>();

    for (const entry of parsed) {
      if (!entry?.name || !entry?.regex) {
        continue;
      }

      if (codingOnly && !isCodingSecretPattern(entry)) {
        continue;
      }

      try {
        // Ensure regex is compilable before adding.
        void new RegExp(entry.regex, 'g');
      } catch {
        continue;
      }

      let id = `external-${slugify(entry.name)}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `external-${slugify(entry.name)}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);

      rules.push({
        id,
        title: entry.name,
        description: entry.description || `External regex rule: ${entry.name}`,
        severity: riskToSeverity(Number(entry.risk) || 0),
        category: sourceCategoryToRuleCategory(entry.category || ''),
        pattern: entry.regex,
        examples: [entry.name],
        redactionStrategy: 'token-replace',
        enabled: true,
      });
    }

    return rules;
  } catch (error) {
    console.error('Failed to load external regex JSON rules:', error);
    return [];
  }
}
