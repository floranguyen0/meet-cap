import hre, { ethers } from 'hardhat';


// scripts/transfer-ownership.js
async function main() {
    const gnosisSafe = process.env.SAFE_ADDRESS as string;
    const [owner] = await ethers.getSigners();
    const theDragon = await hre.ethers.getContractAt('Meetcap', process.env.MEETCAP_ADDRESS as string, owner)

    // The owner of the ProxyAdmin can upgrade Meetcap contracts
    await theDragon.transferOwnership(gnosisSafe);
    console.log('Transferred ownership of ProxyAdmin to:', gnosisSafe);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });