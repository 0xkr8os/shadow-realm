import fetch from 'node-fetch';
import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import {ssz} from "@lodestar/types";
import {readFile, writeFileSync} from 'node:fs';

const BEACON_NODE_BASE_API = "https://eth2-beacon-mainnet.nodereal.io/v1/b21dd73208fe49f0b193f2c26a91bc54"

const fetchBeaconStateData = async (stateRoot) => {
  const url = `${BEACON_NODE_BASE_API}/eth/v2/debug/beacon/states/${stateRoot}`;
  const response = await fetch(url, {
    headers: {'Accept': 'application/octet-stream'}
  })
  
  return response.body;
}

const fetchBeaconBlockData = async (blockRoot) => {
  const response = await fetch(`${BEACON_NODE_BASE_API}/eth/v2/beacon/blocks/${blockRoot}`, {
    headers: {'Accept': 'application/octet-stream'}
  })
  return response.body;
}

const fetchBlockHeader = async (block_id) => {
  const response = await fetch(`${BEACON_NODE_BASE_API}/eth/v1/beacon/headers/${block_id}`)
  return await response.json();
}

const fetchBeaconStates = async (slot) => {
  console.log("Fetching beacon state data...");

  const devnetGenesisState = await deserialize_CappellaStateSSZFile('./tmp/devnet_genesis.ssz');
  const snapshotState = await deserialize_CappellaStateSSZFile('./tmp/snapshot_state.ssz');


  const genesisState = mergeBeaconStates(devnetGenesisState, snapshotState);
  console.log(genesisState)

  const serializedGenesisState = ssz.capella.BeaconState.serialize(genesisState);
  writeFileSync('./shadow_realm/consensus/genesis.ssz', Buffer.from(serializedGenesisState))
}

fetchBeaconStates(process.argv[2]);

const mergeBeaconStates = (devnetGenesisState, snapshotState) => {
  const genesisState = {}
  Object.assign(genesisState, devnetGenesisState);

  const snapshotForkVersionHex = '20000092';
  const forkVersion = Uint8Array.from(Buffer.from(snapshotForkVersionHex, 'hex'));

  genesisState.fork.currentVersion = forkVersion
  genesisState.fork.previousVersion = forkVersion

  genesisState.blockRoots = snapshotState.blockRoots;
  genesisState.stateRoots = snapshotState.stateRoots;
  genesisState.historicalRoots = snapshotState.historicalRoots;
  
  return genesisState;
}

const deserialize_Phase0StateSSZFile = (path) => {
  return new Promise((resolve, reject) => {
    readFile(path, null, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      const ssz_b = data.buffer;
      const beaconState = ssz.phase0.BeaconState.deserialize(new Uint8Array(ssz_b));
      ssz.phase0.BeaconState.
      return resolve(beaconState);
    })
  })
}

const deserialize_CappellaStateSSZFile = (path) => {
  return new Promise((resolve, reject) => {
    readFile(path, null, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      const ssz_b = data.buffer;
      const beaconState = ssz.capella.BeaconState.deserialize(new Uint8Array(ssz_b));
      resolve(beaconState);
    })
  })
}
