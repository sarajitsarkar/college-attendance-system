// ============================================================
// Export attendance records to a PDF file using pdfkit
// ============================================================
const PDFDocument = require('pdfkit');

/**
 * Streams a PDF report of attendance rows directly to the HTTP response.
 * @param {import('express').Response} res
 * @param {Array<Object>} rows
 * @param {string} title
 */
function exportAttendanceToPDF(res, rows, title = 'Attendance Report') {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '_')}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).fillColor('gray').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  const headers = ['Date', 'Roll No.', 'Student', 'Subject', 'Class', 'Period', 'Status'];
  const colWidths = [70, 80, 130, 130, 110, 60, 80];
  let y = doc.y;

  function drawRow(values, isHeader = false) {
    let x = doc.page.margins.left;
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    values.forEach((val, i) => {
      doc.text(String(val ?? ''), x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
    y += 20;
    if (y > doc.page.height - 50) {
      doc.addPage({ layout: 'landscape' });
      y = doc.page.margins.top;
    }
  }

  drawRow(headers, true);
  doc.moveTo(doc.page.margins.left, y - 5).lineTo(doc.page.width - doc.page.margins.right, y - 5).stroke();

  rows.forEach((r) =>
    drawRow([r.date, r.roll_number, r.student_name, r.subject_name, r.class_name, r.period, r.status])
  );

  doc.end();
}

module.exports = { exportAttendanceToPDF };
