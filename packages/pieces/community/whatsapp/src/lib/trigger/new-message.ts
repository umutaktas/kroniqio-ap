import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { whatsappAuth } from '../..';

export const whatsappNewMessage = createTrigger({
  auth: whatsappAuth,
  name: 'new_message',
  displayName: 'New Message',
  description: 'Triggers when a new WhatsApp message is received',
  props: {},
  sampleData: {
    from: '+905551234567',
    to: '+905559876543',
    message: {
      text: 'Hello from WhatsApp',
      timestamp: new Date().toISOString(),
      message_id: 'wamid.HBgLNTQ1NTEyMzQ1NjcVAgASGBQzQTJCQzREMjQwQzY3MzJFMzE2AA==',
      type: 'text'
    },
    profile: {
      name: 'John Doe'
    }
  },
  type: TriggerStrategy.WEBHOOK,

  async onEnable(context) {
    // WhatsApp webhook verification
    // Store webhook URL for later use
    await context.store.put('webhookUrl', context.webhookUrl);
  },

  async onDisable(context) {
    // Clean up stored data
    await context.store.delete('webhookUrl');
  },

  async run(context) {
    const payload = context.payload as any;
    const body = payload.body;
    const headers = payload.headers;
    const queryParams = payload.queryParams || {};

    // Handle WhatsApp webhook verification (GET request)
    if (queryParams['hub.mode']) {
      const mode = queryParams['hub.mode'];
      const token = queryParams['hub.verify_token'];
      const challenge = queryParams['hub.challenge'];

      if (mode === 'subscribe' && token) {
        // Return the challenge for webhook verification
        return [{
          success: true,
          challenge: challenge,
          verified: true
        }];
      }
      return [];
    }

    // Handle incoming messages (POST request)
    if (body && body.entry) {
      const messages = [];

      for (const entry of body.entry) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === 'messages' && change.value?.messages) {
            for (const message of change.value.messages) {
              messages.push({
                from: message.from,
                to: change.value.metadata?.display_phone_number,
                message: {
                  text: message.text?.body || '',
                  timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                  message_id: message.id,
                  type: message.type
                },
                profile: {
                  name: change.value.contacts?.[0]?.profile?.name || 'Unknown'
                },
                raw: message
              });
            }
          }
        }
      }

      return messages;
    }

    // Return empty array if no messages
    return [];
  },
});