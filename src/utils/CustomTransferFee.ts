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
    customTransferFee.nextChangeAt = BigInt.zero()
    customTransferFee.willBeEnabled = false
    customTransferFee.enableChangeAt = BigInt.zero()

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
  if (customTransferFee.nextChangeAt <= event.block.timestamp) {
    customTransferFee.currentCustomValue = customTransferFee.nextChangeAt
  }

  customTransferFee.nextCustomValue = event.params.transferFeePercentage
  customTransferFee.nextChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customTransferFee.save()
}

export function updateVestingTokenCustomTransferFeeToggle(
  underlyingToken: UnderlyingToken,
  event: CustomTransferFeeToggleEvent,
): void {
  let customTransferFee = ensureCustomTransferFee(underlyingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customTransferFee.enableChangeAt <= event.block.timestamp) {
    customTransferFee.isEnabled = customTransferFee.willBeEnabled
  }

  customTransferFee.willBeEnabled = event.params.enable
  customTransferFee.enableChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customTransferFee.save()
}
