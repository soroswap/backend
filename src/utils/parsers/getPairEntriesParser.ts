import { ContractEntriesResponse } from "../../types";
import { scValToJs } from "mercury-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";

export const pairInstanceParser = (data: ContractEntriesResponse) => {
    // if (!data.entryUpdateByContractIdAndKey) {
    //   throw new Error("No entries provided")
    // }

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