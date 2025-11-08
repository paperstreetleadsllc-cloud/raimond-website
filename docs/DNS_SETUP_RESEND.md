# DNS Setup for Resend Email (Vercel)

To send emails from `welcome@mail.raimondai.com`, you need to verify your domain with Resend.

## Steps

### 1. Add Domain to Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `mail.raimondai.com`
4. Click **"Add"**

### 2. Get DNS Records from Resend

Resend will provide you with DNS records to add. They should look like this:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| **TXT** | `_resend` | `resend_verify_xxxxxxxxxxxxx` | - |
| **TXT** | `resend._domainkey.mail` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...` | - |
| **MX** | `mail` | `feedback-smtp.us-east-1.amazonses.com` | 10 |

*Note: Your actual values will be different. Use the ones from your Resend dashboard.*

### 3. Add DNS Records in Vercel

1. Go to https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/settings/domains
2. Find your domain `raimondai.com`
3. Click **"Edit"** or **"DNS"**
4. Add the following records:

#### Record 1: Resend Verification Token
```
Type: TXT
Name: _resend.mail
Value: resend_verify_xxxxxxxxxxxxx (copy from Resend dashboard)
```

#### Record 2: DKIM Key
```
Type: TXT
Name: resend._domainkey.mail
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ... (copy from Resend)
```

#### Record 3: MX Record
```
Type: MX
Name: mail
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

#### Record 4: SPF Record (Optional but Recommended)
```
Type: TXT
Name: mail
Value: v=spf1 include:amazonses.com ~all
```

### 4. Verify in Resend

1. Wait 5-10 minutes for DNS propagation
2. Go back to https://resend.com/domains
3. Find `mail.raimondai.com`
4. Click **"Restart Verification"**

You should see:
- ✅ **Verification Token**: Verified
- ✅ **DKIM**: Verified
- ✅ **MX**: Verified

### 5. Test Email Sending

Once verified, test with:

```bash
cd scripts
bash test_resend.sh YOUR_RESEND_API_KEY your-email@example.com
```

Or use the VS Code REST Client file:
```
scripts/test_resend.http
```

---

## Troubleshooting

### DNS Not Propagating

- **Wait longer**: DNS can take up to 48 hours (usually 5-15 minutes)
- **Check DNS**: Use https://dnschecker.org to verify records are live
- **Flush DNS cache**: Clear your local DNS cache

### "Domain not verified" Error

1. Double-check all DNS records match exactly (including periods `.`)
2. Ensure no typos in TXT record values
3. Click "Restart Verification" in Resend dashboard
4. Contact Resend support if still failing

### Emails Going to Spam

- Add DMARC record (optional):
  ```
  Type: TXT
  Name: _dmarc.mail
  Value: v=DMARC1; p=none; rua=mailto:dmarc@raimondai.com
  ```

- Add SPF record (see Record 4 above)

- Warm up your domain by sending small volumes initially

---

## Quick Verification Checklist

- [ ] Domain `mail.raimondai.com` added in Resend
- [ ] TXT record for `_resend.mail` added in Vercel DNS
- [ ] TXT record for `resend._domainkey.mail` added in Vercel DNS
- [ ] MX record for `mail` added in Vercel DNS
- [ ] SPF record for `mail` added in Vercel DNS (optional)
- [ ] Clicked "Restart Verification" in Resend
- [ ] All 3 checkmarks (Verification, DKIM, MX) green in Resend
- [ ] Test email sent successfully
- [ ] Email not in spam folder

---

## Support

- **Resend Docs**: https://resend.com/docs/dashboard/domains/introduction
- **Vercel DNS Docs**: https://vercel.com/docs/concepts/projects/domains
- **DNS Checker**: https://dnschecker.org

If you encounter issues, contact:
- Resend Support: https://resend.com/support
- Vercel Support: https://vercel.com/help
