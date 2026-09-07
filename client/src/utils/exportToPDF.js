/**
 * Utility to export HTML element or table content to PDF / Print report
 * Used for Municipal Admin operational reports, collection schedules, and business request summaries.
 */
export const exportToPDF = (elementId, title = 'Operational_Report') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return;
  }

  // Create a printable window with Debre Markos Municipality header styling
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="am">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #065f46; font-size: 20px; }
        .header p { margin: 4px 0 0; font-size: 13px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
        th { background-color: #f3f4f6; color: #1f2937; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>የደብረ ማርቆስ ከተማ ማዘጋጃ ቤት የቆሻሻ ማኔጅመንት አገልገሎት</h2>
        <p>${title.replace(/_/g, ' ')} - Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
      </div>
      <div class="content">
        ${input.innerHTML}
      </div>
      <div class="footer">
        <p>Debre Markos Municipality Waste Collection & Management System</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.close();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};