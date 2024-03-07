import { Address } from '@graphprotocol/graph-ts'

import { RedeemToken } from '../../generated/schema'
import { ERC20Metadata } from '../../generated/VestingTokenFactoryV2/ERC20Metadata'

export function ensureRedeemToken(address: Address): RedeemToken {
  let redeemToken = RedeemToken.load(address.toHex())
  if (redeemToken) {
    return redeemToken
  }

  const erc20 = ERC20Metadata.bind(address)

  redeemToken = new RedeemToken(address.toHex())
  redeemToken.name = erc20.name()
  redeemToken.symbol = erc20.symbol()
  redeemToken.decimals = erc20.decimals()
  redeemToken.save()

  return redeemToken
}
