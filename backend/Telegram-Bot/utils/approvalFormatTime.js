function formatDisplayTimeForApproval(displayTime) {
  if (!displayTime) return "Not specified";

  const start = new Date(displayTime.startTime);
  const end = new Date(displayTime.endTime);

  const optionsDate = { year: "numeric", month: "short", day: "numeric" };
  const optionsTime = { hour: "2-digit", minute: "2-digit", second: "2-digit" };

  const startDateStr = start.toLocaleDateString(undefined, optionsDate);
  const endDateStr = end.toLocaleDateString(undefined, optionsDate);

  const startTimeStr = start.toLocaleTimeString(undefined, optionsTime);
  const endTimeStr = end.toLocaleTimeString(undefined, optionsTime);

  if (startDateStr === endDateStr) {
    return `${startDateStr}\n🕒 Display Time : **${startTimeStr} → ${endTimeStr}**`;
  } else {
    return `🟢 Start: **${startDateStr} ${startTimeStr}**\n🔴 End: **${endDateStr} ${endTimeStr}**`;
  }
}

module.exports = { formatDisplayTimeForApproval };
