import { BigInt, dataSource } from '@graphprotocol/graph-ts'
import { VestingTokenV2 as NewVestingTokenV2 } from '../generated/templates'
import {
  VestingTokenCreated as VestingTokenV2CreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  FeeCollectorChange as FeeCollectorChangeEvent,
  FeePercentageChange as FeePercentageChangeEvent,
} from '../generated/VestingTokenFactoryV2/VestingTokenFactoryV2'
import { ensureVestingTokenFactory } from './utils/Factory'
import { createVestingToken } from './utils/VestingToken'

// This is the first event that the Factory emits. Useful for instantiating the `VestingTokenFactory` as entity.
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  // Ignored in sepolia (no v2 factory deployed there)
  if (dataSource.network().toLowerCase() !== 'sepolia') {
    ensureVestingTokenFactory(event, 'v2')
  }
}

export function handleVestingTokenV2Created(event: VestingTokenV2CreatedEvent): void {
  // Ignored in sepolia (no v2 factory deployed there)
  if (dataSource.network().toLowerCase() !== 'sepolia') {
    // Handle deployed `VestingToken`
    createVestingToken(event.params.vestingToken, event.params.underlyingToken, event, 'v2')

    // Listen for the new VestingToken events (version v2)
    NewVestingTokenV2.create(event.params.vestingToken)
  }
}

export function handleFeeCollectorChange(event: FeeCollectorChangeEvent): void {
  let factory = ensureVestingTokenFactory(event, 'v2')
  factory.feeCollector = event.params.feeCollector
  factory.save()
}

export function handleFeePercentageChange(event: FeePercentageChangeEvent): void {
  let factory = ensureVestingTokenFactory(event, 'v2')

  // Update the previous global transfer fee is applicable.
  if (factory.nextGlobalTransferFeeTime <= event.block.timestamp) {
    factory.currentGlobalTransferFee = factory.nextGlobalTransferFee
  }

  factory.nextGlobalTransferFee = event.params.feePercentage
  factory.nextGlobalTransferFeeTime = event.block.timestamp.plus(BigInt.fromI32(3600))

  factory.save()
}
