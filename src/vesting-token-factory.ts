import { VestingToken } from "../generated/schema";
import { VestingToken as NewLiquidVestingToken } from "../generated/templates";
import { VestingToken as VestingTokenContract } from "../generated/templates/VestingToken/VestingToken";
import { VestingTokenCreated as VestingTokenCreatedEvent } from "../generated/VestingTokenFactory/VestingTokenFactory";

import { ensureRedeemToken } from "./utils/ReedemToken";

export function handleVestingTokenCreated(
  event: VestingTokenCreatedEvent
): void {
  // Create the VestingToken entity
  const entity = new VestingToken(event.params.vestingToken.toHex());

  // Add the vesting token metadata
  const vestingToken = VestingTokenContract.bind(event.params.vestingToken);
  entity.name = vestingToken.name();
  entity.symbol = vestingToken.symbol();
  entity.decimals = vestingToken.decimals();
  entity.recipientsCount = 0;
  entity.holdersCount = 0;

  // Add the token to redeem (the unlock token)
  const redeemToken = ensureRedeemToken(event.params.underlyingToken);
  entity.redeemToken = redeemToken.id;

  // Add the transaction related metadata
  entity.deployer = event.transaction.from.toHex();
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  // Save the VestingToken
  entity.save();

  // Listen for the new LiquidVestingToken events
  NewLiquidVestingToken.create(event.params.vestingToken);
}
