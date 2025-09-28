// STEP 1: Webhook Trigger - WhatsApp mesajlarını alacak
// Flow'da Webhook trigger olarak kullanın

// STEP 2: Code Piece - Gelen veriyi loglayalım
export const code = async (inputs) => {
  console.log("=== WHATSAPP WEBHOOK TEST ===");
  console.log("Received webhook data:", JSON.stringify(inputs, null, 2));

  // Webhook'tan gelen veriyi parse edelim
  const webhookData = inputs.body || inputs;

  // WhatsApp webhook formatını kontrol et
  let messageInfo = {
    hasData: false,
    messageText: null,
    senderPhone: null,
    recipientPhone: null,
    messageId: null,
    timestamp: null
  };

  // Meta/WhatsApp webhook formatı
  if (webhookData.entry && Array.isArray(webhookData.entry)) {
    console.log("WhatsApp webhook format detected!");

    for (const entry of webhookData.entry) {
      if (entry.changes && Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          // Mesaj verisi
          if (change.value && change.value.messages) {
            const messages = change.value.messages;
            console.log(`Found ${messages.length} messages`);

            for (const message of messages) {
              messageInfo = {
                hasData: true,
                messageText: message.text?.body || message.text || "No text",
                senderPhone: message.from,
                recipientPhone: change.value.metadata?.display_phone_number || "Unknown",
                messageId: message.id,
                timestamp: message.timestamp,
                messageType: message.type,
                senderName: change.value.contacts?.[0]?.profile?.name || "Unknown"
              };

              console.log("Parsed message:", messageInfo);
            }
          }

          // Status update
          if (change.value && change.value.statuses) {
            console.log("Status update received:", change.value.statuses);
          }
        }
      }
    }
  }

  // Webhook verification (hub.challenge)
  if (webhookData['hub.challenge']) {
    console.log("Webhook verification request received");
    return {
      statusCode: 200,
      body: webhookData['hub.challenge'],
      verification: true,
      message: "Webhook verified successfully"
    };
  }

  // Test response
  const response = {
    success: true,
    receivedAt: new Date().toISOString(),
    webhookDataReceived: !!webhookData,
    messageFound: messageInfo.hasData,
    messageDetails: messageInfo,
    rawData: webhookData,
    testResult: messageInfo.hasData ? "✅ WhatsApp message received successfully!" : "⚠️ Webhook received but no message found"
  };

  console.log("Test Result:", response.testResult);

  return response;
};