/**
 * Function to create object with variables to be used in the Mercury instance query.
 * @param pairCount Number of pairs to be retrieved.
 * @returns Object with the query variables.
 */
export function createVariablesForPairsTokensAndReserves(addresses: string[]) {
  const variables = {};

  for (let i = 0; i < addresses.length; i++) {
    variables[`contractId${i + 1}`] = addresses[i];
  }

  return variables;
}
