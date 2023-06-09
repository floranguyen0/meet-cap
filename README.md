> **All contracts were deployed and verified on Polygon Testnet for a demonstration purpose, please only use test MATIC to interact with them, [get test MATIC here](https://faucet.polygon.technology/).  <br />
> To interact with smart contracts  in this repo, add and switch to the Polygon Testnet network, [here is a guide to connect Polygon Testnet to Metamask](https://medium.com/stakingbits/how-to-connect-polygon-mumbai-testnet-to-metamask-fc3487a3871f).**
***

_Draft white paper (to be updated): https://flora.gitbook.io/meetcap-whitepaper-/_

# Meetcap smart contract <br />
Meetcap is a standard upgradable burnable ERC20 token, with the owner is a 3-of-5 multisig wallet (it requires 3 out of 5 existing private keys to authorize transactions.) <br />

**Name:** Meetcap <br />
**Symbol:** MCAP <br />
**Network:** Polygon <br />
**Max supply:** 10.000.000.000 (10B) <br />
**Initial circulating supply:** 300.000.000 (300M) - 3% of the max supply. <br />  
Proxy contract address: [0x258cb74F12F0e46A8bF6842ea7a945739A362053](https://mumbai.polygonscan.com/address/0x258cb74f12f0e46a8bf6842ea7a945739a362053) <br />
Implementation contract address: [0x4F8209705441182f38120374CeF15770Ff3c99bD](0x4F8209705441182f38120374CeF15770Ff3c99bD) <br />
Owner (multisig addresses): [0x589a4eAadc2604F0D6449Efd237764408C038C87](https://mumbai.polygonscan.com/address/0x589a4eAadc2604F0D6449Efd237764408C038C87) <br />

The token contract owner was tranferred to multisig addresses from the original deployer, see transanction info at Transaction Hash: [0x9a8756a52d6b0163170ba59a95aa0b2b7b4fd836126568dac01449bfdb6b0ed1](https://mumbai.polygonscan.com/tx/0x9a8756a52d6b0163170ba59a95aa0b2b7b4fd836126568dac01449bfdb6b0ed1) <br /> 

# TokenVestingSchedule smart contract <br />
TokenVestingSchedule is a contract that holds the logic of the timelock and vesting schedules of major MCAP token holders. <br /> 
**Note:** If a token holder did not release MCAP tokens after a vesting phase, they would get an accumulating amount of MCAP tokens when they decide to release it. <br />  
MCAP tokens Vesting Schedule: <br />  

|Distribution            | Amount        | %     | Release Schedule| Address
| -----------------------| ------------- | -------- |------------- | -------- |
|Ecosystem & Development|2.5B|25%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0x8c2e47DD593D74Cb18A3F821F6c727006DE9aB29](https://mumbai.polygonscan.com/address/0x8c2e47DD593D74Cb18A3F821F6c727006DE9aB29)
|Founding team| 1.9B| 19%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0x03749Ad13De695070135C8F1709404e8A17990a2](https://mumbai.polygonscan.com/address/0x03749Ad13De695070135C8F1709404e8A17990a2)
|Company reserve|1.5B|15%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0x667ff534e713077B6787eF40660022b058b68D36](https://mumbai.polygonscan.com/address/0x667ff534e713077B6787eF40660022b058b68D36)
|Public sale|1.45B|14.5%|20% per month for 5 months starting from day 0|[0xE6757B473C2acb1cE598AcF9fa09A3a4DA882154](https://mumbai.polygonscan.com/address/0xE6757B473C2acb1cE598AcF9fa09A3a4DA882154)
|Community & Token rewards|0.8B|8%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0xE06c357eDb891de4A815B4650785C3d889180Ee0](https://mumbai.polygonscan.com/address/0xE06c357eDb891de4A815B4650785C3d889180Ee0)
|Marketing|0.75B|7.5%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0x9A5f0eAdad6692c3e2b73a76c31ABF394e77bF3A](https://mumbai.polygonscan.com/address/0x9A5f0eAdad6692c3e2b73a76c31ABF394e77bF3A)
|Strategic partners|0.5B|5%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0x8A599960255EaD75F2cA4cddc1e9dA2f4f0544dE](https://mumbai.polygonscan.com/address/0x8A599960255EaD75F2cA4cddc1e9dA2f4f0544dE)
|Presale|0.3B|3%|Unlocked|[0xF818d79D7A995dB4237B85715Bc51085960897BE](https://mumbai.polygonscan.com/address/0xF818d79D7A995dB4237B85715Bc51085960897BE)
|Advisor| 0.2B|2%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0x84cfed191A4E5aee3282B50bDC0080f5Abb9a323](https://mumbai.polygonscan.com/address/0x84cfed191A4E5aee3282B50bDC0080f5Abb9a323)
|Private Sale|0.1B|1%|180-day cliff, followed by 5% monthly vesting for 5 months, then 3% monthly vesting for 25 months|[0xa0a68F7DbD159F7781A07E942cF67B236b4F3aCe](https://mumbai.polygonscan.com/address/0xa0a68F7DbD159F7781A07E942cF67B236b4F3aCe)

# MeetcapPresale <br />
MeetcapPresale is a smart contract that holds the logic for the presale of Meetcap tokens, with the rate is **1500 TDG tokens/ 1 MATIC**. <br />
To get MCAP
tokens in MeetcapPresale contract, there are 3 ways: <br />

#### 1. Send some test MATIC to MeetcapPresale address <br />
The transaction will be revert if: <br />

- The presale has already been ended. <br />
- You want to buy MCAP tokens amount that exceeds the presale balance. <br />

#### 2. Connect to web3 on [Mumbai Polygonscan](https://mumbai.polygonscan.com/) and directly interact with [MeetcapPresale smart contract](https://mumbai.polygonscan.com/address/0xF818d79D7A995dB4237B85715Bc51085960897BE). <br />
The transaction will be reverted if: <br />

- The presale has already been ended. <br />
- You want to buy MCAP tokens amount that exceeds the presale balance. <br />
- You buy with 0 MATIC <br />
- The beneficiary address is the zero address. <br />

#### 3. Buy MCAP tokens in the presale section on a website (not yet implemented) <br />


