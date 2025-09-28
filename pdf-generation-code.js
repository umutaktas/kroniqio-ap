export const code = async (inputs) => {
  // Get the filtered sales data from previous step
  const filterResults = inputs.filterResultsInput;
  const filteredSales = filterResults.filteredSales || [];
  const summary = filterResults.summary || {};
  const aiAnalysis = filterResults.aiAnalysis || {};

  // Generate HTML content for the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
                line-height: 1.6;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #007acc;
                padding-bottom: 20px;
            }
            .company-name {
                color: #007acc;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .report-title {
                font-size: 20px;
                color: #666;
                margin-bottom: 10px;
            }
            .report-date {
                font-size: 14px;
                color: #888;
            }
            .summary-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #007acc;
            }
            .summary-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #007acc;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .summary-item {
                background: white;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e0e0e0;
            }
            .summary-label {
                font-weight: bold;
                color: #555;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .summary-value {
                font-size: 18px;
                color: #007acc;
                font-weight: bold;
            }
            .sales-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
            }
            .sales-table th {
                background-color: #007acc;
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
            }
            .sales-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #e0e0e0;
            }
            .sales-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .sales-table tr:hover {
                background-color: #e8f4fd;
            }
            .amount {
                text-align: right;
                font-weight: bold;
                color: #28a745;
            }
            .quantity {
                text-align: center;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
                color: #888;
                font-size: 12px;
            }
            .no-data {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 40px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">${summary.company || 'Bilinmeyen Firma'}</div>
            <div class="report-title">Satış Raporu</div>
            <div class="report-date">Rapor Tarihi: ${summary.reportGeneratedAt || new Date().toLocaleString('tr-TR')}</div>
            <div class="report-date">Dönem: ${summary.period || 'Belirtilmemiş'}</div>
        </div>

        <div class="summary-section">
            <div class="summary-title">Özet Bilgiler</div>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Toplam Satış Tutarı</div>
                    <div class="summary-value">${summary.totalRevenueFormatted || '0 TRY'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Toplam Satış Adedi</div>
                    <div class="summary-value">${summary.salesCount || 0}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Toplam Ürün Miktarı</div>
                    <div class="summary-value">${summary.totalQuantity || 0}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Ortalama Sipariş Değeri</div>
                    <div class="summary-value">${summary.avgOrderValueFormatted || '0 TRY'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">En Çok Satılan Ürün</div>
                    <div class="summary-value">${summary.topProduct || 'Belirtilmemiş'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">En Aktif Bölge</div>
                    <div class="summary-value">${summary.topRegion || 'Belirtilmemiş'}</div>
                </div>
            </div>
        </div>

        ${filteredSales.length > 0 ? `
        <div>
            <h3 style="color: #007acc; margin-bottom: 10px;">Detaylı Satış Listesi</h3>
            <table class="sales-table">
                <thead>
                    <tr>
                        <th>SAP ID</th>
                        <th>Tarih</th>
                        <th>Ürün</th>
                        <th>Miktar</th>
                        <th>Birim Fiyat</th>
                        <th>Toplam Tutar</th>
                        <th>Bölge</th>
                        <th>Satış Temsilcisi</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSales.map(sale => `
                        <tr>
                            <td>${sale.id}</td>
                            <td>${new Date(sale.sale_date).toLocaleDateString('tr-TR')}</td>
                            <td>${sale.product}</td>
                            <td class="quantity">${sale.quantity}</td>
                            <td class="amount">${sale.unit_price.toLocaleString('tr-TR')} ${sale.currency}</td>
                            <td class="amount">${sale.total_amount.toLocaleString('tr-TR')} ${sale.currency}</td>
                            <td>${sale.region}</td>
                            <td>${sale.sales_person}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : `
        <div class="no-data">
            Bu dönem için satış verisi bulunamadı.
        </div>
        `}

        <div class="footer">
            <p>Bu rapor Activepieces SAP-WhatsApp entegrasyonu tarafından otomatik olarak oluşturulmuştur.</p>
            <p>Orijinal Mesaj: "${summary.originalMessage || 'Belirtilmemiş'}"</p>
        </div>
    </body>
    </html>
  `;

  // Return the HTML content and metadata for PDF generation
  return {
    htmlContent: htmlContent,
    filename: \`sales-report-\${summary.company?.replace(/[^a-zA-Z0-9]/g, '-') || 'unknown'}-\${new Date().toISOString().split('T')[0]}.pdf\`,
    metadata: {
      title: \`\${summary.company || 'Firma'} Satış Raporu\`,
      subject: \`\${summary.period || 'Dönem'} Satış Raporu\`,
      author: 'Activepieces SAP Integration',
      creator: 'SAP-WhatsApp Bot',
      creationDate: new Date().toISOString(),
      company: summary.company,
      totalRevenue: summary.totalRevenue,
      salesCount: summary.salesCount,
      period: summary.period
    },
    summary: {
      generatedAt: new Date().toLocaleString('tr-TR'),
      reportType: 'Satış Raporu',
      company: summary.company,
      period: summary.period,
      totalSales: filteredSales.length,
      totalRevenue: summary.totalRevenueFormatted,
      status: 'success'
    }
  };
};