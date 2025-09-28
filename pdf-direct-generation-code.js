export const code = async (inputs) => {
  // Get the filtered sales data from previous step
  const filterResults = inputs.filterResultsInput;
  const filteredSales = filterResults.filteredSales || [];
  const summary = filterResults.summary || {};
  const aiAnalysis = filterResults.aiAnalysis || {};

  // If using the PDF generator piece directly, we need to format the data properly
  const pdfOptions = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    displayHeaderFooter: true,
    headerTemplate: \`
      <div style="font-size: 10px; margin: 0 auto; color: #666;">
        \${summary.company || 'Firma'} - Satış Raporu
      </div>
    \`,
    footerTemplate: \`
      <div style="font-size: 8px; margin: 0 auto; color: #666;">
        Sayfa <span class="pageNumber"></span> / <span class="totalPages"></span> -
        Oluşturulma: \${new Date().toLocaleString('tr-TR')}
      </div>
    \`,
    printBackground: true
  };

  // Create a more compact HTML for PDF generation
  const htmlForPdf = \`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>\${summary.company || 'Firma'} Satış Raporu</title>
        <style>
            @page {
                margin: 20mm 15mm;
                @top-center {
                    content: "\${summary.company || 'Firma'} - Satış Raporu";
                    font-size: 10px;
                    color: #666;
                }
                @bottom-center {
                    content: "Sayfa " counter(page) " / " counter(pages) " - " "\${new Date().toLocaleString('tr-TR')}";
                    font-size: 8px;
                    color: #666;
                }
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
                font-size: 12px;
                line-height: 1.4;
            }
            .header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #0066cc;
            }
            .company-name {
                color: #0066cc;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .report-info {
                color: #666;
                font-size: 11px;
            }
            .summary-box {
                background: #f5f7fa;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 20px;
            }
            .summary-title {
                font-weight: bold;
                color: #0066cc;
                margin-bottom: 10px;
                font-size: 14px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                margin-bottom: 10px;
            }
            .summary-item {
                text-align: center;
                padding: 8px;
                background: white;
                border-radius: 4px;
                border: 1px solid #eee;
            }
            .summary-label {
                font-size: 10px;
                color: #666;
                margin-bottom: 3px;
            }
            .summary-value {
                font-weight: bold;
                color: #0066cc;
                font-size: 11px;
            }
            .table-section {
                margin-top: 20px;
            }
            .section-title {
                font-weight: bold;
                color: #0066cc;
                font-size: 14px;
                margin-bottom: 10px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            .sales-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 9px;
                margin-top: 10px;
            }
            .sales-table th {
                background: #0066cc;
                color: white;
                padding: 6px 4px;
                text-align: left;
                font-weight: bold;
                font-size: 9px;
            }
            .sales-table td {
                padding: 5px 4px;
                border-bottom: 1px solid #eee;
                vertical-align: top;
            }
            .sales-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            .amount {
                text-align: right;
                font-weight: bold;
                color: #006600;
            }
            .center {
                text-align: center;
            }
            .no-data {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 30px;
                background: #f9f9f9;
                border-radius: 6px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">\${summary.company || 'Bilinmeyen Firma'}</div>
            <div class="report-info">
                <strong>SATIŞ RAPORU</strong><br>
                Dönem: \${summary.period || 'Belirtilmemiş'} |
                Rapor Tarihi: \${summary.reportGeneratedAt || new Date().toLocaleString('tr-TR')}
            </div>
        </div>

        <div class="summary-box">
            <div class="summary-title">📊 ÖZET BİLGİLER</div>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Toplam Satış</div>
                    <div class="summary-value">\${summary.totalRevenueFormatted || '0 TRY'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Satış Adedi</div>
                    <div class="summary-value">\${summary.salesCount || 0}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Ürün Miktarı</div>
                    <div class="summary-value">\${summary.totalQuantity || 0}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Ortalama Sipariş</div>
                    <div class="summary-value">\${summary.avgOrderValueFormatted || '0 TRY'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">En Çok Satan</div>
                    <div class="summary-value">\${summary.topProduct || '-'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">En Aktif Bölge</div>
                    <div class="summary-value">\${summary.topRegion || '-'}</div>
                </div>
            </div>
        </div>

        \${filteredSales.length > 0 ? \`
        <div class="table-section">
            <div class="section-title">📋 DETAYLI SATIŞ LİSTESİ</div>
            <table class="sales-table">
                <thead>
                    <tr>
                        <th style="width: 12%;">SAP ID</th>
                        <th style="width: 10%;">Tarih</th>
                        <th style="width: 20%;">Ürün</th>
                        <th style="width: 8%;">Miktar</th>
                        <th style="width: 12%;">Birim Fiyat</th>
                        <th style="width: 13%;">Toplam</th>
                        <th style="width: 12%;">Bölge</th>
                        <th style="width: 13%;">Temsilci</th>
                    </tr>
                </thead>
                <tbody>
                    \${filteredSales.map(sale => \`
                        <tr>
                            <td>\${sale.id}</td>
                            <td>\${new Date(sale.sale_date).toLocaleDateString('tr-TR')}</td>
                            <td>\${sale.product}</td>
                            <td class="center">\${sale.quantity}</td>
                            <td class="amount">\${sale.unit_price.toLocaleString('tr-TR')} ₺</td>
                            <td class="amount">\${sale.total_amount.toLocaleString('tr-TR')} ₺</td>
                            <td>\${sale.region}</td>
                            <td>\${sale.sales_person}</td>
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        </div>
        \` : \`
        <div class="no-data">
            Bu dönem için \${summary.company || 'firma'} satış verisi bulunamadı.
        </div>
        \`}

        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #666; text-align: center;">
            <em>Bu rapor Activepieces SAP-WhatsApp entegrasyonu tarafından otomatik oluşturulmuştur.</em><br>
            <strong>Orijinal İstek:</strong> "\${summary.originalMessage || 'Belirtilmemiş'}"
        </div>
    </body>
    </html>
  \`;

  // Generate filename
  const filename = \`sales-report-\${summary.company?.replace(/[^a-zA-Z0-9ğıİşçöüĞIİŞÇÖÜ]/g, '-').toLowerCase() || 'unknown'}-\${new Date().toISOString().split('T')[0]}.pdf\`;

  return {
    // For PDF generator piece
    html: htmlForPdf,
    filename: filename,
    options: pdfOptions,

    // Additional metadata
    metadata: {
      title: \`\${summary.company || 'Firma'} Satış Raporu\`,
      subject: \`\${summary.period || 'Dönem'} Satış Raporu\`,
      author: 'Activepieces SAP Integration',
      keywords: 'satış, rapor, SAP, WhatsApp',
      creator: 'SAP-WhatsApp Bot',
      producer: 'Activepieces PDF Generator'
    },

    // Summary for next steps
    reportSummary: {
      success: true,
      generatedAt: new Date().toLocaleString('tr-TR'),
      filename: filename,
      company: summary.company,
      period: summary.period,
      totalSales: filteredSales.length,
      totalRevenue: summary.totalRevenueFormatted,
      recordCount: filteredSales.length,
      message: \`\${summary.company || 'Firma'} için \${summary.period || 'belirtilen dönem'} satış raporu başarıyla oluşturuldu. \${filteredSales.length} satış kaydı işlendi.\`
    }
  };
};