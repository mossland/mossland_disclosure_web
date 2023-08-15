const axios = require('axios');
const ethers = require('ethers');
const big = require('big.js');

class SwapInfo {
    constructor() {
        this.mocAddress = '0xfb2b78e89be479318b62d94a93c3527ad8f4ff95';
        this.wmocAddress = '0xBeE20B9Df360B8442534Ed8059f3e5bAEeB74EaF';
        this.alchemyId = process.env.ALCHEMY_ID;
        this.ehterScanApiKey = process.env.ETHER_SCAN_API_KEY;
    }

    numberWithCommas(x) {
        return Number(x).toLocaleString(undefined, { minimumFractionDigits: 18 });
    }

    async getMocCirculatingSupply() {
        const response = await axios.get('https://api.moss.land/MOC/info');
        const json = response.data;
        return this.numberWithCommas(json[0].circulatingSupply);
    }
    

    async getMOCBalance() {
        const bal = await axios.get(`https://api.luniverse.io/scan/v1.0/chains/0/accounts/${this.mocAddress}/tokens?limit=25`);
        for (const el of bal.data.data.tokens.items) {
            if (el.contractAddress == '0x878120A5C9828759A250156c66D629219F07C5c6') {
                //console.log(el);
                return this.numberWithCommas(Number(new big(el.balance).div(big(10).pow(18))));
            }
        }

        return 0;
    }
    async getWmocLastTx() {
        const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${this.wmocAddress}&page=1&offset=10&sort=desc&apikey=${this.ehterScanApiKey}`
        const lastTx = await axios.get(url);
        const result = lastTx.data.result;
        return result;
    }


    async getSwapVar() {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${this.alchemyId}`);

        const contract = new ethers.Contract(this.wmocAddress, [
            'function maxSupply() public view returns (uint256)',
            'function balanceOf(address owner) view returns (uint256)',
            'function paused() public view returns (bool)',
        ], provider);

        const maxSupply_r = await contract.maxSupply();
        const maxSupplyWmoc = this.numberWithCommas(Number(new big(maxSupply_r).div(big(10).pow(18))));

        const supplyable_r = await contract.balanceOf(this.wmocAddress);
        const supplyableWmoc = this.numberWithCommas(Number(new big(supplyable_r).div(big(10).pow(18))));

        const pausedWmoc = await contract.paused();
        const ret = { maxSupplyWmoc, supplyableWmoc, pausedWmoc };
        //console.log(ret);
        return ret;
    }

    async getWmocInfo(){
        const mocBalance = await this.getMOCBalance();
        const wmocLastTx = await this.getWmocLastTx();
        const swapVar = await this.getSwapVar();
        const mocCirculatingSupply = await this.getMocCirculatingSupply();

        const wmocInfo = {
            maxSupplyWmoc : swapVar.maxSupplyWmoc,
            supplyableWmoc : swapVar.supplyableWmoc,
            pausedWmoc : swapVar.pausedWmoc,
            mocBalance : mocBalance,
            wmocLastTx : wmocLastTx,
            mocCirculatingSupply : mocCirculatingSupply
        }

        return wmocInfo;
    }
}

module.exports = SwapInfo;