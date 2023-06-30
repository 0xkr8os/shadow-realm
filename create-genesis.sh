#!/bin/bash

./prysmctl \
  testnet \
  generate-genesis \
  --fork=capella \
  --num-validators=64 \
  --output-ssz=./devnet_genesis.ssz \
  --chain-config-file=./shadow_realm/consensus/config.yml \
  --geth-genesis-json-in=./seed_genesis.json \
  --geth-genesis-json-out=./shadow_realm/execution/genesis.json 
