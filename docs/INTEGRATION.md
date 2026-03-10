# Integration Guide

How to integrate Claude Privacy Guard with Claude Code and other tools.

## Claude Code Integration (MCP)

### Prerequisites

- Node.js 18+
- Claude Code CLI installed
- Basic understanding of MCP (Model Context Protocol)

### Installation

```bash
# Clone or install the package
npm install -g claude-privacy-guard

# Or run from source
git clone https://github.com/your-org/claude-privacy-guard
cd claude-privacy-guard
npm install
npm run build
```

### Configure Claude Code

Add to your Claude Code MCP config (`~/.config/claude-code/mcp.json`):

```json
{
  "mcpServers": {
    "privacy-guard": {
      "command": "node",
      "args": ["/path/to/claude-privacy-guard/dist/index.js"],
      "env": {}
    }
  }
}
```

### Verify Installation

```bash
# Start the MCP server
node dist/index.js

# You should see:
# "Claude Privacy Guard MCP server running on stdio"
```

### Test the Integration

In Claude Code, the privacy guard tools should be automatically available:

```typescript
// Available tools:
- scan_prompt(text: string)
- redact_prompt(text: string)
```

---

## Usage in Claude Code

### Automatic Scanning (Planned v1.1)

Once integrated, prompts will be automatically scanned before sending to Claude:

```
User types: "My API key is sk-proj-abc123"
              ↓
Privacy Guard scans
              ↓
Warning displayed:
┌─────────────────────────────────────┐
│ ⚠️  Sensitive data detected          │
│                                     │
│ - 1 secret (CRITICAL)               │
│                                     │
│ Actions:                            │
│ 1. Mask and continue                │
│ 2. Continue anyway                  │
│ 3. Cancel                           │
└─────────────────────────────────────┘
              ↓
User selects "Mask and continue"
              ↓
Sent to Claude: "My API key is <SECRET>"
```

### Manual Scanning (Current v0.1)

For now, you can manually invoke the scanner:

```typescript
// In your code
import { PrivacyScanner } from 'claude-privacy-guard';

const scanner = new PrivacyScanner();
const result = scanner.scan("Text to scan...");

if (result.hasHighRisk) {
  console.log(result.redactedText);
}
```

---

## Configuration

### Project-Level Config

Create `.privacy-guard.json` in your project root:

```json
{
  "enabled": true,
  "strictMode": false,
  "allowedDomains": [
    "example.com",
    "test.local",
    "mycompany.internal"
  ],
  "disabledRules": [],
  "redactionStyle": "placeholder",
  "autoMaskOnHighRisk": true
}
```

### Global Config

For user-wide settings, create `~/.privacy-guard.json`:

```json
{
  "enabled": true,
  "strictMode": true,
  "autoMaskOnHighRisk": true
}
```

**Priority**: Project config > Global config > Defaults

### Config Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable scanning |
| `strictMode` | boolean | `false` | Block on any findings (even low severity) |
| `allowedDomains` | string[] | `[]` | Domains to ignore in email detection |
| `disabledRules` | string[] | `[]` | Rule IDs to skip |
| `redactionStyle` | string | `"placeholder"` | How to redact: `placeholder`, `mask`, or `remove` |
| `autoMaskOnHighRisk` | boolean | `true` | Auto-redact critical/high findings |

### Disable Specific Rules

```json
{
  "disabledRules": [
    "email-address",
    "ip-address"
  ]
}
```

Use case: Disable email detection if you frequently reference example.com emails in documentation.

### Allowlist Domains

```json
{
  "allowedDomains": [
    "example.com",
    "localhost",
    "test.local"
  ]
}
```

Emails from these domains won't trigger warnings.

---

## API Reference

### PrivacyScanner

```typescript
import { PrivacyScanner } from 'claude-privacy-guard';

const scanner = new PrivacyScanner();
const result = scanner.scan(text);
```

**Methods**:

#### `scan(text: string): ScanResult`

Scans text for sensitive data.

**Returns**:
```typescript
{
  findings: Finding[];           // All detected issues
  originalText: string;          // Input text
  redactedText: string;          // Safe version
  riskScore: number;             // 0-100
  hasHighRisk: boolean;          // Has high/critical findings
  hasCriticalRisk: boolean;      // Has critical findings
  summary: {                     // Grouped by category
    [category: string]: number;
  };
}
```

**Example**:
```typescript
const result = scanner.scan("Email: user@test.com Key: sk-abc123");

console.log(result.redactedText);
// "Email: <PII_1> Key: <SECRET>"

console.log(result.riskScore);
// 125

console.log(result.summary);
// { pii: 1, secret: 1 }
```

### Redactor

```typescript
import { Redactor } from 'claude-privacy-guard';

const summary = Redactor.summarize(scanResult);
const details = Redactor.formatFindings(scanResult.findings);
```

**Methods**:

#### `summarize(scanResult: ScanResult): string`

Creates human-readable summary.

**Returns**:
```
Sensitive data detected:
  - 1 pii finding(s)
  - 1 secret finding(s)

Risk Score: 125/100
```

#### `formatFindings(findings: Finding[]): string`

Detailed findings report.

**Returns**:
```
1. [CRITICAL] AWS API Key
   Category: secret
   Found: "AKIAIOSFODNN7EXAMPLE"
   Redacted: "<SECRET>"

2. [MEDIUM] Email Address
   Category: pii
   Found: "user@test.com"
   Redacted: "<PII_1>"
```

### ConfigLoader

```typescript
import { ConfigLoader } from 'claude-privacy-guard';

const configPath = ConfigLoader.findConfig();
const loader = new ConfigLoader(configPath);
const config = loader.getConfig();
```

**Methods**:

#### `static findConfig(startDir?: string): string | null`

Searches for config file.

**Search Order**:
1. `startDir/.privacy-guard.json`
2. Walk up tree to find config
3. Return `null` if not found

#### `getConfig(): PrivacyGuardConfig`

Returns loaded config (merged with defaults).

---

## MCP Tools

### scan_prompt

**Purpose**: Analyze text for sensitive data without modifying it.

**Input**:
```json
{
  "text": "My email is user@test.com"
}
```

**Output**:
```json
{
  "summary": "Sensitive data detected:\n  - 1 pii finding(s)\n\nRisk Score: 25/100",
  "findings": 1,
  "riskScore": 25,
  "hasHighRisk": false,
  "hasCriticalRisk": false,
  "details": {
    "pii": 1
  }
}
```

**Use Case**: Check risk level before deciding to proceed.

### redact_prompt

**Purpose**: Scan and automatically redact sensitive data.

**Input**:
```json
{
  "text": "API key: sk-proj-abc123"
}
```

**Output**:
```json
{
  "originalLength": 24,
  "redactedText": "API key: <SECRET>",
  "findingsCount": 1,
  "summary": "Sensitive data detected:\n  - 1 secret finding(s)\n\nRisk Score: 100/100"
}
```

**Use Case**: Get safe version of text immediately.

---

## CI/CD Integration (Future)

### GitHub Actions

```yaml
name: Privacy Scan

on: [push, pull_request]

jobs:
  privacy-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Privacy Guard
        run: npm install -g claude-privacy-guard

      - name: Scan Repository
        run: |
          privacy-guard scan \
            --repo . \
            --output report.json \
            --fail-on critical

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: privacy-report
          path: report.json
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Scanning for sensitive data..."
privacy-guard scan --staged --fail-on high

if [ $? -ne 0 ]; then
  echo "❌ Sensitive data detected! Commit blocked."
  exit 1
fi
```

---

## VS Code Extension (Future)

### Planned Features

- Real-time inline detection
- Squiggly underlines for secrets
- Quick actions: "Mask this", "Ignore"
- Status bar risk indicator

### Example UI

```
┌───────────────────────────────────┐
│ file.ts                           │
├───────────────────────────────────┤
│                                   │
│ const apiKey = "sk-proj-abc123";  │
│                    ~~~~~~~~~~~~   │ ← Red underline
│                    ⚠️ OpenAI API Key detected
│                                   │
│ Quick Fix:                        │
│ - Replace with environment var    │
│ - Mask in this file              │
│ - Ignore (add to .gitignore)     │
└───────────────────────────────────┘
```

---

## Troubleshooting

### Scanner Not Running

**Problem**: MCP server doesn't start

**Solutions**:
1. Check Node.js version: `node --version` (need 18+)
2. Rebuild: `npm run build`
3. Check MCP config path is correct
4. Check logs: `~/.config/claude-code/logs/`

### Config Not Loading

**Problem**: Settings ignored

**Solutions**:
1. Verify file name: `.privacy-guard.json` (note the dot)
2. Check JSON syntax: `cat .privacy-guard.json | jq`
3. Check file location (project root)
4. Check permissions: `ls -la .privacy-guard.json`

### Too Many False Positives

**Problem**: Detecting safe strings

**Solutions**:
1. Add to `allowedDomains`: `["example.com"]`
2. Disable noisy rules: `"disabledRules": ["email-address"]`
3. Adjust patterns (contribute improved regex!)

### Scanner Too Slow

**Problem**: Scanning takes > 100ms

**Solutions**:
1. Check text size (very large prompts?)
2. Profile which rule is slow
3. Disable expensive rules temporarily
4. Report performance issue

### Missing Detections

**Problem**: Real secrets not caught

**Solutions**:
1. Check if pattern exists for that secret type
2. Verify rule is enabled: check `disabledRules`
3. Test pattern manually: `const scanner = new PrivacyScanner([customRule])`
4. Contribute new detector!

---

## Security Best Practices

### Do's ✅

- Enable `strictMode` for sensitive projects
- Review warnings before bypassing
- Rotate any detected credentials
- Add project-specific patterns as needed
- Keep Privacy Guard updated

### Don'ts ❌

- Don't disable all rules globally
- Don't commit real secrets (even if redacted)
- Don't assume 100% detection coverage
- Don't bypass critical warnings without review
- Don't share redacted text if you redacted it yourself (use Privacy Guard)

---

## Support

### Getting Help

1. Check documentation: `docs/`
2. Search issues: GitHub Issues
3. Ask in discussions: GitHub Discussions
4. Report bugs: GitHub Issues with `bug` label

### Contributing

See `CONTRIBUTING.md` for guidelines on:
- Adding new detectors
- Improving patterns
- Fixing bugs
- Documentation improvements
