import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'

import { VestingTokenFactory } from '../../generated/schema'
import { VestingTokenFactoryV2 } from '../../generated/VestingTokenFactoryV2/VestingTokenFactoryV2'
import { VestingTokenFactoryV3 } from '../../generated/VestingTokenFactoryV3/VestingTokenFactoryV3'

export function ensureVestingTokenFactory(event: ethereum.Event, version: string): VestingTokenFactory {
  const factoryId = event.address.toHex()

  let factory = VestingTokenFactory.load(factoryId)

  if (factory) {
    return factory
  }

  factory = new VestingTokenFactory(factoryId)

  if (version === 'v3' || version === 'v3_1') {
    const contractV3 = VestingTokenFactoryV3.bind(event.address)

    const creationFeeData = contractV3.creationFeeData(Address.zero())

    // Fee collector
    factory.feeCollector = creationFeeData.getFeeCollectorAddress()

    // Creation Fee
    factory.currentGlobalCreationFee = creationFeeData.getCreationFeeValue()
    factory.nextGlobalCreationFee = creationFeeData.getCreationFeeValue()
    factory.nextGlobalCreationFeeTime = event.block.number

    // Transfer Fee
    const transferFeeData = contractV3.transferFeeData(Address.zero())
    factory.currentGlobalTransferFee = transferFeeData.getTransferFeePercentage()
    factory.nextGlobalTransferFee = transferFeeData.getTransferFeePercentage()
    factory.nextGlobalTransferFeeTime = event.block.number

    // Claim Fee
    const claimFeeData = contractV3.claimFeeData(Address.zero())
    factory.currentGlobalClaimFee = claimFeeData.getClaimFeeValue()
    factory.nextGlobalClaimFee = claimFeeData.getClaimFeeValue()
    factory.nextGlobalClaimFeeTime = event.block.number
  } else if (version === 'v2') {
    const contractV2 = VestingTokenFactoryV2.bind(event.address)

    const feeData = contractV2.feeData()

    // Fee collector
    factory.feeCollector = feeData.feeCollector

    // Creation Fee
    factory.currentGlobalCreationFee = BigInt.zero()
    factory.nextGlobalCreationFee = BigInt.zero()
    factory.nextGlobalCreationFeeTime = event.block.number

    // Transfer Fee
    factory.currentGlobalTransferFee = feeData.feePercentage
    factory.nextGlobalTransferFee = feeData.feePercentage
    factory.nextGlobalTransferFeeTime = event.block.number

    // Claim Fee
    factory.currentGlobalClaimFee = BigInt.zero()
    factory.nextGlobalClaimFee = BigInt.zero()
    factory.nextGlobalClaimFeeTime = event.block.number
  } else {
    log.critical('Unknown `VestingTokenFactory` version {}!', [version])
  }

  // Tx info
  factory.blockNumber = event.block.number
  factory.blockTimestamp = event.block.timestamp
  factory.transactionHash = event.transaction.hash

  // Misc
  factory.version = version

  factory.save()

  return factory
}

export function getVestingTokenFactory(address: Address): VestingTokenFactory | null {
  let vestingTokenFactory = VestingTokenFactory.load(address.toHex())
  return vestingTokenFactory
}
