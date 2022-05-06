import hre, { ethers } from 'hardhat';
import 'dotenv/config'


async function main() {
    const [deployer] = await ethers.getSigners();

    // Deploy TheDragonPresale
    const TheDragonPresale = await hre.ethers.getContractFactory('TheDragonPresale');
    // Change to the real TheDragon address when deploying to mainnet
    const theDragonPresale = await TheDragonPresale.deploy(1500, process.env.THE_DRAGON_ADDRESS as string);
    await theDragonPresale.deployed();

    // transfer tokens from the deployer to TheDragon Presale
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(theDragonPresale.address, (await theDragon.totalSupply()).div(100).mul(3));

    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('The Dragon presale deployed to the address:', theDragonPresale.address);
    console.log("Deploying contracts by the account:", deployer.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


