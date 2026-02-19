# Research Hub API Debugging Guide

## Issue
Search results are not showing real data from APIs.

## Improvements Made

### 1. Backend Enhancements
- Added detailed console logging for all API calls
- Improved error handling with full error details
- Added field selection for ClinicalTrials.gov API
- Increased timeout from 10s to 15s
- Added sort parameter for PubMed (relevance)
- Better query trimming and formatting

### 2. Frontend Enhancements
- Added comprehensive console logging
- Added validation for empty queries
- Added validation for source selection
- Added user-friendly error alerts
- Better error messages with details
- Improved result logging

## How to Debug

### Step 1: Check Backend Server
```bash
# Make sure backend is running
cd clinical-trials-platform/backend
npm run dev

# Should see: Server running on port 3001
```

### Step 2: Test API Directly

#### Test ClinicalTrials.gov
```bash
curl "https://clinicaltrials.gov/api/v2/studies?query.term=diabetes&pageSize=5&format=json"
```

#### Test PubMed
```bash
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=diabetes&retmax=5&retmode=json"
```

### Step 3: Test Backend Endpoint
```bash
curl -X POST http://localhost:3001/api/research/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "diabetes",
    "filters": {},
    "sources": ["clinicaltrials", "pubmed"]
  }'
```

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Search for "diabetes" or any term
4. Look for these logs:
   - "Starting search:"
   - "Sending API request to:"
   - "API Response status:"
   - "API Response data:"
   - "Setting results:"

### Step 5: Check Backend Console
Look for these logs:
- "ClinicalTrials.gov API Request:"
- "ClinicalTrials.gov API Response:"
- "PubMed API Request:"
- "PubMed Search Response:"
- "PubMed Fetch Response:"

## Common Issues & Solutions

### Issue 1: No Results from ClinicalTrials.gov
**Symptoms**: `clinicalTrialsCount: 0` in console

**Possible Causes**:
1. API is down or rate-limited
2. Query format is incorrect
3. Network/firewall blocking request

**Solution**:
```bash
# Test API directly
curl "https://clinicaltrials.gov/api/v2/studies?query.term=cancer&pageSize=5&format=json"

# If this works, check backend logs for errors
```

### Issue 2: No Results from PubMed
**Symptoms**: `pubMedCount: 0` in console

**Possible Causes**:
1. NCBI E-utilities rate limiting (max 3 requests/second)
2. Query format issues
3. Network issues

**Solution**:
```bash
# Test PubMed search
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=cancer&retmax=5&retmode=json"

# Check if you get IDs back
```

### Issue 3: Backend Not Responding
**Symptoms**: `API returned status 500` or timeout

**Solution**:
1. Check backend console for errors
2. Restart backend server
3. Check if port 3001 is available
4. Verify database connection

### Issue 4: CORS Errors
**Symptoms**: "CORS policy" error in browser console

**Solution**:
- Backend should have CORS enabled
- Check `backend/src/index.ts` for CORS configuration
- Make sure frontend is on `localhost:5173`

### Issue 5: Empty Results Despite Successful API Call
**Symptoms**: API returns 200 but results are empty

**Solution**:
1. Check data formatting in `formatClinicalTrial` and `formatPubMedArticles`
2. Verify API response structure matches expected format
3. Check for null/undefined values in formatting

## Expected Console Output

### Successful Search
```
Starting search: { query: "diabetes", sources: ["clinicaltrials", "pubmed"] }
Sending API request to: http://localhost:3001/api/research/search
API Response status: 200
API Response data: {
  success: true,
  clinicalTrialsCount: 50,
  pubMedCount: 50,
  perplexityAI: false
}
Setting results: {
  clinicalTrials: 50,
  pubMed: 50,
  perplexityAI: false
}
```

### Backend Logs
```
ClinicalTrials.gov API Request: {
  baseUrl: "https://clinicaltrials.gov/api/v2/studies",
  params: { query.term: "diabetes", pageSize: "50", ... }
}
ClinicalTrials.gov API Response: {
  totalCount: 15234,
  studiesCount: 50
}
PubMed API Request: {
  searchUrl: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
  searchParams: { db: "pubmed", term: "diabetes", ... }
}
PubMed Search Response: {
  count: 234567,
  idsFound: 50
}
PubMed Fetch Response: {
  articlesRetrieved: 50
}
```

## Testing Checklist

- [ ] Backend server is running on port 3001
- [ ] Frontend is running on port 5173
- [ ] Can access http://localhost:3001/api/research/search
- [ ] ClinicalTrials.gov API works directly
- [ ] PubMed API works directly
- [ ] No CORS errors in browser console
- [ ] Backend logs show API requests
- [ ] Backend logs show API responses
- [ ] Frontend logs show results being set
- [ ] Results appear in UI

## Quick Fix Commands

### Restart Backend
```bash
cd clinical-trials-platform/backend
# Kill existing process
pkill -f "node.*backend"
# Start fresh
npm run dev
```

### Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### Test with Simple Query
```javascript
// In browser console
fetch('http://localhost:3001/api/research/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'cancer',
    filters: {},
    sources: ['clinicaltrials', 'pubmed']
  })
})
.then(r => r.json())
.then(d => console.log('Test result:', d))
```

## Contact Points

If issues persist:
1. Check backend console for detailed error messages
2. Check browser console for frontend errors
3. Test APIs directly with curl
4. Verify network connectivity
5. Check for rate limiting (especially PubMed)

## Rate Limits

### ClinicalTrials.gov
- No official rate limit
- Generally very reliable

### PubMed E-utilities
- **Without API key**: 3 requests/second
- **With API key**: 10 requests/second
- Consider adding API key to `.env` if hitting limits

### Perplexity AI
- Depends on your plan
- Free tier has limits
- Check API key validity

## Next Steps

1. Run through testing checklist
2. Check console logs (both frontend and backend)
3. Test APIs directly
4. Verify data is being formatted correctly
5. Check for any network/firewall issues

---

**Remember**: The APIs are real and should return actual data. If you're seeing empty results, it's likely a configuration or network issue, not a problem with the API integration itself.
