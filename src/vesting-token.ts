import { Burn, Claim, Milestone, Transfer, VestingToken } from '../generated/schema'
import {
  Burn as BurnEvent,
  Claim as ClaimEvent,
  Initialized as InitializedEvent,
  Transfer as TransferEvent,
  VestingTokenV3 as VestingTokenContract,
} from '../generated/templates/VestingTokenV3/VestingTokenV3'

import { updateHolderBalance } from './utils/HolderBalance'
import { getVestingBalance, updateVestingBalance } from './utils/VestingBalance'
import { ensureDistributionBatch } from './utils/DistributionBatch'
import { isMintLVT, isRedeemLVT, isTransferLVT } from './utils/Transfer'
import { log } from '@graphprotocol/graph-ts'

export function handleInitialized(event: InitializedEvent): void {
  // Create Milestones
  const vestingToken = VestingTokenContract.bind(event.address)
  const milestonesCall = vestingToken.try_milestones()
  if (!milestonesCall.reverted && milestonesCall.value) {
    for (let i: i32 = 0; i < milestonesCall.value.length; i++) {
      const milestoneEntity = new Milestone(`${event.address.toHex()}/milestones/${i}`)
      milestoneEntity.vestingToken = event.address.toHex()
      milestoneEntity.ramp = milestonesCall.value[i].ramp
      milestoneEntity.percentage = milestonesCall.value[i].percentage
      milestoneEntity.timestamp = milestonesCall.value[i].timestamp
      milestoneEntity.save()
    }
  }
}

export function handleClaim(event: ClaimEvent): void {
  const entity = new Claim(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.claimer = event.params.account
  entity.amount = event.params.amount

  entity.vestingToken = event.address.toHex()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBurn(event: BurnEvent): void {
  // 1. Create the Burn event
  const entity = new Burn(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.burner = event.params.account
  entity.amount = event.params.amount

  entity.vestingToken = event.address.toHex()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // 2. Update the holder balance
  const holderBalance = updateHolderBalance(event.params.account, event.address, event.block.timestamp, false)

  // 3. Subtract to the holder allocation
  holderBalance.allocation = holderBalance.allocation.minus(event.params.amount)
  holderBalance.save()

  // 4. Subtract to the vesting allocation
  let vestingBalance = getVestingBalance(event.address)
  if (vestingBalance) {
    vestingBalance.allocation = vestingBalance.allocation.minus(event.params.amount)
    vestingBalance.save()
  } else {
    log.warning('Vesting Balance not found after burning: {}', [event.address.toString()])
  }
}

export function handleTransfer(event: TransferEvent): void {
  const entity = new Transfer(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.vestingToken = event.address.toHex()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Updates the vesting balance for every transfer (mint, redeem, or transfer between users)
  const vestingBalance = updateVestingBalance(
    event.address,
    event.block.timestamp,
    isRedeemLVT(event.params.from, event.params.to),
  )

  // User is redeeming LVT
  if (isRedeemLVT(event.params.from, event.params.to)) {
    /// @dev The RedeemEvent will contain this info aswell
    updateHolderBalance(event.params.from, event.address, event.block.timestamp, true)
  }

  // Contract is minting new LVTs to a user
  if (isMintLVT(event.params.from, event.params.to)) {
    const holderBalance = updateHolderBalance(event.params.to, event.address, event.block.timestamp, false)
    // Minting LVTs makes the user a recipient
    if (!holderBalance.isRecipient) {
      // holder is new recipient
      holderBalance.isRecipient = true
      // Increment recipients count
      const vestingEntity = VestingToken.load(event.address.toHex())
      if (vestingEntity) {
        vestingEntity.recipientsCount += 1
        vestingEntity.save()
      }
    }
    holderBalance.allocation = holderBalance.allocation.plus(event.params.value)
    holderBalance.save()
    // Increment the Vesting total allocation
    vestingBalance.allocation = vestingBalance.allocation.plus(event.params.value)
    vestingBalance.save()

    // Add the `DistributionBatch` to the `Transfer` entity
    const distributionBatch = ensureDistributionBatch(event)
    entity.distributionBatch = distributionBatch.id
    entity.save()
  }

  // User is transferring LVT to another user
  if (isTransferLVT(event.params.from, event.params.to)) {
    const fromUserBalance = updateHolderBalance(event.params.from, event.address, event.block.timestamp, false)
    fromUserBalance.transferredOut = fromUserBalance.transferredOut.plus(event.params.value)
    fromUserBalance.save()
    const toUserBalance = updateHolderBalance(event.params.to, event.address, event.block.timestamp, false)
    toUserBalance.transferredIn = toUserBalance.transferredIn.plus(event.params.value)
    toUserBalance.save()
  }
}
