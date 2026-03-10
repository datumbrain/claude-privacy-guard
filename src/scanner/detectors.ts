/**
 * Pattern detectors for sensitive data
 */

import { DetectionRule } from '../types/findings.js';

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
