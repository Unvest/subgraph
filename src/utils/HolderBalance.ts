import { Address, BigInt } from "@graphprotocol/graph-ts";

import { HolderBalance, VestingToken } from "../../generated/schema";
import { VestingToken as VestingTokenContract } from "../../generated/templates/VestingToken/VestingToken";

export function updateHolderBalance(
  userAddress: Address,
  vestingTokenAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  timestamp: BigInt,
  hasClaimed: boolean
): HolderBalance {
  const id = `${userAddress.toHex()}-${vestingTokenAddress.toHex()}`;
  let holderBalance = HolderBalance.load(id);
  if (!holderBalance) {
    holderBalance = new HolderBalance(id);
    holderBalance.user = userAddress.toHex();
    holderBalance.vestingToken = vestingTokenAddress.toHex();
    holderBalance.balance = BigInt.zero();
    holderBalance.transferredIn = BigInt.zero();
    holderBalance.transferredOut = BigInt.zero();
    holderBalance.isRecipient = false;
    holderBalance.allocation = BigInt.zero();
  }

  const vestingToken = VestingTokenContract.bind(vestingTokenAddress);
  const newBalance = vestingToken.balanceOf(userAddress);
  // Check if user is a new holder
  if (!newBalance.isZero() && holderBalance.balance.isZero()) {
    // Increment Holders count
    const vestingEntity = VestingToken.load(vestingTokenAddress.toHex());
    if (vestingEntity) {
      vestingEntity.holdersCount += 1;
      vestingEntity.save();
    }
  }
  // Check if user is no longer a holder
  if (newBalance.isZero() && !holderBalance.balance.isZero()) {
    // Reduce Holders count
    const vestingEntity = VestingToken.load(vestingTokenAddress.toHex());
    if (vestingEntity && vestingEntity.holdersCount > 0) {
      vestingEntity.holdersCount -= 1;
      vestingEntity.save();
    }
  }

  // Claimed Balance
  const claimedBalanceOfCall = vestingToken.try_claimedBalanceOf(userAddress);
  holderBalance.claimed = claimedBalanceOfCall.reverted
    ? BigInt.fromI32(0)
    : claimedBalanceOfCall.value;

  // Claimable Balance
  const claimableBalanceOfCall =
    vestingToken.try_claimableBalanceOf(userAddress);
  holderBalance.claimable = claimableBalanceOfCall.reverted
    ? BigInt.fromI32(0)
    : claimableBalanceOfCall.value;

  // Locked Balance
  const lockedBalanceOfCall = vestingToken.try_lockedBalanceOf(userAddress);
  holderBalance.locked = lockedBalanceOfCall.reverted
    ? BigInt.fromI32(0)
    : lockedBalanceOfCall.value;

  // Balance
  holderBalance.balance = newBalance;

  // Timestamp
  holderBalance.updatedAt = timestamp;
  if (hasClaimed) {
    holderBalance.lastClaimedAt = timestamp;
  }
  holderBalance.save();

  return holderBalance;
}
