import { Address } from '@graphprotocol/graph-ts'

import { UnderlyingToken } from '../../generated/schema'
import { ERC20Metadata } from '../../generated/VestingTokenFactoryV2/ERC20Metadata'

export function ensureUnderlyingToken(address: Address): UnderlyingToken {
  let underlyingToken = UnderlyingToken.load(address.toHex())

  if (underlyingToken) {
    return underlyingToken
  }

  const erc20 = ERC20Metadata.bind(address)

  underlyingToken = new UnderlyingToken(address.toHex())
  underlyingToken.name = erc20.name()
  underlyingToken.symbol = erc20.symbol()
  underlyingToken.decimals = erc20.decimals()
  underlyingToken.save()

  return underlyingToken
}
