export const getContractEventsByDayParser = (contractEvents: any[]) => {
  const groupedByDay = {};

  contractEvents.forEach((item) => {
    const dateKey = item.closeTime.toISOString().split('T')[0];

    if (!groupedByDay[dateKey]) {
      groupedByDay[dateKey] = [];
    }

    groupedByDay[dateKey].push(item);
  });

  const groupedArray = Object.keys(groupedByDay).map((date: string) => {
    return {
      date: date,
      events: groupedByDay[date],
    };
  });

  return groupedArray;
};
