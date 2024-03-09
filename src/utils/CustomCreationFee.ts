import { BigInt, Value, ethereum } from '@graphprotocol/graph-ts'

import { CustomCreationFee, UnderlyingToken } from '../../generated/schema'
import {
  CustomCreationFeeChange as CustomCreationFeeChangeEvent,
  CustomCreationFeeToggle as CustomCreationFeeToggleEvent,
} from '../../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

import { ONE_HOUR } from './Fee'

/**
 * Instantiates the `CustomCreationFee` in a disabled custom fee state.
 */
export function ensureCustomCreationFee(underlyingToken: UnderlyingToken, event: ethereum.Event): CustomCreationFee {
  const underlyingTokenId = Value.fromString(underlyingToken.id).toBytes()
  let customCreationFee = CustomCreationFee.load(underlyingTokenId)

  if (!customCreationFee) {
    customCreationFee = new CustomCreationFee(underlyingTokenId)
    customCreationFee.isEnabled = false
    customCreationFee.currentCustomValue = BigInt.zero()
    customCreationFee.nextCustomValue = BigInt.zero()
    customCreationFee.valueChangeAt = BigInt.zero()
    customCreationFee.nextEnableState = false
    customCreationFee.statusChangeAt = BigInt.zero()

    customCreationFee.underlyingToken = underlyingToken.id

    customCreationFee.updatedAt = event.block.timestamp
  }

  return customCreationFee
}

export function updateVestingTokenCustomCreationFeeValue(
  underlyingToken: UnderlyingToken,
  event: CustomCreationFeeChangeEvent,
): void {
  let customCreationFee = ensureCustomCreationFee(underlyingToken, event)

  // Update the previous custom transfer fee is applicable.
  if (customCreationFee.valueChangeAt <= event.block.timestamp) {
    customCreationFee.currentCustomValue = customCreationFee.valueChangeAt
  }

  customCreationFee.nextCustomValue = event.params.creationFeeValue
  customCreationFee.valueChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customCreationFee.save()
}

export function updateVestingTokenCustomCreationFeeToggle(
  underlyingToken: UnderlyingToken,
  event: CustomCreationFeeToggleEvent,
): void {
  let customCreationFee = ensureCustomCreationFee(underlyingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customCreationFee.statusChangeAt <= event.block.timestamp) {
    customCreationFee.isEnabled = customCreationFee.nextEnableState
  }

  customCreationFee.nextEnableState = event.params.enable
  customCreationFee.statusChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customCreationFee.save()
}
