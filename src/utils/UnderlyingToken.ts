import { Address } from '@graphprotocol/graph-ts'

import { UnderlyingToken } from '../../generated/schema'
import { ERC20Metadata } from '../../generated/VestingTokenFactoryV2/ERC20Metadata'
import { ERC20BytesMetadata } from '../../generated/VestingTokenFactoryV2/ERC20BytesMetadata'

export function ensureUnderlyingToken(address: Address): UnderlyingToken {
  let underlyingToken = UnderlyingToken.load(address.toHex())

  if (underlyingToken) {
    return underlyingToken
  }

  const erc20 = ERC20Metadata.bind(address)

  underlyingToken = new UnderlyingToken(address.toHex())

  // Name
  const erc20NameCall = erc20.try_name()
  if (erc20NameCall.reverted) {
    const erc20Bytes = ERC20BytesMetadata.bind(address)
    underlyingToken.name = erc20Bytes.name().toString()
  } else {
    underlyingToken.name = erc20NameCall.value
  }

  // Symbol
  const erc20SymbolCall = erc20.try_symbol()
  if (erc20SymbolCall.reverted) {
    const erc20Bytes = ERC20BytesMetadata.bind(address)
    underlyingToken.symbol = erc20Bytes.symbol().toString()
  } else {
    underlyingToken.symbol = erc20SymbolCall.value
  }

  underlyingToken.decimals = erc20.decimals()
  underlyingToken.save()

  return underlyingToken
}
