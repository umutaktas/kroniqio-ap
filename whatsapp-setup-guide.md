# WhatsApp Integration Setup - kroniq.io

## Prerequisites
1. Activepieces running on https://kroniq.io
2. Cloudflare API routing fixed (see cloudflare-api-fix.md)
3. Meta Developer Account
4. WhatsApp Business Account

## Step 1: Meta Developer Setup

### Create WhatsApp Business App
1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Select "Business" → "Continue"
4. App name: "kroniq.io WhatsApp Bot"
5. Contact email: your email
6. Business Account: Select your business

### Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" → "Set Up"
3. Go to "Configuration" tab

### Get Required Credentials
```
Business Account ID: Found in WhatsApp → Configuration
System User Access Token: Create in Business Settings → System Users
Phone Number ID: From WhatsApp → Configuration → Phone Numbers
```

## Step 2: Activepieces Flow Setup

### Create New Flow
1. Login to https://kroniq.io
2. Click "Create Flow"
3. Name: "WhatsApp Echo Bot"

### Add WhatsApp Trigger
1. Click "+" to add trigger
2. Search "WhatsApp" → Select "WhatsApp Business"
3. Configure Authentication:
   - **Access Token**: Your System User Access Token
   - **Business Account ID**: Your Business Account ID
4. Select trigger type: "New Message"
5. Save configuration

### Get Webhook URL
1. After saving trigger, copy the webhook URL
2. Format: `https://kroniq.io/v1/webhooks/{flow-id}`

## Step 3: Meta Webhook Configuration

### Configure Webhook URL
1. In Meta Developer Console → WhatsApp → Configuration
2. Find "Webhook" section
3. Click "Configure"
4. **Webhook URL**: `https://kroniq.io/v1/webhooks/{your-flow-id}`
5. **Verify Token**: Enter a random string (remember this)
6. Click "Verify and Save"

### Subscribe to Events
1. After webhook is verified, click "Manage"
2. Subscribe to: **messages**
3. Save changes

## Step 4: Test Flow Setup

### Simple Echo Response
1. In your Activepieces flow, add an action after WhatsApp trigger
2. Select "WhatsApp Business" → "Send Message"
3. Configure:
   - **Connection**: Same as trigger
   - **To**: `{{trigger.from}}` (sender's number)
   - **Message**: `Echo: {{trigger.text.body}}`

### Test Message
1. Send a WhatsApp message to your business number
2. Check Activepieces flow runs
3. Verify echo response

## Step 5: Advanced Flow Examples

### Customer Support Bot
```yaml
Trigger: WhatsApp New Message
Actions:
  1. Branch based on message content
     - If contains "support": Route to human
     - If contains "hours": Send business hours
     - If contains "location": Send address
     - Default: Send menu options
```

### Lead Collection
```yaml
Trigger: WhatsApp New Message
Actions:
  1. Check if new customer (lookup in database)
  2. If new: Start lead collection flow
  3. Save contact info to CRM
  4. Send welcome message with next steps
```

## Troubleshooting

### Webhook Not Receiving Messages
1. Check webhook URL is correct: `https://kroniq.io/v1/webhooks/{flow-id}`
2. Verify Cloudflare Page Rules are configured
3. Test direct webhook: `curl -X POST https://kroniq.io/v1/webhooks/{flow-id}`
4. Check Activepieces flow logs

### Authentication Errors
1. Verify System User Access Token is not expired
2. Check Business Account ID is correct
3. Ensure app has whatsapp_business_messaging permission

### Message Not Sending
1. Check phone number is verified in Meta Console
2. Verify recipient number is in test recipients list
3. Check rate limits and quota

### API Errors
1. Test API connectivity: `curl https://kroniq.io/api/v1/flags`
2. Check nginx and PM2 logs
3. Verify backend is running on port 3000

## Production Checklist

### Before Going Live
- [ ] Business verification completed in Meta
- [ ] App review submitted (if needed)
- [ ] Phone number verified
- [ ] Webhook URL tested
- [ ] Flow thoroughly tested
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Security
- [ ] Store tokens securely
- [ ] Implement input validation
- [ ] Add rate limiting
- [ ] Monitor for abuse
- [ ] Log all interactions

## Sample Webhook Test

```bash
# Test webhook manually
curl -X POST https://kroniq.io/v1/webhooks/YOUR_FLOW_ID \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "15557654321",
            "id": "wamid.test",
            "timestamp": "1234567890",
            "text": {
              "body": "Hello World"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## Next Steps

1. **Fix Cloudflare API routing** (critical)
2. **Create test WhatsApp flow**
3. **Configure Meta webhook**
4. **Test end-to-end flow**
5. **Add error handling**
6. **Implement business logic**

---
Generated for kroniq.io WhatsApp integration
Backend: https://kroniq.io/v1/webhooks/
Frontend: https://kroniq.io/