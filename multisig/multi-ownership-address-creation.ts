import 'dotenv/config';
import { SafeFactory } from '@gnosis.pm/safe-core-sdk';
import { ethers, Signer } from 'ethers';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';

import { Network } from "@ethersproject/networks";


export const matic_testnet: Network = {
    name: 'matic_testnet',
    chainId: 80001,
    _defaultProvider: (providers) => new providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/')
}

const provider = ethers.getDefaultProvider(matic_testnet);
const admin_1 = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN_ACCOUNT_1 as string);
const admin_1_signer = admin_1.connect(provider);

// Creating adapters
const ethAdapter_admin_1 = new EthersAdapter({ ethers, signer: admin_1_signer });

async function main() {
    // Creating contractNetworks
    const chainId = await ethAdapter_admin_1.getChainId();
    const contractNetworks = {
        [chainId]: {
            multiSendAddress: process.env.MULTI_SEND_ADDRESS as string,
            safeMasterCopyAddress: process.env.GNOSIS_SAFE_ADDRESS as string,
            safeProxyFactoryAddress: process.env.GNOSIS_SAFE_PROXY_FACTORY_ADDRESS as string
        }
    }

    // Creating a safe factory
    const safeFactory = await SafeFactory.create({
        ethAdapter: ethAdapter_admin_1,
        contractNetworks: contractNetworks
    });
    const safeAccountConfig = {
        owners: [
            process.env.ADMIN_ACCOUNT_1 as string,
            process.env.ADMIN_ACCOUNT_2 as string,
            process.env.ADMIN_ACCOUNT_3 as string,
            process.env.ADMIN_ACCOUNT_4 as string,
            process.env.ADMIN_ACCOUNT_5 as string],
        threshold: 3
    };

    // Deploying a safe
    const safe = await safeFactory.deploySafe({ safeAccountConfig });

    // Getting the address of the safe
    const safe_address = safe.getAddress();
    console.log(safe_address);
}

main();
