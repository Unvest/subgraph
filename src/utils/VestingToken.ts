import { Address, ethereum } from '@graphprotocol/graph-ts'

import { UnderlyingToken, VestingToken } from '../../generated/schema'

import { ensureUnderlyingToken } from './UnderlyingToken'
import { ERC20Metadata } from '../../generated/VestingTokenFactoryV2/ERC20Metadata'

/**
 * Creates the deployed `VestingToken` entity with basic information:
 * - Underlying Asset
 * - Transaction related metadata
 * - Protocol version
 *
 * @returns Returns the underlying token
 */
export function createVestingToken(
  vestingTokenAddress: Address,
  underlyingTokenAddress: Address,
  event: ethereum.Event,
  version: string,
): UnderlyingToken {
  // Create the VestingToken entity
  let entity = new VestingToken(vestingTokenAddress.toHex())

  // Add the vesting token metadata
  const contract = ERC20Metadata.bind(vestingTokenAddress)
  entity.name = contract.name()
  entity.symbol = contract.symbol()
  entity.decimals = contract.decimals()
  entity.recipientsCount = 0
  entity.holdersCount = 0

  // Add the token to redeem (the unlock token)
  const underlyingToken = ensureUnderlyingToken(underlyingTokenAddress)
  entity.underlyingToken = underlyingToken.id

  // Add the transaction related metadata
  entity.deployer = event.transaction.from.toHex()
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // Add the protocol version
  entity.version = version

  // Save the VestingToken
  entity.save()

  return underlyingToken
}

export function getVestingToken(address: Address): VestingToken | null {
  let vestingToken = VestingToken.load(address.toHex())
  return vestingToken
}
