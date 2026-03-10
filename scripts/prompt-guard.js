#!/usr/bin/env node

/**
 * Privacy Guard Hook for UserPromptSubmit
 *
 * This hook intercepts user prompts before they're sent to Claude,
 * scans for sensitive data, and blocks prompts containing sensitive information.
 */

import { PrivacyScanner } from '../dist/scanner/engine.js';
import { readFileSync } from 'fs';

// Read the user's prompt from stdin
let promptText = '';
try {
  // The prompt is passed via stdin by Claude Code
  promptText = readFileSync(0, 'utf-8');
} catch (error) {
  console.error('Error reading prompt:', error.message);
  process.exit(1);
}

// Initialize scanner
const scanner = new PrivacyScanner();

// Scan the prompt
const result = scanner.scan(promptText);

// If sensitive data found, block the prompt
if (result.findings.length > 0) {
  // Build detailed findings list
  const findingsList = result.findings.map(f =>
    `  - ${f.type}: ${f.match.substring(0, 20)}...`
  ).join('\n');

  // Return blocking decision as JSON
  const response = {
    decision: "block",
    reason: `🛡️ Privacy Guard blocked this prompt\n\n` +
            `Found ${result.findings.length} sensitive item(s):\n${findingsList}\n\n` +
            `Risk Score: ${result.riskScore}/100\n` +
            `Secrets: ${result.summary.secrets} | PII: ${result.summary.pii}\n\n` +
            `Please remove or anonymize sensitive data before proceeding.`
  };

  console.log(JSON.stringify(response, null, 2));

  // Also log to stderr for user visibility
  console.error('\n⚠️  Privacy Guard: Prompt blocked due to sensitive data');
  console.error(`   Found: ${result.findings.length} issue(s)`);
  console.error(`   Risk Score: ${result.riskScore}/100`);
  if (result.summary.secrets > 0) {
    console.error(`   - ${result.summary.secrets} secret(s)`);
  }
  if (result.summary.pii > 0) {
    console.error(`   - ${result.summary.pii} PII item(s)`);
  }
  console.error('');

  process.exit(0);
}

// No sensitive data, allow the prompt
process.exit(0);
