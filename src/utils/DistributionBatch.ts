import { BigInt } from "@graphprotocol/graph-ts";

import { DistributionBatch } from "../../generated/schema";
import { Transfer as TransferEvent } from "../../generated/templates/VestingToken/VestingToken";

/**
 * Retrieves the current `DistributionBatch` associaded to the transaction.
 * If entity doesn't exist it will create one.
 * @param transferEvent TransferEvent
 * @returns DistributionBatch
 */
export function ensureDistributionBatch(
  transferEvent: TransferEvent
): DistributionBatch {
  const id = transferEvent.transaction.hash.toHex();
  let distributionBatch = DistributionBatch.load(id);
  if (!distributionBatch) {
    distributionBatch = new DistributionBatch(id);
    distributionBatch.vestingToken = transferEvent.address.toHex();
    distributionBatch.totalAmount = BigInt.zero();
    distributionBatch.from = transferEvent.transaction.from;
    distributionBatch.blockNumber = transferEvent.block.number;
    distributionBatch.blockTimestamp = transferEvent.block.timestamp;
    distributionBatch.transactionHash = transferEvent.transaction.hash;
  }
  distributionBatch.totalAmount = distributionBatch.totalAmount.plus(
    transferEvent.params.value
  );
  distributionBatch.save();
  return distributionBatch;
}
