import { BigInt, Value, ethereum } from '@graphprotocol/graph-ts'

import { CustomClaimFee, UnderlyingToken } from '../../generated/schema'
import {
  CustomClaimFeeChange as CustomClaimFeeChangeEvent,
  CustomClaimFeeToggle as CustomClaimFeeToggleEvent,
} from '../../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

import { ONE_HOUR } from './Fee'

/**
 * Instantiates the `CustomClaimFee` in a disabled custom fee state.
 */
export function ensureCustomClaimFee(underlyingToken: UnderlyingToken, event: ethereum.Event): CustomClaimFee {
  const underlyingTokenId = Value.fromString(underlyingToken.id).toBytes()
  let customClaimFee = CustomClaimFee.load(underlyingTokenId)

  if (!customClaimFee) {
    customClaimFee = new CustomClaimFee(underlyingTokenId)
    customClaimFee.isEnabled = false
    customClaimFee.currentCustomValue = BigInt.zero()
    customClaimFee.nextCustomValue = BigInt.zero()
    customClaimFee.nextChangeAt = BigInt.zero()
    customClaimFee.willBeEnabled = false
    customClaimFee.enableChangeAt = BigInt.zero()

    customClaimFee.underlyingToken = underlyingToken.id

    customClaimFee.updatedAt = event.block.timestamp
  }

  return customClaimFee
}

export function updateVestingTokenCustomClaimFeeValue(
  underlyingToken: UnderlyingToken,
  event: CustomClaimFeeChangeEvent,
): void {
  let customClaimFee = ensureCustomClaimFee(underlyingToken, event)

  // Update the previous custom transfer fee is applicable.
  if (customClaimFee.nextChangeAt <= event.block.timestamp) {
    customClaimFee.currentCustomValue = customClaimFee.nextChangeAt
  }

  customClaimFee.nextCustomValue = event.params.claimFeeValue
  customClaimFee.nextChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customClaimFee.save()
}

export function updateVestingTokenCustomClaimFeeToggle(
  underlyingToken: UnderlyingToken,
  event: CustomClaimFeeToggleEvent,
): void {
  let customClaimFee = ensureCustomClaimFee(underlyingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customClaimFee.enableChangeAt <= event.block.timestamp) {
    customClaimFee.isEnabled = customClaimFee.willBeEnabled
  }

  customClaimFee.willBeEnabled = event.params.enable
  customClaimFee.enableChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customClaimFee.save()
}
