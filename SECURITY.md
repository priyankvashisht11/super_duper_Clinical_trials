# Security Guidelines

## API Key Management

### Perplexity API Key

The Perplexity API key is a sensitive credential that must be protected.

#### ✅ Correct Storage
- **Location**: `backend/.env` file
- **Format**: `PERPLEXITY_API_KEY="your_actual_key_here"`
- **Git Protection**: `.env` is listed in `.gitignore` and will NOT be committed to version control

#### ❌ Never Do This
- ❌ Commit `.env` file to git
- ❌ Share API key in documentation
- ❌ Hardcode API key in source code
- ❌ Expose API key in frontend code
- ❌ Include API key in error messages or logs
- ❌ Share API key in screenshots or videos

#### 🔒 Security Best Practices

1. **Environment Variables Only**
   ```bash
   # backend/.env (NOT committed to git)
   PERPLEXITY_API_KEY="your_actual_key_here"
   ```

2. **Example File for Reference**
   ```bash
   # backend/.env.example (safe to commit)
   PERPLEXITY_API_KEY="your_perplexity_api_key_here"
   ```

3. **Backend-Only Access**
   - API key is ONLY accessed in backend code
   - Frontend NEVER has direct access to API key
   - All AI requests go through backend API endpoints

4. **Git Protection**
   - `.env` is in `.gitignore`
   - Verify before committing: `git status` should NOT show `.env`
   - If accidentally committed, rotate the API key immediately

#### 🔄 Key Rotation

If your API key is exposed:

1. **Immediately** generate a new key from Perplexity dashboard
2. Update `backend/.env` with new key
3. Restart backend server
4. Revoke the old key in Perplexity dashboard

#### 📋 Setup Instructions for New Developers

1. Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Get API key from team lead (via secure channel)

3. Update `backend/.env`:
   ```bash
   PERPLEXITY_API_KEY="paste_your_actual_key_here"
   ```

4. Verify `.env` is NOT tracked by git:
   ```bash
   git status  # Should NOT show .env
   ```

5. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

## Database Credentials

Similar security practices apply to database credentials:

- Store in `backend/.env`
- Never commit to git
- Use strong passwords
- Rotate credentials periodically

## General Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in source code
- [ ] No credentials in documentation
- [ ] Backend validates all API requests
- [ ] Frontend uses backend API (not direct AI API calls)
- [ ] Error messages don't expose sensitive data
- [ ] Logs don't contain API keys or credentials

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Contact the team lead directly
3. Provide details of the vulnerability
4. Wait for confirmation before disclosing

---

**Last Updated**: February 9, 2026  
**Review Frequency**: Quarterly
