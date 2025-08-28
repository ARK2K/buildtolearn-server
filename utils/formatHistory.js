function formatHistory(historyDocs = []) {
  if (!Array.isArray(historyDocs)) {
    return { history: [], currentStreak: 0, highestStreak: 0 };
  }

  // Normalize entries so everything has weekStart & weekEnd
  const normalized = historyDocs.map((entry) => {
    const obj = entry.toObject ? entry.toObject() : entry;

    if (obj.week && obj.count !== undefined) {
      // Old format { week: Date/string, count: number }
      const weekStart = new Date(obj.week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return {
        weekStart,
        weekEnd,
        submissions: obj.count,
        score: obj.count, // fallback
      };
    }

    // New format already compatible
    return {
      ...obj,
      weekStart: new Date(obj.weekStart),
      weekEnd: new Date(obj.weekEnd),
    };
  });

  // Sort oldest → newest
  const sorted = [...normalized].sort(
    (a, b) => a.weekStart - b.weekStart
  );

  let streakCounter = 0;
  let highestStreak = 0;
  let prevWeekEnd = null;

  const formatted = sorted.map((entry) => {
    const { weekStart, weekEnd, submissions = 0, score = 0 } = entry;

    const missedWeek =
      prevWeekEnd && weekStart - prevWeekEnd > 7 * 24 * 60 * 60 * 1000;

    if ((submissions > 0 || score > 0) && !missedWeek) {
      streakCounter++;
      highestStreak = Math.max(highestStreak, streakCounter);
    } else {
      streakCounter = 0;
    }

    prevWeekEnd = weekEnd;

    return {
      ...entry,
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