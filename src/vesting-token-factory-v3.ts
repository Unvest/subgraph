import { VestingTokenV3 as NewVestingTokenV3 } from '../generated/templates'
import {
  CustomClaimFeeChange as CustomClaimFeeChangeEvent,
  CustomClaimFeeToggle as CustomClaimFeeToggleEvent,
  CustomCreationFeeChange as CustomCreationFeeChangeEvent,
  CustomCreationFeeToggle as CustomCreationFeeToggleEvent,
  CustomTransferFeeChange as CustomTransferFeeChangeEvent,
  CustomTransferFeeToggle as CustomTransferFeeToggleEvent,
  FeeCollectorChange as FeeCollectorChangeEvent,
  GlobalClaimFeeChange as GlobalClaimFeeChangeEvent,
  GlobalCreationFeeChange as GlobalCreationFeeChangeEvent,
  GlobalTransferFeeChange as GlobalTransferFeeChangeEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  VestingTokenCreated as VestingTokenCreatedEvent,
} from '../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

import { createVestingToken } from './utils/VestingToken'
import { ensureVestingTokenFactory, getVestingTokenFactory } from './utils/Factory'
import {
  ensureCustomCreationFee,
  updateVestingTokenCustomCreationFeeToggle,
  updateVestingTokenCustomCreationFeeValue,
} from './utils/CustomCreationFee'
import {
  ensureCustomClaimFee,
  updateVestingTokenCustomClaimFeeToggle,
  updateVestingTokenCustomClaimFeeValue,
} from './utils/CustomClaimFee'
import {
  ensureCustomTransferFee,
  updateVestingTokenCustomTransferFeeToggle,
  updateVestingTokenCustomTransferFeeValue,
} from './utils/CustomTransferFee'
import { ensureUnderlyingToken } from './utils/UnderlyingToken'
import {
  updateFactoryFeeCollector,
  updateFactoryGlobalClaimFee,
  updateFactoryGlobalCreationFee,
  updateFactoryGlobalTransferFee,
} from './utils/Fee'

export function handleVestingTokenV3Created(event: VestingTokenCreatedEvent): void {
  // Handle deployed `VestingToken`
  const underlyingToken = createVestingToken(event.params.vestingToken, event.params.underlyingToken, event, 'v3')

  // Initialize the custom fee as disabled initially (custom fees only applied to v3)
  ensureCustomCreationFee(underlyingToken, event)
  ensureCustomClaimFee(underlyingToken, event)
  ensureCustomTransferFee(underlyingToken, event)

  // Listen for the new VestingToken events (version v3)
  NewVestingTokenV3.create(event.params.vestingToken)
}

export function handleGlobalCreationFeeChange(event: GlobalCreationFeeChangeEvent): void {
  let factory = getVestingTokenFactory(event.address)
  if (factory) {
    updateFactoryGlobalCreationFee(factory, event, event.params.creationFeeValue)
  }
}

export function handleCustomCreationFeeChange(event: CustomCreationFeeChangeEvent): void {
  let vestingToken = ensureUnderlyingToken(event.params.underlyingToken)
  if (vestingToken) {
    updateVestingTokenCustomCreationFeeValue(vestingToken, event)
  }
}

export function handleCustomCreationFeeToggle(event: CustomCreationFeeToggleEvent): void {
  let underlyingToken = ensureUnderlyingToken(event.params.underlyingToken)
  if (underlyingToken) {
    updateVestingTokenCustomCreationFeeToggle(underlyingToken, event)
  }
}

export function handleGlobalClaimFeeChange(event: GlobalClaimFeeChangeEvent): void {
  let factory = getVestingTokenFactory(event.address)
  if (factory) {
    updateFactoryGlobalClaimFee(factory, event, event.params.claimFeeValue)
  }
}

export function handleCustomClaimFeeChange(event: CustomClaimFeeChangeEvent): void {
  let vestingToken = ensureUnderlyingToken(event.params.underlyingToken)
  if (vestingToken) {
    updateVestingTokenCustomClaimFeeValue(vestingToken, event)
  }
}

export function handleCustomClaimFeeToggle(event: CustomClaimFeeToggleEvent): void {
  let underlyingToken = ensureUnderlyingToken(event.params.underlyingToken)
  if (underlyingToken) {
    updateVestingTokenCustomClaimFeeToggle(underlyingToken, event)
  }
}

export function handleGlobalTransferFeeChange(event: GlobalTransferFeeChangeEvent): void {
  let factory = getVestingTokenFactory(event.address)
  if (factory) {
    updateFactoryGlobalTransferFee(factory, event, event.params.transferFeePercentage)
  }
}

export function handleCustomTransferFeeChange(event: CustomTransferFeeChangeEvent): void {
  let underlyingToken = ensureUnderlyingToken(event.params.underlyingToken)
  if (underlyingToken) {
    updateVestingTokenCustomTransferFeeValue(underlyingToken, event)
  }
}

export function handleCustomTransferFeeToggle(event: CustomTransferFeeToggleEvent): void {
  let underlyingToken = ensureUnderlyingToken(event.params.underlyingToken)
  if (underlyingToken) {
    updateVestingTokenCustomTransferFeeToggle(underlyingToken, event)
  }
}

export function handleFeeCollectorChange(event: FeeCollectorChangeEvent): void {
  let factory = getVestingTokenFactory(event.address)
  if (factory) {
    updateFactoryFeeCollector(factory, event.params.feeCollector)
  }
}

// This is the first event that the Factory emits. Useful for instantiating the `VestingTokenFactory` as entity.
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  ensureVestingTokenFactory(event, 'v3')
}
