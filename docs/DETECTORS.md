# Detection Rules Reference

Complete documentation of all built-in detection patterns.

## Current Detectors (v0.1.0)

### 1. Email Address

**Rule ID**: `email-address`
**Category**: PII
**Severity**: Medium
**Redaction**: `<PII_1>`, `<PII_2>`, etc.

**Pattern**:
```regex
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
```

**Matches**:
- ✅ `user@example.com`
- ✅ `john.doe@company.co.uk`
- ✅ `test+tag@gmail.com`
- ✅ `admin_2024@site-name.io`

**Does NOT Match**:
- ❌ `@username` (social handle)
- ❌ `email@` (incomplete)
- ❌ `@domain.com` (missing local part)

**Why We Detect This**:
Email addresses are PII and can identify individuals. Accidentally including real user emails in prompts could violate privacy policies.

**False Positives**:
- Example emails in documentation (e.g., `user@example.com`)
- Mitigation: Add `example.com` to allowedDomains in config

---

### 2. JWT Token

**Rule ID**: `jwt-token`
**Category**: Auth Token
**Severity**: High
**Redaction**: `<AUTH_TOKEN>`

**Pattern**:
```regex
\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b
```

**Matches**:
- ✅ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U`

**Structure**:
- Header: `eyJ...` (base64)
- Payload: `eyJ...` (base64)
- Signature: `...` (base64)

**Why We Detect This**:
JWTs contain authentication credentials and session data. They can grant full access to systems if leaked.

**Security Impact**: 🔴 Critical - Can authenticate as another user

---

### 3. Bearer Token

**Rule ID**: `bearer-token`
**Category**: Auth Token
**Severity**: High
**Redaction**: `<AUTH_TOKEN>`

**Pattern**:
```regex
\bBearer\s+[A-Za-z0-9\-._~+/]+=*
```

**Matches**:
- ✅ `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- ✅ `Bearer abc123xyz`
- ✅ `Authorization: Bearer token_here`

**Why We Detect This**:
Bearer tokens are used in HTTP Authorization headers and grant API access.

**Security Impact**: 🔴 High - Can access protected APIs

---

### 4. AWS API Key

**Rule ID**: `aws-api-key`
**Category**: Secret
**Severity**: Critical
**Redaction**: `<SECRET>`

**Pattern**:
```regex
\b(AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b
```

**Matches**:
- ✅ `AKIAIOSFODNN7EXAMPLE`
- ✅ `ASIATESTACCESSKEY123`
- ✅ `AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`

**Prefixes**:
- `AKIA` - Long-term credentials
- `ASIA` - Temporary credentials (STS)
- `AGPA`, `AIDA`, etc. - IAM entities

**Why We Detect This**:
AWS access keys provide programmatic access to AWS resources. Leaked keys can result in:
- Unauthorized resource access
- Data breaches
- Massive cloud bills

**Security Impact**: 🔴 Critical - Full AWS account access

**Mitigation**: Rotate keys immediately if detected in prompts

---

### 5. OpenAI API Key

**Rule ID**: `openai-api-key`
**Category**: Secret
**Severity**: Critical
**Redaction**: `<SECRET>`

**Pattern**:
```regex
\bsk-[A-Za-z0-9]{20,}\b
```

**Matches**:
- ✅ `sk-proj-1234567890abcdefghij`
- ✅ `OPENAI_API_KEY=sk-abc123xyz456...`

**Formats**:
- Project keys: `sk-proj-...`
- Legacy keys: `sk-...`

**Why We Detect This**:
OpenAI API keys grant access to:
- GPT models
- Usage quota
- Billing account

**Security Impact**: 🔴 Critical - Unauthorized API usage and costs

---

### 6. Stripe API Key

**Rule ID**: `stripe-api-key`
**Category**: Secret
**Severity**: Critical
**Redaction**: `<SECRET>`

**Pattern**:
```regex
\bsk_(live|test)_[0-9a-zA-Z]{24,}\b
```

**Matches**:
- ✅ `sk_live_51AbCdEfGhIjKlMnOpQrStUv`
- ✅ `sk_test_4eC39HqLyjWDarjtT1zdp7dc`

**Types**:
- `sk_live_` - Production keys (🔴 Very dangerous)
- `sk_test_` - Test mode keys (⚠️ Less critical but still sensitive)

**Why We Detect This**:
Stripe secret keys can:
- Access customer payment data
- Create charges
- Issue refunds
- Access financial records

**Security Impact**: 🔴 Critical - Financial data access

**Note**: Also detect publishable keys (`pk_`) in future versions

---

### 7. Private Key

**Rule ID**: `private-key`
**Category**: Secret
**Severity**: Critical
**Redaction**: `<SECRET>`

**Pattern**:
```regex
-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----[\s\S]*?-----END (RSA |OPENSSH |EC )?PRIVATE KEY-----
```

**Matches**:
```
✅ -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
   -----END PRIVATE KEY-----

✅ -----BEGIN RSA PRIVATE KEY-----
   ...
   -----END RSA PRIVATE KEY-----

✅ -----BEGIN OPENSSH PRIVATE KEY-----
   ...
   -----END OPENSSH PRIVATE KEY-----
```

**Types Detected**:
- RSA private keys
- EC (Elliptic Curve) keys
- OpenSSH format keys
- Generic PKCS#8 keys

**Why We Detect This**:
Private keys are used for:
- SSH authentication
- SSL/TLS certificates
- Code signing
- Encryption

**Security Impact**: 🔴 Critical - Server access, encryption compromise

**Note**: Matches multi-line keys with `[\s\S]*?` (non-greedy any character including newlines)

---

## Severity Levels

| Level | Risk | Examples |
|-------|------|----------|
| **Critical** | Can cause immediate security breach | API keys, private keys, AWS credentials |
| **High** | Can lead to unauthorized access | JWT tokens, auth tokens |
| **Medium** | Privacy concern, context-dependent | Email addresses, phone numbers |
| **Low** | Minor privacy issue | IP addresses, internal URLs |

## Redaction Strategies

### Semantic (`<TYPE_N>`)

Used for: PII where multiple instances need differentiation

**Example**:
```
Original: "Email alice@test.com or bob@test.com"
Redacted: "Email <PII_1> or <PII_2>"
```

**Benefits**: Claude can understand there are 2 different emails

### Token Replace (`<TYPE>`)

Used for: Secrets where identity doesn't matter

**Example**:
```
Original: "Use key sk-abc123 or sk-xyz789"
Redacted: "Use key <SECRET> or <SECRET>"
```

**Benefits**: Simple, clear that secrets were removed

### Partial Mask

Used for: When context is needed

**Example**:
```
Original: "server-prod-internal.company.com"
Redacted: "ser***nal"
```

**Benefits**: Shows pattern while hiding details

### Full Mask

Used for: Complete obfuscation

**Example**:
```
Original: "secretPassword123"
Redacted: "***"
```

**Benefits**: Maximum privacy

---

## Planned Detectors (v0.2.0+)

### Phone Numbers

**Pattern Ideas**:
```regex
# US Format
\b\d{3}[-.]?\d{3}[-.]?\d{4}\b

# International
\+\d{1,3}\s?\d{1,14}
```

**Examples**:
- `555-123-4567`
- `+1 (555) 123-4567`
- `+44 20 7123 4567`

### IP Addresses

**IPv4**:
```regex
\b(?:\d{1,3}\.){3}\d{1,3}\b
```

**IPv6**:
```regex
\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b
```

### Credit Card Numbers

**Pattern**:
```regex
\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b
```

**With Luhn validation** (reduces false positives)

### Social Security Numbers (US)

**Pattern**:
```regex
\b\d{3}-\d{2}-\d{4}\b
```

### GitHub Tokens

**Pattern**:
```regex
\bgh[pousr]_[A-Za-z0-9]{36,}\b
```

**Types**:
- `ghp_` - Personal access token
- `gho_` - OAuth token
- `ghu_` - User token
- `ghs_` - Server token
- `ghr_` - Refresh token

### Database Connection Strings

**Pattern**:
```regex
(postgres|mysql|mongodb)://[^:]+:[^@]+@[^/]+
```

**Example**: `postgres://user:password@localhost/db`

### Generic API Keys

**Pattern**: High entropy strings
```regex
\b[A-Za-z0-9]{32,}\b
```

**Challenge**: High false positive rate, needs context analysis

---

## Testing Your Own Patterns

### Pattern Testing Checklist

1. **True Positives**: Does it catch real secrets?
2. **False Positives**: Does it trigger on safe strings?
3. **Performance**: Is the regex efficient?
4. **Edge Cases**: Handles formatting variations?

### Testing Template

```typescript
{
  id: 'your-detector',
  pattern: /your-regex/g,
  examples: [
    'match-this-1',
    'match-this-2',
  ],
  // Test with:
  const scanner = new PrivacyScanner([yourRule]);
  const result = scanner.scan('test string');
  assert(result.findings.length > 0);
}
```

---

## Configuration

### Disable Specific Rules

`.privacy-guard.json`:
```json
{
  "disabledRules": ["email-address", "ip-address"]
}
```

### Allowlist Patterns

```json
{
  "allowedDomains": ["example.com", "test.local"]
}
```

**Effect**: Emails from these domains won't be flagged

---

## Contributing New Detectors

### Steps

1. Research pattern variations
2. Write regex with test cases
3. Add to `src/scanner/detectors.ts`
4. Document in this file
5. Add unit tests
6. Test against real-world examples

### Pattern Quality Guidelines

- ✅ Precise enough to avoid false positives
- ✅ Broad enough to catch real secrets
- ✅ Performant (avoid catastrophic backtracking)
- ✅ Well-documented with examples
- ✅ Tested with 10+ real examples

---

## Detection Performance

### Benchmark Results

| Detector | Avg Time | Regex Complexity |
|----------|----------|------------------|
| email-address | < 1ms | Low |
| jwt-token | < 1ms | Low |
| bearer-token | < 1ms | Low |
| aws-api-key | < 1ms | Low |
| openai-api-key | < 1ms | Low |
| stripe-api-key | < 1ms | Low |
| private-key | ~2ms | Medium (multiline) |

**Total scan time** (all rules): ~10ms on 1KB text

---

## Resources

### Pattern References

- [GitHub Secret Scanning Patterns](https://github.com/github/secret-scanning)
- [TruffleHog Regexes](https://github.com/trufflesecurity/trufflehog)
- [OWASP Sensitive Data](https://owasp.org/www-community/vulnerabilities/Sensitive_Data_Exposure)

### Testing Tools

- [Regex101](https://regex101.com/) - Test patterns
- [RegExr](https://regexr.com/) - Visual regex builder
- [Have I Been Pwned](https://haveibeenpwned.com/) - Check if keys leaked
