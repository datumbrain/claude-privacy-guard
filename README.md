# Claude Privacy Guard

> Prevent secrets and PII from being accidentally shared with Claude Code.

A privacy-first MCP plugin for Claude Code that scans prompts for sensitive data before they're sent to the AI.

## Status

🚧 **Early Development** - v0.1.0 MVP in progress

## What it does

- **Scans prompts** before they're sent to Claude
- **Detects** PII, secrets, API keys, tokens, and sensitive data
- **Redacts** automatically with semantic placeholders
- **Works locally** - nothing leaves your machine

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Test the scanner
node dist/index.js
```

## Current Detection Coverage

✅ **Implemented (v0.1.0)**:

- Email addresses
- JWT tokens
- Bearer tokens
- AWS API keys
- OpenAI API keys
- Stripe API keys
- SSH/PEM private keys

🔜 **Coming soon**:

- Phone numbers
- IP addresses
- Credit card numbers
- More API key patterns
- Custom rules

## Architecture

```
src/
├── index.ts           # MCP server entrypoint
├── scanner/
│   ├── engine.ts      # Core scanning logic
│   └── detectors.ts   # Pattern definitions
├── redactor/
│   └── masker.ts      # Redaction strategies
├── types/
│   └── findings.ts    # Type definitions
└── config/
    └── loader.ts      # Config management
```

## How it works

1. User types/pastes prompt in Claude Code
2. Privacy Guard scans locally using regex patterns
3. Detects sensitive data and calculates risk score
4. Redacts matches with placeholders (e.g., `<EMAIL_1>`, `<API_KEY>`)
5. Returns safe prompt + summary

## Example

**Before:**

```
Fix the auth issue. My API key is sk-proj-abc123xyz and contact me at john@example.com
```

**After:**

```
Fix the auth issue. My API key is <SECRET> and contact me at <EMAIL_1>
```

**Summary:**

```
Sensitive data detected:
  - 1 secret finding(s)
  - 1 pii finding(s)

Risk Score: 125/100
```

## Configuration

Create `.privacy-guard.json` in your project root:

```json
{
  "enabled": true,
  "strictMode": false,
  "allowedDomains": ["example.com"],
  "disabledRules": [],
  "redactionStyle": "placeholder",
  "autoMaskOnHighRisk": true
}
```

## Roadmap

- [x] Core scanning engine
- [x] Basic pattern detectors (7 rules)
- [x] Redaction with semantic placeholders
- [x] MCP server setup
- [ ] Terminal UI for warnings
- [ ] Config file support
- [ ] More detection patterns
- [ ] Repo-wide scanning
- [ ] Privacy reports

## Privacy First

- All scanning happens **locally**
- No data sent to external services
- No telemetry or tracking
- Open source and auditable

## Documentation

📚 **[Complete Documentation](docs/README.md)**

- [Setup & Installation](docs/SETUP-COMPLETE.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Detection Rules Reference](docs/DETECTORS.md)
- [Integration Guide](docs/INTEGRATION.md)
- [Product Roadmap](docs/PLAN.md)

## Contributing

This is an open-source project. Contributions welcome!

See [docs/README.md](docs/README.md) for contribution guidelines.

## License

MIT
