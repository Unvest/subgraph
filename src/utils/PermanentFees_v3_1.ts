import { Address } from '@graphprotocol/graph-ts'

import { UnderlyingTokenPermanentFees, VestingTokenPermanentFees } from '../../generated/schema'
import { CustomPermFeeChange as CustomPermFeeChangeEvent } from '../../generated/VestingTokenFactoryV3_1/VestingTokenFactoryV3_1'

/**
 * Instantiates the `UnderlyingTokenPermanentFees` in a disabled custom fee state.
 */
export function ensureUnderlyingTokenPermanentFees(event: CustomPermFeeChangeEvent): void {
  let underlyingTokenPermanentFees = UnderlyingTokenPermanentFees.load(event.params.underlyingToken)

  if (!underlyingTokenPermanentFees) {
    underlyingTokenPermanentFees = new UnderlyingTokenPermanentFees(event.params.underlyingToken)
    underlyingTokenPermanentFees.underlyingToken = event.params.underlyingToken.toHex()
    return
  }

  underlyingTokenPermanentFees.isEnabled = event.params.enable
  underlyingTokenPermanentFees.claimFeeValue = event.params.claimFeeValue
  underlyingTokenPermanentFees.transferFeePercentage = event.params.transferFeePercentage
  underlyingTokenPermanentFees.updatedAt = event.block.timestamp
  underlyingTokenPermanentFees.save()
}

/**
 * Instantiates the `VestingTokenPermanentFees` in a disabled custom fee state.
 */
export function ensureVestingTokenPermanentFee(
  vestingTokenAddress: Address,
  underlyingTokenAddress: Address,
): VestingTokenPermanentFees | null {
  let underlyingTokenPermanentFees = UnderlyingTokenPermanentFees.load(underlyingTokenAddress)

  if (!underlyingTokenPermanentFees || !underlyingTokenPermanentFees.isEnabled) {
    return null
  }

  let vestingTokenPermanentFees = new VestingTokenPermanentFees(vestingTokenAddress)
  vestingTokenPermanentFees.claimFeeValue = underlyingTokenPermanentFees.claimFeeValue
  vestingTokenPermanentFees.transferFeePercentage = underlyingTokenPermanentFees.transferFeePercentage
  vestingTokenPermanentFees.vestingToken = vestingTokenAddress.toHex()

  return vestingTokenPermanentFees
}
