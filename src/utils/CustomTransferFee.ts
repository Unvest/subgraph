import { BigInt, Value, ethereum } from '@graphprotocol/graph-ts'

import { VestingToken, VestingTokenCustomTransferFee } from '../../generated/schema'
import {
  CustomTransferFeeChange as CustomTransferFeeChangeEvent,
  CustomTransferFeeToggle as CustomTransferFeeToggleEvent,
} from '../../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

import { ONE_HOUR } from './Fee'

/**
 * Instantiates the `VestingTokenCustomTransferFee` in a disabled custom fee state.
 */
export function ensureCustomTransferFee(
  vestingToken: VestingToken,
  event: ethereum.Event,
): VestingTokenCustomTransferFee {
  const customTransferFeeId = Value.fromString(vestingToken.id).toBytes()
  let customTransferFee = VestingTokenCustomTransferFee.load(customTransferFeeId)

  if (!customTransferFee) {
    customTransferFee = new VestingTokenCustomTransferFee(customTransferFeeId)
    customTransferFee.isEnabled = false
    customTransferFee.currentCustomValue = BigInt.zero()
    customTransferFee.nextCustomValue = BigInt.zero()
    customTransferFee.nextChangeAt = BigInt.zero()
    customTransferFee.willBeEnabled = false
    customTransferFee.enableChangeAt = BigInt.zero()

    customTransferFee.vestingToken = vestingToken.id

    customTransferFee.updatedAt = event.block.timestamp
  }

  return customTransferFee
}

export function updateVestingTokenCustomTransferFeeValue(
  vestingToken: VestingToken,
  event: CustomTransferFeeChangeEvent,
): void {
  let customTransferFee = ensureCustomTransferFee(vestingToken, event)

  // Update the previous custom transfer fee is applicable.
  if (customTransferFee.nextChangeAt <= event.block.timestamp) {
    customTransferFee.currentCustomValue = customTransferFee.nextChangeAt
  }

  customTransferFee.nextCustomValue = event.params.transferFeePercentage
  customTransferFee.nextChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customTransferFee.save()
}

export function updateVestingTokenCustomTransferFeeToggle(
  vestingToken: VestingToken,
  event: CustomTransferFeeToggleEvent,
): void {
  let customTransferFee = ensureCustomTransferFee(vestingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customTransferFee.enableChangeAt <= event.block.timestamp) {
    customTransferFee.isEnabled = customTransferFee.willBeEnabled
  }

  customTransferFee.willBeEnabled = event.params.enable
  customTransferFee.enableChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customTransferFee.save()
}
