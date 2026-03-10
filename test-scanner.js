#!/usr/bin/env node

/**
 * Quick test script to verify the scanner works
 */

const { PrivacyScanner } = require('./dist/scanner/engine.js');
const { Redactor } = require('./dist/redactor/masker.js');

const scanner = new PrivacyScanner();

// Test cases
const testCases = [
  {
    name: 'Email detection',
    text: 'Contact me at john.doe@example.com for updates',
  },
  {
    name: 'API key detection',
    text: 'Use this key: sk-proj-abc123xyz456 to authenticate',
  },
  {
    name: 'JWT detection',
    text: 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
  },
  {
    name: 'Multiple findings',
    text: 'My email is user@test.com and API key sk-live-12345abc Bearer token123',
  },
  {
    name: 'AWS key detection',
    text: 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE',
  },
];

console.log('🔒 Testing Claude Privacy Guard Scanner\n');
console.log('='.repeat(60));

for (const testCase of testCases) {
  console.log(`\n📋 Test: ${testCase.name}`);
  console.log('-'.repeat(60));

  const result = scanner.scan(testCase.text);

  console.log(`Original: ${testCase.text}`);
  console.log(`Redacted: ${result.redactedText}`);
  console.log(`\nFindings: ${result.findings.length}`);
  console.log(`Risk Score: ${result.riskScore}/100`);

  if (result.findings.length > 0) {
    console.log('\nDetected:');
    result.findings.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
      console.log(`     Match: "${f.match}" → "${f.redactedValue}"`);
    });
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Scanner test complete!\n');
