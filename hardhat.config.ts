import { task } from 'hardhat/config';
import 'dotenv/config'
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter"
import '@openzeppelin/hardhat-upgrades'

// The configuration file is always executed on startup,
// before anything else happens

// This is a sample Hardhat task.
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


// You need to export an object to set up config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// Using hardhat network only for testing,
// change to matic_testnet when deploying.
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.2",
    settings: {
      evmVersion: "constantinople",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false
  },
  etherscan: {
    apiKey:
      process.env.POLYGONSCAN_API_KEY
    // process.env.BSC_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      network: {
        accounts: {
        }
      }
    },
    matic_testnet: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      chainId: 80001,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000
      // live: true,
    },
    matic_mainnet: {
      url: 'https://polygon-rpc.com/',
      chainId: 137,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      // live: true,
    },
    bsc_testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      // live: true,
    },
    bsc_devnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      // live: true,
      tags: ['devnet'],
      chainId: 97,
    },
    bsc_mainnet: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      // live: true,
    },
    goerli: {
      url: 'https://rpc.slock.it/goerli',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 5,
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 4,
    },
  },

};
