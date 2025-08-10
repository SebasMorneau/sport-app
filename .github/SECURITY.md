# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes              |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

If you discover a security vulnerability in SportApp, please report it responsibly:

### How to Report

1. **Email**: Send details to security@sportapp.com
2. **GitHub**: Use [Security Advisories](https://github.com/yourusername/sport-app/security/advisories/new)
3. **PGP**: Use our public key for sensitive information

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if known)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Resolution**: Varies by severity (1-30 days)

## Security Best Practices

### For Users
- Keep the app updated to the latest version
- Use strong, unique passwords
- Enable device lock screens
- Don't share login credentials

### For Developers
- Follow secure coding practices
- Never commit secrets to version control
- Use environment variables for sensitive data
- Keep dependencies updated
- Implement proper input validation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Data Encryption**: Sensitive data encrypted at rest
- **HTTPS**: All API communications over TLS
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks

## Vulnerability Disclosure

We believe in responsible disclosure. When reporting vulnerabilities:

1. Give us reasonable time to fix the issue
2. Don't publicly disclose until we've released a fix
3. Don't exploit the vulnerability for malicious purposes

## Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- Acknowledged in our security hall of fame
- Credited in release notes (if desired)
- Eligible for bug bounty rewards (coming soon)

Thank you for helping keep SportApp secure! 🔒