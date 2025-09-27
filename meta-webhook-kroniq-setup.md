# Meta WhatsApp Webhook Configuration for kroniq.io

## Prerequisites Checklist
- [x] kroniq.io is live with HTTPS
- [x] ActivePieces deployed and running
- [ ] Meta Developer Account created
- [ ] WhatsApp Business App created
- [ ] System User Access Token generated

## Step 1: Meta Developer Console Setup

### 1.1 Create WhatsApp Business App
1. Go to: https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** type
4. App Configuration:
   - **App Name**: kroniq.io SAP Bot
   - **Contact Email**: [your-email]
   - **Business Portfolio**: Select or create business

### 1.2 Add WhatsApp Product
1. In App Dashboard → **"Add Product"**
2. Find **"WhatsApp"** → Click **"Set up"**
3. Navigate to **"WhatsApp → Configuration"**

### 1.3 Get Required Credentials
Navigate to WhatsApp → Configuration to find:
```
Business Account ID: [Will be shown here]
Phone Number ID: [Select from dropdown]
WhatsApp Business API Version: v18.0 (latest)
```

### 1.4 Create System User Token
1. Go to: https://business.facebook.com/settings
2. Navigate to **"Users → System Users"**
3. Click **"Add"** → Create new system user
4. Generate Token:
   - Select your WhatsApp app
   - Permissions needed:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Token expiration: 60 days or Never Expire
5. **Save the token securely!**

## Step 2: ActivePieces Flow Configuration

### 2.1 Create WhatsApp-SAP Flow
1. Login to https://kroniq.io
2. Create new flow: **"WhatsApp SAP Query Bot"**
3. Flow structure:
```yaml
Trigger: Webhook
Actions:
  1. Parse WhatsApp Message
  2. WhatsApp SAP Handler (Custom)
  3. Send WhatsApp Response
```

### 2.2 Configure Webhook Trigger
1. Add **Webhook** trigger
2. Copy the webhook URL:
   ```
   https://kroniq.io/v1/webhooks/[FLOW_ID]
   ```
3. Save this URL for Meta configuration

## Step 3: Meta Webhook Configuration

### 3.1 Configure Webhook in Meta
1. In Meta App → **WhatsApp → Configuration**
2. Find **"Webhooks"** section
3. Click **"Edit"** or **"Configure"**
4. Enter webhook details:
   - **Callback URL**: `https://kroniq.io/v1/webhooks/[YOUR_FLOW_ID]`
   - **Verify Token**: `kroniq_sap_bot_2024` (save this)
   - Click **"Verify and Save"**

### 3.2 Subscribe to Webhook Fields
1. After verification succeeds
2. Click **"Manage"** next to webhook
3. Subscribe to these fields:
   - ✅ `messages` (required)
   - ✅ `message_status` (optional)
   - ✅ `message_template_status_update` (optional)
4. Click **"Done"**

### 3.3 Webhook Verification Code
Add this to your flow's first Code action to handle verification:
```javascript
export const code = async (inputs) => {
  // Handle Meta webhook verification
  if (inputs.body && inputs.body['hub.mode'] === 'subscribe') {
    const mode = inputs.body['hub.mode'];
    const token = inputs.body['hub.verify_token'];
    const challenge = inputs.body['hub.challenge'];

    // Check token matches (use your verify token)
    if (mode && token === 'kroniq_sap_bot_2024') {
      console.log('Webhook verified!');
      return {
        statusCode: 200,
        body: challenge // Return challenge for verification
      };
    } else {
      return {
        statusCode: 403,
        body: 'Verification failed'
      };
    }
  }

  // Process regular messages
  return inputs;
};
```

## Step 4: Testing the Integration

### 4.1 Add Test Phone Number
1. In Meta App → **WhatsApp → API Setup**
2. Add test recipient phone number
3. Enter verification code sent via SMS

### 4.2 Send Test Message
```bash
# Test webhook directly
curl -X POST https://kroniq.io/v1/webhooks/[FLOW_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "905551234567",
            "text": {"body": "MAL001 stok durumu"},
            "type": "text"
          }]
        }
      }]
    }]
  }'
```

### 4.3 Test Natural Language Queries
Send these messages to test:
- Turkish:
  - "Stok durumu nedir?"
  - "MAL001 kodlu ürünün stoğu"
  - "MUS002 müşteri bakiyesi"
  - "Bugünkü siparişler rapor olarak"
- English:
  - "What is the stock status?"
  - "Customer balance for MUS001"
  - "Today's orders as PDF report"

## Step 5: Flow Implementation Details

### 5.1 Complete Flow Structure
```javascript
// Step 1: Webhook Trigger
// Receives WhatsApp messages

// Step 2: Parse Message
export const parseMessage = async (inputs) => {
  const entry = inputs.body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  return {
    messageText: message?.text?.body || '',
    senderPhone: message?.from || '',
    messageId: message?.id || '',
    timestamp: message?.timestamp || Date.now()
  };
};

// Step 3: Query SAP with AI
// Uses whatsapp-sap-handler.ts

// Step 4: Send Response
export const sendResponse = async (inputs) => {
  // Format and send WhatsApp response
  // If PDF, upload to file storage first
  // Then send document message
};
```

### 5.2 Environment Variables Needed
Add to ActivePieces environment:
```env
# OpenAI for natural language processing
OPENAI_API_KEY=sk-...

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...

# Webhook verification
WEBHOOK_VERIFY_TOKEN=kroniq_sap_bot_2024
```

## Step 6: Production Checklist

### Before Going Live
- [ ] Business verification completed
- [ ] Phone number verified (not in sandbox)
- [ ] Webhook URL tested and working
- [ ] SAP dummy data initialized
- [ ] AI handler tested with various queries
- [ ] PDF generation working
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Security Considerations
- [ ] Access token stored securely
- [ ] Webhook verification token unique
- [ ] Input validation on all messages
- [ ] SQL injection prevention
- [ ] Rate limiting per sender
- [ ] Audit logging enabled

### Monitoring
- [ ] Flow execution logs
- [ ] Error tracking
- [ ] Response time monitoring
- [ ] Daily usage reports
- [ ] Failed message alerts

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Messages
- Check webhook URL is exactly: `https://kroniq.io/v1/webhooks/[FLOW_ID]`
- Verify webhook subscription is active in Meta console
- Check flow is published and active
- Test with curl command first

#### 2. Verification Failing
- Ensure verify token matches in both Meta and flow code
- Check that challenge is returned as plain text, not JSON
- Verify HTTPS certificate is valid

#### 3. Messages Not Sending
- Check phone number is verified
- Verify access token has correct permissions
- Check rate limits haven't been exceeded
- Ensure recipient opted in for messages

#### 4. AI Not Understanding Queries
- Check OpenAI API key is valid
- Verify system prompt is correct
- Test with simpler queries first
- Check language detection

## Support Resources

- Meta WhatsApp Docs: https://developers.facebook.com/docs/whatsapp
- ActivePieces Docs: https://www.activepieces.com/docs
- OpenAI API: https://platform.openai.com/docs
- kroniq.io Support: support@kroniq.io

---
Generated: January 2024
For: kroniq.io WhatsApp-SAP Integration