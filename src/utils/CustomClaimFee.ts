import { BigInt, Value, ethereum } from '@graphprotocol/graph-ts'

import { VestingToken, VestingTokenCustomClaimFee } from '../../generated/schema'
import {
  CustomClaimFeeChange as CustomClaimFeeChangeEvent,
  CustomClaimFeeToggle as CustomClaimFeeToggleEvent,
} from '../../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

import { ONE_HOUR } from './Fee'

/**
 * Instantiates the `VestingTokenCustomClaimFee` in a disabled custom fee state.
 */
export function ensureCustomClaimFee(vestingToken: VestingToken, event: ethereum.Event): VestingTokenCustomClaimFee {
  const customClaimFeeId = Value.fromString(vestingToken.id).toBytes()
  let customClaimFee = VestingTokenCustomClaimFee.load(customClaimFeeId)

  if (!customClaimFee) {
    customClaimFee = new VestingTokenCustomClaimFee(customClaimFeeId)
    customClaimFee.isEnabled = false
    customClaimFee.currentCustomValue = BigInt.zero()
    customClaimFee.nextCustomValue = BigInt.zero()
    customClaimFee.nextChangeAt = BigInt.zero()
    customClaimFee.willBeEnabled = false
    customClaimFee.enableChangeAt = BigInt.zero()

    customClaimFee.vestingToken = vestingToken.id

    customClaimFee.updatedAt = event.block.timestamp
  }

  return customClaimFee
}

export function updateVestingTokenCustomClaimFeeValue(
  vestingToken: VestingToken,
  event: CustomClaimFeeChangeEvent,
): void {
  let customClaimFee = ensureCustomClaimFee(vestingToken, event)

  // Update the previous custom transfer fee is applicable.
  if (customClaimFee.nextChangeAt <= event.block.timestamp) {
    customClaimFee.currentCustomValue = customClaimFee.nextChangeAt
  }

  customClaimFee.nextCustomValue = event.params.claimFeeValue
  customClaimFee.nextChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customClaimFee.save()
}

export function updateVestingTokenCustomClaimFeeToggle(
  vestingToken: VestingToken,
  event: CustomClaimFeeToggleEvent,
): void {
  let customClaimFee = ensureCustomClaimFee(vestingToken, event)

  // Update the previous custom transfer fee enabled state is applicable.
  if (customClaimFee.enableChangeAt <= event.block.timestamp) {
    customClaimFee.isEnabled = customClaimFee.willBeEnabled
  }

  customClaimFee.willBeEnabled = event.params.enable
  customClaimFee.enableChangeAt = event.block.timestamp.plus(ONE_HOUR)

  customClaimFee.save()
}
