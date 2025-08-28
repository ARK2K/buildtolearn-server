function formatHistory(historyDocs = []) {
  if (!Array.isArray(historyDocs)) {
    return { history: [], currentStreak: 0, highestStreak: 0 };
  }

  // Always sort oldest → newest
  const sorted = [...historyDocs].sort(
    (a, b) => new Date(a.weekStart) - new Date(b.weekStart)
  );

  let streakCounter = 0;
  let highestStreak = 0;
  let prevWeekEnd = null;

  const formatted = sorted.map((entry) => {
    const entryObj = entry.toObject ? entry.toObject() : entry;
    const weekStart = new Date(entryObj.weekStart);
    const weekEnd = new Date(entryObj.weekEnd);

    const missedWeek =
      prevWeekEnd &&
      weekStart - prevWeekEnd > 7 * 24 * 60 * 60 * 1000;

    if ((entryObj.submissions > 0 || entryObj.score > 0) && !missedWeek) {
      streakCounter++;
      highestStreak = Math.max(highestStreak, streakCounter);
    } else {
      streakCounter = 0;
    }

    prevWeekEnd = weekEnd;

    return {
      ...entryObj,
      label: `${weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${weekEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`,
      streak: streakCounter,
    };
  });

  const currentStreak =
    formatted.length > 0 ? formatted[formatted.length - 1].streak : 0;

  return {
    history: formatted,
    currentStreak,
    highestStreak,
  };
}

module.exports = { formatHistory };