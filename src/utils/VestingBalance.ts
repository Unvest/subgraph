import { Address, BigInt } from '@graphprotocol/graph-ts'

import { VestingBalance } from '../../generated/schema'
import { VestingTokenV3 as VestingTokenContract } from '../../generated/templates/VestingTokenV3/VestingTokenV3'

export function updateVestingBalance(
  vestingTokenAddress: Address,
  timestamp: BigInt,
  hasClaimed: boolean,
): VestingBalance {
  const id = vestingTokenAddress.toHex()
  let vestingBalance = VestingBalance.load(id)
  if (!vestingBalance) {
    vestingBalance = new VestingBalance(id)
    vestingBalance.allocation = BigInt.zero()
    vestingBalance.vestingToken = vestingTokenAddress.toHex()
  }

  const vestingToken = VestingTokenContract.bind(vestingTokenAddress)

  // Claimed Supply
  const claimedSupplyCall = vestingToken.try_claimedSupply()
  vestingBalance.claimed = claimedSupplyCall.reverted ? BigInt.fromI32(0) : claimedSupplyCall.value

  // Claimable Supply
  const claimableSupplyCall = vestingToken.try_claimableSupply()
  vestingBalance.claimable = claimableSupplyCall.reverted ? BigInt.fromI32(0) : claimableSupplyCall.value

  // Total Supply
  const totalSupplyCall = vestingToken.try_totalSupply()
  vestingBalance.locked = totalSupplyCall.reverted ? BigInt.fromI32(0) : totalSupplyCall.value

  vestingBalance.updatedAt = timestamp
  if (hasClaimed) {
    vestingBalance.lastClaimedAt = timestamp
  }
  vestingBalance.save()

  return vestingBalance
}
