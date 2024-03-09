import { BigInt, Value, ethereum } from '@graphprotocol/graph-ts'

import { CustomTransferFee, UnderlyingToken } from '../../generated/schema'
import {
  CustomTransferFeeChange as CustomTransferFeeChangeEvent,
  CustomTransferFeeToggle as CustomTransferFeeToggleEvent,
} from '../../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

import { ONE_HOUR } from './Fee'

/**
 * Instantiates the `CustomTransferFee` in a disabled custom fee state.
 */
export function ensureCustomTransferFee(underlyingToken: UnderlyingToken, event: ethereum.Event): CustomTransferFee {
  const underlyingTokenId = Value.fromString(underlyingToken.id).toBytes()
  let customTransferFee = CustomTransferFee.load(underlyingTokenId)

  if (!customTransferFee) {
    customTransferFee = new CustomTransferFee(underlyingTokenId)
    customTransferFee.isEnabled = false
    customTransferFee.currentCustomValue = BigInt.zero()
    customTransferFee.nextCustomValue = BigInt.zero()
    customTransferFee.valueChangeAt = BigInt.zero()
    customTransferFee.nextEnableState = false
    customTransferFee.statusChangeAt = BigInt.zero()

    customTransferFee.underlyingToken = underlyingToken.id

    customTransferFee.updatedAt = event.block.timestamp
  }

  return customTransferFee
}

export function updateVestingTokenCustomTransferFeeValue(
  underlyingToken: UnderlyingToken,
  event: CustomTransferFeeChangeEvent,
): void {
  let customTransferFee = ensureCustomTransferFee(underlyingToken, event)

  // Update the previous custom transfer fee is applicable.
  if (customTransferFee.valueChangeAt <= event.block.timestamp) {
    customTransferFee.currentCustomValue = customTransferFee.valueChangeAt
  }

  customTransferFee.nextCustomValue = event.params.transferFeePercentage
  customTransferFee.valueChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customTransferFee.save()
}

export function updateVestingTokenCustomTransferFeeToggle(
  underlyingToken: UnderlyingToken,
  event: CustomTransferFeeToggleEvent,
): void {
  let customTransferFee = ensureCustomTransferFee(underlyingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customTransferFee.statusChangeAt <= event.block.timestamp) {
    customTransferFee.isEnabled = customTransferFee.nextEnableState
  }

  customTransferFee.nextEnableState = event.params.enable
  customTransferFee.statusChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customTransferFee.save()
}
