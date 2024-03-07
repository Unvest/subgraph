import { Address, ethereum } from '@graphprotocol/graph-ts'

import { VestingToken } from '../../generated/schema'

import { ensureRedeemToken } from './ReedemToken'
import { ERC20Metadata } from '../../generated/VestingTokenFactoryV2/ERC20Metadata'

/**
 * Creates the deployed `VestingToken` entity with basic information:
 * - Underlying Asset
 * - Transaction related metadata
 * - Protocol version
 */
export function createVestingToken(
  vestingToken: Address,
  underlyingToken: Address,
  event: ethereum.Event,
  version: string,
): VestingToken {
  // Create the VestingToken entity
  let entity = new VestingToken(vestingToken.toHex())

  // Add the vesting token metadata
  const contract = ERC20Metadata.bind(vestingToken)
  entity.name = contract.name()
  entity.symbol = contract.symbol()
  entity.decimals = contract.decimals()
  entity.recipientsCount = 0
  entity.holdersCount = 0

  // Add the token to redeem (the unlock token)
  const redeemToken = ensureRedeemToken(underlyingToken)
  entity.redeemToken = redeemToken.id

  // Add the transaction related metadata
  entity.deployer = event.transaction.from.toHex()
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // Add the protocol version
  entity.version = version

  // Save the VestingToken
  entity.save()

  return entity
}

export function getVestingToken(address: Address): VestingToken | null {
  let vestingToken = VestingToken.load(address.toHex())
  return vestingToken
}
