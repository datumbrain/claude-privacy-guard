# Claude Privacy Guard Documentation

Welcome to the Claude Privacy Guard documentation.

## Quick Links

- **[Setup & Installation](SETUP-COMPLETE.md)** - Get started quickly
- **[Architecture](ARCHITECTURE.md)** - How it works internally
- **[Detectors Reference](DETECTORS.md)** - All detection patterns
- **[Integration Guide](INTEGRATION.md)** - Claude Code & API usage
- **[Development Plan](PLAN.md)** - Product roadmap

## What is Claude Privacy Guard?

A privacy-first plugin for Claude Code that prevents accidental leakage of:
- 🔐 API keys and secrets
- 📧 Personal identifiable information (PII)
- 🎫 Authentication tokens
- 💳 Financial data
- 🔑 Private keys and credentials

## Key Features

✅ **Local Processing** - All scanning happens on your machine
✅ **Fast** - < 100ms scans for typical prompts
✅ **Transparent** - Open-source, auditable patterns
✅ **Configurable** - Customize rules per project
✅ **Privacy-First** - No telemetry, no external calls

## Documentation Structure

```
docs/
├── README.md              # You are here
├── SETUP-COMPLETE.md      # Installation & first steps
├── ARCHITECTURE.md        # Technical design
├── DETECTORS.md          # Detection patterns reference
├── INTEGRATION.md        # Integration guide (Claude Code, API)
└── PLAN.md               # Product roadmap & phases
```

## Quick Start

### 1. Install

```bash
npm install
npm run build
```

### 2. Test

```bash
node test-scanner.js
```

### 3. Use

```typescript
import { PrivacyScanner } from 'claude-privacy-guard';

const scanner = new PrivacyScanner();
const result = scanner.scan("My email is user@test.com");

console.log(result.redactedText);
// "My email is <PII_1>"
```

## Current Status (v0.1.0)

**Implemented**:
- ✅ Core scanning engine
- ✅ 7 detection rules (email, JWT, API keys, etc.)
- ✅ Redaction with semantic placeholders
- ✅ Risk scoring
- ✅ MCP server setup
- ✅ Config system

**In Progress**:
- 🚧 Claude Code integration
- 🚧 Terminal UI for warnings
- 🚧 Additional detectors (phone, IP, credit card)

**Planned**:
- 📋 Repo-wide scanning
- 📋 Privacy reports
- 📋 Custom rule engine
- 📋 CI/CD integration

See [PLAN.md](PLAN.md) for detailed roadmap.

## Common Tasks

### Add a New Detector

1. Edit `src/scanner/detectors.ts`
2. Add rule to `BUILTIN_RULES` array
3. Test with `test-scanner.js`
4. Document in [DETECTORS.md](DETECTORS.md)

**Example**:
```typescript
{
  id: 'phone-number',
  title: 'Phone Number',
  pattern: /\b\d{3}-\d{3}-\d{4}\b/g,
  severity: 'medium',
  category: 'pii',
  redactionStrategy: 'semantic',
  examples: ['555-123-4567'],
  enabled: true,
}
```

### Configure for Your Project

Create `.privacy-guard.json`:
```json
{
  "enabled": true,
  "strictMode": false,
  "allowedDomains": ["example.com"],
  "disabledRules": [],
  "redactionStyle": "placeholder"
}
```

See [INTEGRATION.md](INTEGRATION.md) for all options.

### Integrate with Claude Code

1. Build the project: `npm run build`
2. Add to MCP config: `~/.config/claude-code/mcp.json`
3. Restart Claude Code

See [INTEGRATION.md](INTEGRATION.md) for details.

## Architecture Overview

```
User Input → MCP Server → Scanner Engine → Detectors
                                ↓
                          Redactor → Safe Output
```

**Key Modules**:
- **Scanner Engine**: Pattern matching & risk analysis
- **Detectors**: Regex-based detection rules
- **Redactor**: Masking strategies
- **Config Loader**: User settings

See [ARCHITECTURE.md](ARCHITECTURE.md) for deep dive.

## Detection Categories

| Category | Examples | Severity |
|----------|----------|----------|
| **secret** | API keys, AWS keys, private keys | Critical |
| **auth-token** | JWT, Bearer tokens | High |
| **pii** | Emails, phone numbers | Medium |
| **credential** | Passwords, connection strings | Critical |
| **financial** | Credit cards, bank accounts | High |
| **internal-data** | Internal URLs, server IPs | Low-Medium |

See [DETECTORS.md](DETECTORS.md) for complete list.

## Performance

**Scan Times** (tested on MacBook Pro M1):

| Text Size | Scan Time |
|-----------|-----------|
| 1 KB | ~5 ms |
| 5 KB | ~20 ms |
| 10 KB | ~50 ms |

**Target**: < 100ms for typical prompts ✅

## Security Model

**Protects Against**:
- Accidental copy-paste of secrets
- PII in debug logs
- Credentials in code snippets
- Token leakage in examples

**Does NOT Protect Against**:
- Intentional malicious exfiltration
- Obfuscated/encoded secrets
- Domain-specific patterns (needs custom rules)

See [ARCHITECTURE.md](ARCHITECTURE.md#security-model) for threat model.

## Contributing

We welcome contributions! Areas where help is needed:

1. **New Detectors**: Phone numbers, IPs, credit cards, etc.
2. **Pattern Improvements**: Better regex, fewer false positives
3. **Documentation**: Examples, tutorials, translations
4. **Testing**: Unit tests, edge cases
5. **Integrations**: VS Code, other editors

### Adding a Detector

1. Research the pattern (check GitHub Secret Scanning, TruffleHog)
2. Write regex with test cases
3. Add to `src/scanner/detectors.ts`
4. Document in `docs/DETECTORS.md`
5. Add unit tests
6. Submit PR

## Resources

### Internal Docs
- [Setup Complete](SETUP-COMPLETE.md)
- [Architecture](ARCHITECTURE.md)
- [Detectors](DETECTORS.md)
- [Integration](INTEGRATION.md)
- [Product Plan](PLAN.md)

### External References
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Secret Scanning](https://github.com/github/secret-scanning)
- [TruffleHog Patterns](https://github.com/trufflesecurity/trufflehog)
- [OWASP Sensitive Data](https://owasp.org/www-community/vulnerabilities/Sensitive_Data_Exposure)

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/claude-privacy-guard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/claude-privacy-guard/discussions)
- **Email**: support@datumbrain.com (for security issues)

## License

MIT - See LICENSE file for details

---

**Privacy First. Local Always. Open Source Forever.**
