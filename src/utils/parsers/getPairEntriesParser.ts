import { ContractEntriesResponse } from "../../types";
import { scValToJs } from "mercury-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";


/**
 * Parses the data from a ContractEntriesResponse object and returns an array of pair addresses.
 * @param data The ContractEntriesResponse object to be parsed.
 * @returns An array of pair addresses.
 * @throws If no valueXdr is found in an entry.
 */
export const pairAddressesParser = (data: ContractEntriesResponse) => {
    const parsedEntries: any[] = [];

    let key: keyof typeof data;
    for (key in data) {
        const base64Xdr = data[key].edges[0].node.valueXdr;
        if (!base64Xdr) {
            throw new Error("No valueXdr found in the entry")
        }

        const parsedData:any = StellarSdk.xdr.ScVal.fromXDR(base64Xdr, "base64");
        const jsValues: any = scValToJs(parsedData)
        parsedEntries.push(jsValues);
    }

    return parsedEntries;
}