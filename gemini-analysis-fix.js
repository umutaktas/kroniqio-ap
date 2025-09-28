// Bu kod 2. Step için - Gemini AI piece'inde kullanılacak

// Gemini'ye gönderilecek prompt:
`Aşağıdaki WhatsApp mesajını analiz ederek JSON formatında bilgi çıkar:

WhatsApp Mesajı: "{{steps['Generate Mock SAP Sales Data'].whatsappMessage}}"

Lütfen şu JSON formatında yanıt ver:
{
  "company_name": "firma adı (mesajda belirtilen firma ismi, eğer belirtilmemişse 'TÜM')",
  "date_filter": "tarih aralığı (örn: 'son 1 ay', 'son 3 ay', 'bu yıl', vs.)",
  "report_type": "rapor türü (örn: 'satış raporu', 'gelir raporu', vs.)"
}

Sadece JSON yanıtı ver, başka açıklama ekleme.`

// Gemini'nin döneceği yanıt örneği:
// {
//   "company_name": "ABC Firması",
//   "date_filter": "son 1 ay",
//   "report_type": "satış raporu"
// }