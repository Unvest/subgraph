import { Address } from '@graphprotocol/graph-ts'

export function isMintLVT(from: Address, to: Address): boolean {
  return from.equals(Address.zero()) && to.notEqual(Address.zero())
}
export function isRedeemLVT(from: Address, to: Address): boolean {
  return from.notEqual(Address.zero()) && to.equals(Address.zero())
}
export function isTransferLVT(from: Address, to: Address): boolean {
  return from.notEqual(Address.zero()) && to.notEqual(Address.zero())
}
