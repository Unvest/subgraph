import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

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
  const underlyingTokenId = Bytes.fromHexString(underlyingToken.id)
  let customClaimFee = CustomClaimFee.load(underlyingTokenId)

  if (!customClaimFee) {
    customClaimFee = new CustomClaimFee(underlyingTokenId)
    customClaimFee.isEnabled = false
    customClaimFee.currentCustomValue = BigInt.zero()
    customClaimFee.nextCustomValue = BigInt.zero()
    customClaimFee.valueChangeAt = BigInt.zero()
    customClaimFee.nextEnableState = false
    customClaimFee.statusChangeAt = BigInt.zero()

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
  if (customClaimFee.valueChangeAt <= event.block.timestamp) {
    customClaimFee.currentCustomValue = customClaimFee.valueChangeAt
  }

  customClaimFee.nextCustomValue = event.params.claimFeeValue
  customClaimFee.valueChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customClaimFee.save()
}

export function updateVestingTokenCustomClaimFeeToggle(
  underlyingToken: UnderlyingToken,
  event: CustomClaimFeeToggleEvent,
): void {
  let customClaimFee = ensureCustomClaimFee(underlyingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customClaimFee.statusChangeAt <= event.block.timestamp) {
    customClaimFee.isEnabled = customClaimFee.nextEnableState
  }

  customClaimFee.nextEnableState = event.params.enable
  customClaimFee.statusChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customClaimFee.save()
}
