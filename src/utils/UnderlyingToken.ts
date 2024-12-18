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
    const erc20BytesNameCall = ERC20BytesMetadata.bind(address).try_name()
    underlyingToken.name = erc20BytesNameCall.reverted ? "Undetected ERC20 Name" : erc20BytesNameCall.value.toString()
  } else {
    underlyingToken.name = erc20NameCall.value
  }

  // Symbol
  const erc20SymbolCall = erc20.try_symbol()
  if (erc20SymbolCall.reverted) {
    const erc20BytesSymbolCall = ERC20BytesMetadata.bind(address).try_symbol()
    underlyingToken.symbol = erc20BytesSymbolCall.reverted ? "Undetected ERC20 Symbol" : erc20BytesSymbolCall.value.toString()
  } else {
    underlyingToken.symbol = erc20SymbolCall.value
  }

  // Decimals
  const erc20DecimalsCall = erc20.try_decimals()
  underlyingToken.decimals = erc20DecimalsCall.reverted ? 18 : erc20DecimalsCall.value

  underlyingToken.save()

  return underlyingToken
}
