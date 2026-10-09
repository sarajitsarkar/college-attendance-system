// ============================================================
// Export attendance records to an Excel (.xlsx) file using exceljs
// ============================================================
const ExcelJS = require('exceljs');

/**
 * Streams an Excel workbook of attendance rows directly to the HTTP response.
 * @param {import('express').Response} res
 * @param {Array<Object>} rows - attendance rows to export
 * @param {string} title - report title / filename
 */
async function exportAttendanceToExcel(res, rows, title = 'Attendance_Report') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'College Attendance Management System';
  const sheet = workbook.addWorksheet('Attendance');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Roll Number', key: 'roll_number', width: 16 },
    { header: 'Student Name', key: 'student_name', width: 22 },
    { header: 'Subject', key: 'subject_name', width: 22 },
    { header: 'Class', key: 'class_name', width: 18 },
    { header: 'Period', key: 'period', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDCE6F1' },
  };

  rows.forEach((row) => sheet.addRow(row));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${title}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportAttendanceToExcel };
