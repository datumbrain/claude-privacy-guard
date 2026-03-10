# Claude Privacy Guard

> 🛡️ Prevent secrets and PII from being accidentally shared with Claude Code

A privacy-first plugin for Claude Code that scans prompts for sensitive data and **blocks** them before they reach the AI.

## Features

- ✅ **Blocks prompts** containing sensitive data before they're sent to Claude
- ✅ **Detects** PII, secrets, API keys, tokens, and sensitive information
- ✅ **Works locally** - all scanning happens on your machine
- ✅ **Zero configuration** - works out of the box
- ✅ **Detailed reporting** - shows exactly what was detected

## Quick Start

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Start Claude Code with the plugin
claude --plugin-dir /path/to/claude-privacy-guard
```

## What Gets Detected

✅ **Secrets**
- OpenAI API keys (`sk-...`, `sk-proj-...`)
- AWS credentials
- GitHub tokens
- Stripe keys
- JWT tokens
- Bearer tokens
- SSH private keys
- Generic API key patterns

✅ **Personal Information (PII)**
- Email addresses
- Phone numbers
- Social Security Numbers
- Credit card numbers

## How It Works

1. You type a prompt in Claude Code
2. Privacy Guard intercepts it via a `UserPromptSubmit` hook
3. Scans for sensitive data using regex patterns
4. **Blocks the prompt** if sensitive data is found
5. Shows you exactly what was detected

## Example

**Input:**
```
My API key is sk-proj-abc123xyz and email is john@example.com
```

**Result:**
```
🛡️ Privacy Guard blocked this prompt

Found 2 sensitive item(s):
  - API_KEY: sk-proj-abc123xyz...
  - EMAIL: john@example.com...

Risk Score: 100/100
Secrets: 1 | PII: 1

Please remove or anonymize sensitive data before proceeding.
```

## Installation

### Method 1: Direct Usage (Recommended)

```bash
claude --plugin-dir /path/to/claude-privacy-guard
```

### Method 2: Create an Alias

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias claude-safe='claude --plugin-dir /path/to/claude-privacy-guard'
```

Then use:
```bash
claude-safe
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Test the scanner directly
echo "test sk-proj-abc123" | node scripts/prompt-guard.js
```

## Architecture

```
.
├── .claude-plugin/
│   └── plugin.json       # Plugin manifest
├── hooks/
│   └── hooks.json        # Hook configuration
├── scripts/
│   ├── prompt-guard.js   # Main scanning script
│   └── prompt-guard-wrapper.sh
├── src/
│   ├── scanner/          # Detection engine
│   ├── redactor/         # Data masking utilities
│   └── config/           # Configuration
└── dist/                 # Compiled output
```

## Privacy & Security

- ✅ All scanning happens **locally on your machine**
- ✅ No data is sent to external services
- ✅ No telemetry or tracking
- ✅ Open source and fully auditable
- ✅ The plugin only blocks - it doesn't store or log your sensitive data

## Why Block Instead of Redact?

Claude Code's hook system doesn't support transforming prompts - only blocking or adding context. Blocking ensures sensitive data **never** reaches the AI, which is the safest approach.

## Debugging

Check the debug log if you encounter issues:

```bash
cat /tmp/claude-privacy-guard.log
```

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT © Datum Brain
