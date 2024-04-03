export const calculateAPY = (volume: number, reserves: number) => {
  return (volume * 0.003 * 365 * 100) / reserves;
};
