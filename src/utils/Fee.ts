import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { VestingTokenFactory } from '../../generated/schema'

export const ONE_HOUR = BigInt.fromI32(3600)

export function updateFactoryFeeCollector(factory: VestingTokenFactory, newFeeCollector: Address): void {
  factory.feeCollector = newFeeCollector

  factory.save()
}

export function updateFactoryGlobalCreationFee(
  factory: VestingTokenFactory,
  event: ethereum.Event,
  newGlobalCreationFee: BigInt,
): void {
  // Update the previous global creation fee is applicable.
  if (factory.nextGlobalCreationFeeTime <= event.block.timestamp) {
    factory.currentGlobalCreationFee = factory.nextGlobalCreationFee
  }

  factory.nextGlobalCreationFee = newGlobalCreationFee
  factory.nextGlobalCreationFeeTime = event.block.timestamp.plus(ONE_HOUR)

  factory.save()
}

export function updateFactoryGlobalTransferFee(
  factory: VestingTokenFactory,
  event: ethereum.Event,
  newGlobalTransferFee: BigInt,
): void {
  // Update the previous global transfer fee is applicable.
  if (factory.nextGlobalTransferFeeTime <= event.block.timestamp) {
    factory.currentGlobalTransferFee = factory.nextGlobalTransferFee
  }

  factory.nextGlobalTransferFee = newGlobalTransferFee
  factory.nextGlobalTransferFeeTime = event.block.timestamp.plus(ONE_HOUR)

  factory.save()
}

export function updateFactoryGlobalClaimFee(
  factory: VestingTokenFactory,
  event: ethereum.Event,
  newGlobalClaimFee: BigInt,
): void {
  // Update the previous global claim fee is applicable.
  if (factory.nextGlobalClaimFeeTime <= event.block.timestamp) {
    factory.currentGlobalClaimFee = factory.nextGlobalClaimFee
  }

  factory.nextGlobalClaimFee = newGlobalClaimFee
  factory.nextGlobalClaimFeeTime = event.block.timestamp.plus(ONE_HOUR)

  factory.save()
}
