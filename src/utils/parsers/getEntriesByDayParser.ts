function timestampToDate(timestamp) {
  return new Date(timestamp * 1000);
}

function getDayKey(timestamp) {
  const date = timestampToDate(timestamp);

  let month: string | number = date.getMonth() + 1;
  month = month < 10 ? `0${month}` : month;
  let day: string | number = date.getDate();
  day = day < 10 ? `0${day}` : day;

  return `${date.getFullYear()}-${month}-${day}`;
}

export interface EntriesByDayParserResult<T> {
  date: string;
  lastEntry: T;
  allEntries: T[];
}

//Get entries and group them by day from lowest timestamp to today's date in intervals of 24 hours.
//Useful for charts
export function getEntriesByDayParser<T extends { timestamp: number | null }>(
  entries: T[],
) {
  const sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);

  const todayTimestamp = new Date().getTime() / 1000;

  const oneDayInMs = 1 * 24 * 60 * 60;

  if (sortedEntries.length === 1) {
    sortedEntries[0].timestamp = todayTimestamp;
  }

  if (sortedEntries.length > 1) {
    sortedEntries[0].timestamp = sortedEntries[1].timestamp - 1;
  }

  const entriesByDay = {};

  for (
    let i = sortedEntries[0].timestamp;
    i <= todayTimestamp;
    i += oneDayInMs
  ) {
    const dayKey = getDayKey(i);
    entriesByDay[dayKey] = [];
  }

  sortedEntries.forEach((entry) => {
    const dayKey = getDayKey(entry.timestamp);
    if (!entriesByDay[dayKey]) {
      entriesByDay[dayKey] = [];
    }
    entriesByDay[dayKey].push(entry);
  });

  let lastEntries = null;

  for (const dayKey in entriesByDay) {
    if (entriesByDay[dayKey].length > 0) {
      lastEntries = entriesByDay[dayKey];
    }

    if (entriesByDay[dayKey].length === 0 && lastEntries) {
      entriesByDay[dayKey] = lastEntries;
    }

    entriesByDay[dayKey].sort((a, b) => a.timestamp - b.timestamp);
  }

  const finalEntries: EntriesByDayParserResult<T>[] = [];

  for (const dayKey in entriesByDay) {
    finalEntries.push({
      date: dayKey,
      lastEntry: entriesByDay[dayKey][entriesByDay[dayKey].length - 1],
      allEntries: entriesByDay[dayKey],
    });
  }

  return finalEntries;
}
