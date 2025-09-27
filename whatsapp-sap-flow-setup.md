# WhatsApp SAP Flow Oluşturma Rehberi

## Önemli: Flow Manuel Oluşturulmalı
Flow'lar ActivePieces UI üzerinden manuel oluşturulur. Kod dosyaları sadece piece/action tanımlarıdır.

## Adım 1: ActivePieces'e Giriş
1. Tarayıcınızda https://kroniq.io adresine gidin
2. Admin hesabınızla giriş yapın
3. Sol menüden **"Flows"** seçeneğine tıklayın

## Adım 2: Yeni Flow Oluşturma
1. **"New Flow"** butonuna tıklayın
2. Flow adı: **"WhatsApp SAP Query Bot"**
3. **"Create"** tıklayın

## Adım 3: Webhook Trigger Ekleme
1. Flow canvas'ında **"+"** işaretine tıklayın
2. **"Trigger"** seçin
3. **"Webhook"** trigger'ı arayın ve seçin
4. Ayarlar:
   - Response: `Respond with 200`
   - Method: `POST`
5. **"Test Trigger"** tıklayın
6. **ÖNEMLİ**: Webhook URL'yi kopyalayın:
   ```
   https://kroniq.io/v1/webhooks/[FLOW_ID_BURAYA_GELECEK]
   ```
   Bu URL'yi Meta webhook configuration için kullanacaksınız!

## Adım 4: WhatsApp Verification Handler (Code Piece)
1. Trigger'dan sonra **"+"** tıklayın
2. **"Code"** piece seçin
3. Aşağıdaki kodu yapıştırın:

```javascript
export const code = async (inputs) => {
  console.log("Webhook received:", JSON.stringify(inputs.body, null, 2));

  // Meta Webhook Verification
  if (inputs.body && inputs.body['hub.mode'] === 'subscribe') {
    const mode = inputs.body['hub.mode'];
    const token = inputs.body['hub.verify_token'];
    const challenge = inputs.body['hub.challenge'];

    // Verify token - BU TOKEN'I META'DA KULLANACAKSINIZ
    if (mode && token === 'kroniq_sap_bot_2024') {
      console.log('✅ Webhook verified successfully!');
      // Return challenge for verification
      return {
        statusCode: 200,
        body: challenge,
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    } else {
      console.error('❌ Verification failed - token mismatch');
      return {
        statusCode: 403,
        body: 'Verification failed'
      };
    }
  }

  // Normal message processing
  const entry = inputs.body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) {
    console.log("No message found in webhook");
    return {
      statusCode: 200,
      body: 'OK'
    };
  }

  return {
    messageText: message.text?.body || '',
    senderPhone: message.from || '',
    messageId: message.id || '',
    messageType: message.type || 'text',
    timestamp: message.timestamp || Date.now(),
    recipientPhone: changes?.value?.metadata?.display_phone_number || '',
    fullWebhookData: inputs.body
  };
};
```

## Adım 5: SAP Query Handler (Code Piece)
1. Bir önceki step'ten sonra **"+"** tıklayın
2. **"Code"** piece seçin
3. Aşağıdaki kodu yapıştırın:

```javascript
export const code = async (inputs) => {
  const messageText = inputs.messageText;
  const senderPhone = inputs.senderPhone;

  if (!messageText) {
    return {
      response: "Mesaj bulunamadı",
      shouldRespond: false
    };
  }

  console.log(`Processing message from ${senderPhone}: ${messageText}`);

  // Simple keyword-based SAP query logic
  // (OpenAI entegrasyonu için ayrı bir piece gerekir)

  let response = "";
  let queryType = "";
  let requestsPDF = false;

  // Check for PDF request
  if (messageText.toLowerCase().includes('rapor') ||
      messageText.toLowerCase().includes('pdf') ||
      messageText.toLowerCase().includes('report')) {
    requestsPDF = true;
  }

  // Detect query type
  if (messageText.toLowerCase().includes('stok')) {
    queryType = 'stock';
    // Mock SAP stock data
    const stockData = [
      { kod: 'MAL001', ad: 'Çimento 42.5R', miktar: 1500, birim: 'TON', depo: 'DEPO-01' },
      { kod: 'MAL002', ad: 'Demir Φ12', miktar: 250, birim: 'TON', depo: 'DEPO-01' },
      { kod: 'MAL003', ad: 'Kum', miktar: 3000, birim: 'M3', depo: 'DEPO-02' }
    ];

    response = "📦 *STOK DURUMU*\n\n";

    // Check for specific material code
    const materialMatch = messageText.match(/MAL\d{3}/i);
    if (materialMatch) {
      const materialCode = materialMatch[0].toUpperCase();
      const item = stockData.find(s => s.kod === materialCode);
      if (item) {
        response += `${item.kod} - ${item.ad}\n`;
        response += `Miktar: ${item.miktar} ${item.birim}\n`;
        response += `Depo: ${item.depo}`;
      } else {
        response = `❌ ${materialCode} kodlu malzeme bulunamadı.`;
      }
    } else {
      // Show all stock
      stockData.forEach(item => {
        response += `*${item.kod}* - ${item.ad}\n`;
        response += `Miktar: ${item.miktar} ${item.birim} | Depo: ${item.depo}\n\n`;
      });
    }

  } else if (messageText.toLowerCase().includes('müşteri') ||
             messageText.toLowerCase().includes('bakiye')) {
    queryType = 'customer';
    // Mock SAP customer data
    const customerData = [
      { kod: 'MUS001', ad: 'ABC İnşaat A.Ş.', borc: 150000, alacak: 75000 },
      { kod: 'MUS002', ad: 'XYZ Yapı Ltd.', borc: 85000, alacak: 120000 },
      { kod: 'MUS003', ad: 'Mega İnşaat', borc: 320000, alacak: 280000 }
    ];

    response = "💰 *MÜŞTERİ BAKİYE*\n\n";

    // Check for specific customer code
    const customerMatch = messageText.match(/MUS\d{3}/i);
    if (customerMatch) {
      const customerCode = customerMatch[0].toUpperCase();
      const customer = customerData.find(c => c.kod === customerCode);
      if (customer) {
        const bakiye = customer.alacak - customer.borc;
        response += `${customer.kod} - ${customer.ad}\n`;
        response += `Borç: ${customer.borc.toLocaleString('tr-TR')} ₺\n`;
        response += `Alacak: ${customer.alacak.toLocaleString('tr-TR')} ₺\n`;
        response += `Bakiye: ${bakiye.toLocaleString('tr-TR')} ₺`;
      } else {
        response = `❌ ${customerCode} kodlu müşteri bulunamadı.`;
      }
    } else {
      // Show all customers
      customerData.forEach(customer => {
        const bakiye = customer.alacak - customer.borc;
        response += `*${customer.kod}* - ${customer.ad}\n`;
        response += `Bakiye: ${bakiye.toLocaleString('tr-TR')} ₺\n\n`;
      });
    }

  } else if (messageText.toLowerCase().includes('sipariş')) {
    queryType = 'orders';
    // Mock SAP order data
    const orderData = [
      { no: 'SIP001', musteri: 'ABC İnşaat', tarih: '2024-01-25', tutar: 75000, durum: 'Teslim Edildi' },
      { no: 'SIP002', musteri: 'XYZ Yapı', tarih: '2024-01-26', tutar: 120000, durum: 'Hazırlanıyor' },
      { no: 'SIP003', musteri: 'Mega İnşaat', tarih: '2024-01-27', tutar: 280000, durum: 'Onay Bekliyor' }
    ];

    response = "📋 *SATIŞ SİPARİŞLERİ*\n\n";

    // Filter for today if requested
    if (messageText.toLowerCase().includes('bugün')) {
      response += "_Bugünkü Siparişler:_\n\n";
    }

    orderData.forEach(order => {
      response += `*${order.no}* - ${order.musteri}\n`;
      response += `Tarih: ${order.tarih}\n`;
      response += `Tutar: ${order.tutar.toLocaleString('tr-TR')} ₺\n`;
      response += `Durum: ${order.durum}\n\n`;
    });

  } else {
    response = "❓ *Merhaba!* SAP sorgulama botuyum.\n\n";
    response += "Şu konularda yardımcı olabilirim:\n";
    response += "• Stok durumu (örn: _stok durumu_ veya _MAL001 stoğu_)\n";
    response += "• Müşteri bakiyesi (örn: _müşteri bakiye_ veya _MUS002 bakiyesi_)\n";
    response += "• Siparişler (örn: _siparişler_ veya _bugünkü siparişler_)\n\n";
    response += "PDF rapor için mesajınıza _'rapor'_ kelimesini ekleyin.";
  }

  if (requestsPDF && queryType) {
    response += "\n\n📄 _PDF rapor hazırlanıyor..._";
  }

  return {
    response: response,
    senderPhone: senderPhone,
    queryType: queryType,
    requestsPDF: requestsPDF,
    shouldRespond: true
  };
};
```

## Adım 6: WhatsApp Response Sender (Code Piece)
1. Bir önceki step'ten sonra **"+"** tıklayın
2. **"Code"** piece seçin
3. Aşağıdaki kodu yapıştırın:

```javascript
export const code = async (inputs) => {
  if (!inputs.shouldRespond) {
    return { sent: false, reason: "No response needed" };
  }

  // Bu kısım normalde WhatsApp Business API'yi çağırır
  // Şu an mock response dönüyoruz

  console.log("Would send WhatsApp message:");
  console.log("To:", inputs.senderPhone);
  console.log("Message:", inputs.response);

  // TODO: Gerçek WhatsApp API entegrasyonu
  // const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: inputs.senderPhone,
  //     type: 'text',
  //     text: { body: inputs.response }
  //   })
  // });

  return {
    sent: true,
    to: inputs.senderPhone,
    message: inputs.response,
    timestamp: new Date().toISOString()
  };
};
```

## Adım 7: Flow'u Yayınlama
1. Sağ üst köşedeki **"Publish"** butonuna tıklayın
2. Flow artık aktif ve webhook'ları dinliyor!

## Adım 8: Webhook URL'yi Meta'ya Ekleme
1. Flow'un webhook URL'sini kopyaladığınızdan emin olun
2. Meta Developer Console'a gidin
3. WhatsApp → Configuration → Webhooks
4. **Callback URL**: Kopyaladığınız webhook URL'yi yapıştırın
5. **Verify Token**: `kroniq_sap_bot_2024`
6. **Verify and Save** tıklayın

## Test Etme

### 1. Webhook Verification Testi
```bash
curl "https://kroniq.io/v1/webhooks/[FLOW_ID]?hub.mode=subscribe&hub.verify_token=kroniq_sap_bot_2024&hub.challenge=test123"
```
Response: `test123` dönmeli

### 2. Mesaj Testi
```bash
curl -X POST https://kroniq.io/v1/webhooks/[FLOW_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "905551234567",
            "text": {"body": "stok durumu"},
            "type": "text",
            "id": "wamid.test123",
            "timestamp": "1706350000"
          }],
          "metadata": {
            "display_phone_number": "905559876543"
          }
        }
      }]
    }]
  }'
```

## Flow Debug İpuçları
1. Her code piece'ten sonra flow run'ları kontrol edin
2. Console.log'ları kullanın
3. Flow logs'ta hataları inceleyin
4. Test mode'da çalıştırın

## Notlar
- Flow ID'yi Meta webhook configuration için saklayın
- WhatsApp Business API token'ınızı environment variable olarak ekleyin
- Production'da rate limiting ekleyin
- Error handling iyileştirin

---
Oluşturma Tarihi: Ocak 2024
Proje: kroniq.io WhatsApp-SAP Integration