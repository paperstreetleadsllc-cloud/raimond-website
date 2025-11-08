# Supabase REST API Examples

These examples show how to interact with the RAimond signup tables using Supabase's REST API.

## Prerequisites

Get your credentials from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

- `SUPABASE_URL`: Your project URL (e.g., `https://abcdefgh.supabase.co`)
- `SUPABASE_SERVICE_KEY`: Your service_role key (starts with `eyJ...`)

## Authentication

All requests require the `apikey` header and `Authorization` header:

```bash
-H "apikey: YOUR_SERVICE_KEY"
-H "Authorization: Bearer YOUR_SERVICE_KEY"
```

---

## 1. Insert a Lead (Step 1)

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/rest/v1/leads" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "email": "trader@example.com",
    "consent_given": true,
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "spring_2025",
    "utm_term": "day trading software",
    "utm_content": "ad_variant_a",
    "referrer": "https://google.com",
    "ip_hash": "a1b2c3d4e5f6g7h8",
    "client_timestamp": "2025-01-15T10:30:00Z"
  }'
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "trader@example.com",
    "consent_given": true,
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "spring_2025",
    "utm_term": "day trading software",
    "utm_content": "ad_variant_a",
    "referrer": "https://google.com",
    "ip_hash": "a1b2c3d4e5f6g7h8",
    "client_timestamp": "2025-01-15T10:30:00Z",
    "created_at": "2025-01-15T10:30:05.123456Z",
    "updated_at": "2025-01-15T10:30:05.123456Z"
  }
]
```

---

## 2. Check if Profile Exists (Before Step 2)

```bash
curl "https://YOUR_PROJECT.supabase.co/rest/v1/lead_profiles?lead_id=eq.550e8400-e29b-41d4-a716-446655440000" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json"
```

**Response (if exists):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
]
```

**Response (if doesn't exist):**
```json
[]
```

---

## 3. Insert a Profile (Step 2 - New Profile)

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/rest/v1/lead_profiles" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
    "experience_level": "intermediate",
    "challenge": "Struggling with entries on choppy days",
    "trading_style": "day",
    "asset_classes": ["futures", "options"],
    "phone": "+14155551234",
    "tools": ["tos", "tradingview"],
    "portfolio_range": "50k-250k",
    "monthly_volume": "50-200",
    "region": "US-West",
    "tags": {
      "exp:intermediate": true,
      "style:day": true,
      "asset:futures": true,
      "asset:options": true,
      "tool:tos": true,
      "tool:tradingview": true,
      "phone:present": true,
      "portfolio:50k-250k": true,
      "volume:50-200": true,
      "region:US-West": true
    }
  }'
```

---

## 4. Update a Profile (Step 2 - Existing Profile)

```bash
curl -X PATCH "https://YOUR_PROJECT.supabase.co/rest/v1/lead_profiles?lead_id=eq.550e8400-e29b-41d4-a716-446655440000" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "experience_level": "advanced",
    "phone": "+14155559999",
    "tags": {
      "exp:advanced": true,
      "style:day": true,
      "asset:futures": true,
      "phone:present": true
    }
  }'
```

---

## 5. Query Leads by UTM Source

```bash
curl "https://YOUR_PROJECT.supabase.co/rest/v1/leads?utm_source=eq.google&select=email,created_at,utm_campaign" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"
```

---

## 6. Query Profiles with Tag Filtering

```bash
# Find all beginner traders
curl "https://YOUR_PROJECT.supabase.co/rest/v1/lead_profiles?tags->>exp:beginner=eq.true" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"
```

---

## 7. Join Leads with Profiles

```bash
curl "https://YOUR_PROJECT.supabase.co/rest/v1/leads?select=email,lead_profiles(experience_level,trading_style,phone)" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"
```

---

## Testing in Postman / Insomnia

1. **Base URL:** `https://YOUR_PROJECT.supabase.co`
2. **Headers:**
   ```
   apikey: YOUR_SERVICE_KEY
   Authorization: Bearer YOUR_SERVICE_KEY
   Content-Type: application/json
   Prefer: return=representation
   ```
3. Use the endpoints above

---

## Notes

- Always use `Prefer: return=representation` to get the inserted/updated row back
- Use `eq.` for exact matches in filters (e.g., `?email=eq.test@example.com`)
- Use `->>` for JSONB field access (e.g., `tags->>'phone:present'`)
- Service role key has full database access - **never expose it client-side**
