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

//Get entries and group them by day.
//Useful for charts
export function getEntriesByDayParser<T extends { timestamp: number | null }>(
  entries: T[],
) {
  const soroswapCreationTimestamp =
    new Date('2024-03-11 16:23:45 UTC').getTime() / 1000;

  entries = entries.map((e) => {
    return {
      ...e,
      timestamp: e.timestamp ? e.timestamp : soroswapCreationTimestamp,
    };
  });

  const sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);

  const entriesByDay = {};

  sortedEntries.forEach((entry) => {
    const dayKey = getDayKey(entry.timestamp);
    if (!entriesByDay[dayKey]) {
      entriesByDay[dayKey] = [];
    }
    entriesByDay[dayKey].push(entry);
  });

  for (const dayKey in entriesByDay) {
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
