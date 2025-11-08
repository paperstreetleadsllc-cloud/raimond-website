#!/bin/bash
# RAimond Resend Email Test Script
# Usage: ./test_resend.sh YOUR_RESEND_API_KEY your-email@example.com

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./test_resend.sh YOUR_RESEND_API_KEY your-email@example.com"
  exit 1
fi

RESEND_API_KEY="$1"
TEST_EMAIL="$2"

echo "🧪 Testing Resend Email Delivery..."
echo "To: $TEST_EMAIL"
echo ""

# Send test email
RESPONSE=$(curl -s -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"RAimond <welcome@mail.raimondai.com>\",
    \"to\": [\"$TEST_EMAIL\"],
    \"subject\": \"Test: Welcome to RAimond – Your Starter Pack Inside 🚀\",
    \"html\": \"<!DOCTYPE html><html><head><meta charset=\\\"utf-8\\\"><title>Welcome</title></head><body style=\\\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\\\"><div style=\\\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;\\\"><h1 style=\\\"color: white; margin: 0;\\\">Welcome to RAimond</h1></div><div style=\\\"background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px;\\\"><h2>Test Email ✅</h2><p>If you're seeing this, your Resend integration is working!</p><p><strong>– The RAimond Team</strong></p></div></body></html>\"
  }")

echo "Response:"
echo "$RESPONSE" | python -m json.tool

# Extract email ID if successful
EMAIL_ID=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null || echo "")

if [ -n "$EMAIL_ID" ]; then
  echo ""
  echo "✅ Email sent successfully!"
  echo "Email ID: $EMAIL_ID"
  echo ""
  echo "Check your inbox: $TEST_EMAIL"
else
  echo ""
  echo "❌ Email send failed. Check the response above for errors."
  exit 1
fi
