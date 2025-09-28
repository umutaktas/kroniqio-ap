import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { WebhookHandshakeStrategy } from '@activepieces/shared';
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

  // Handle Meta webhook verification via handshake
  handshakeConfiguration: {
    strategy: WebhookHandshakeStrategy.QUERY_PRESENT,
    paramName: 'hub.mode'
  },

  async onHandshake(context) {
    const queryParams = context.payload.queryParams || {};
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    console.log('[WhatsApp Handshake] Verification request:', {
      mode,
      token,
      challenge
    });

    // Check if this is a valid subscription request
    // We accept any verify token since it's configured in Meta's side
    if (mode === 'subscribe' && token && challenge) {
      console.log('[WhatsApp Handshake] Verification successful, returning challenge:', challenge);
      // Meta expects the challenge value as plain text response
      return {
        status: 200,
        body: challenge,
        headers: {
          'content-type': 'text/plain'
        }
      };
    }

    console.log('[WhatsApp Handshake] Verification failed - missing parameters');
    return {
      status: 400,
      body: 'Invalid verification request'
    };
  },

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

    console.log('[WhatsApp Trigger] Received webhook message:', {
      method: payload.method,
      hasBody: !!body,
      bodyEntries: body?.entry?.length || 0
    });

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