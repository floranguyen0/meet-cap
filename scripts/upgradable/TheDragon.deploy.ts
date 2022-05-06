import hre, { ethers, upgrades, } from 'hardhat';


async function main() {
    const [deployer] = await ethers.getSigners();
    // Deploy TheDragon
    const TheDragon = await hre.ethers.getContractFactory('TheDragon');
    const theDragon = await upgrades.deployProxy(TheDragon, [], { initializer: "initialize" });

    await theDragon.deployed();

    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('TheDragon tokens deployed to the address:', theDragon.address);
    console.log("Deploying contracts by the account:", deployer.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


