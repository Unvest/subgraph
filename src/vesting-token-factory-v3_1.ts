import { VestingTokenV3 as NewVestingTokenV3 } from '../generated/templates'
import {
  OwnershipTransferred as OwnershipTransferredEvent,
  VestingTokenCreated as VestingTokenCreatedEvent,
  CustomPermFeeChange as CustomPermFeeChangeEvent,
} from '../generated/VestingTokenFactoryV3_1/VestingTokenFactoryV3_1'

import { createVestingToken } from './utils/VestingToken'
import { ensureVestingTokenFactory } from './utils/Factory'
import { ensureCustomCreationFee } from './utils/CustomCreationFee'
import { ensureCustomClaimFee } from './utils/CustomClaimFee'
import { ensureCustomTransferFee } from './utils/CustomTransferFee'

import {
  handleGlobalCreationFeeChange,
  handleCustomCreationFeeChange,
  handleCustomCreationFeeToggle,
  handleGlobalClaimFeeChange,
  handleCustomClaimFeeChange,
  handleCustomClaimFeeToggle,
  handleGlobalTransferFeeChange,
  handleCustomTransferFeeChange,
  handleCustomTransferFeeToggle,
  handleFeeCollectorChange,
} from './vesting-token-factory-v3'
import { ensureUnderlyingTokenPermanentFees, ensureVestingTokenPermanentFee } from './utils/PermanentFees_v3_1'
export {
  handleGlobalCreationFeeChange,
  handleCustomCreationFeeChange,
  handleCustomCreationFeeToggle,
  handleGlobalClaimFeeChange,
  handleCustomClaimFeeChange,
  handleCustomClaimFeeToggle,
  handleGlobalTransferFeeChange,
  handleCustomTransferFeeChange,
  handleCustomTransferFeeToggle,
  handleFeeCollectorChange,
}

export function handleVestingTokenV3_1Created(event: VestingTokenCreatedEvent): void {
  // Handle deployed `VestingToken`
  const underlyingToken = createVestingToken(event.params.vestingToken, event.params.underlyingToken, event, 'v3_1')

  // Initialize the custom fee as disabled initially (custom fees only applied to v3)
  ensureCustomCreationFee(underlyingToken, event)
  ensureCustomClaimFee(underlyingToken, event)
  ensureCustomTransferFee(underlyingToken, event)

  // Checks if the `VestingToken` has permanent fees.
  ensureVestingTokenPermanentFee(event.params.vestingToken, event.params.underlyingToken)

  // Listen for the new VestingToken events (version v3)
  NewVestingTokenV3.create(event.params.vestingToken)
}

// This is the first event that the Factory emits. Useful for instantiating the `VestingTokenFactory` as entity.
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  ensureVestingTokenFactory(event, 'v3_1')
}

export function handleCustomPermanentFeeChange(event: CustomPermFeeChangeEvent): void {
  ensureUnderlyingTokenPermanentFees(event)
}
