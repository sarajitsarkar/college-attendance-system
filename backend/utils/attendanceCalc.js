// ============================================================
// Shared attendance percentage calculation helpers
// ============================================================

/**
 * Calculates attendance percentage.
 * "present" and "late" both count as attended; only "absent" counts against.
 */
function calcPercentage(totalClasses, attendedClasses) {
  if (!totalClasses || totalClasses === 0) return 0;
  return Number(((attendedClasses / totalClasses) * 100).toFixed(2));
}

const LOW_ATTENDANCE_THRESHOLD = Number(process.env.LOW_ATTENDANCE_THRESHOLD) || 75;

function isLowAttendance(percentage) {
  return percentage < LOW_ATTENDANCE_THRESHOLD;
}

module.exports = { calcPercentage, isLowAttendance, LOW_ATTENDANCE_THRESHOLD };
