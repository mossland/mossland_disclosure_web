const axios = require("axios");
const ethers = require("ethers");
const big = require("big.js");

class SwapInfo {
  constructor() {
    this.mocAddress = "0xfb2b78e89be479318b62d94a93c3527ad8f4ff95";
    this.wmocAddress = "0xBeE20B9Df360B8442534Ed8059f3e5bAEeB74EaF";
    this.alchemyId = process.env.ALCHEMY_ID;
    this.etherScanApiKey = process.env.ETHER_SCAN_API_KEY;
    this.ethplorerApiKey = process.env.ETHPLORER_API_KEY;
  }

  numberWithCommas(x) {
    return Number(x).toLocaleString(undefined, { minimumFractionDigits: 18 });
  }

  async getMocCirculatingSupply() {
    const response = await axios.get("https://api.moss.land/MOC/info");
    const json = response.data;
    return this.numberWithCommas(json[0].circulatingSupply);
  }

  async getMOCBalance() {
    const bal = await axios.get(
      `https://api.luniverse.io/scan/v1.0/chains/0/accounts/${this.mocAddress}/tokens?limit=25`
    );
    for (const el of bal.data.data.tokens.items) {
      if (el.contractAddress == "0x878120A5C9828759A250156c66D629219F07C5c6") {
        //console.log(el);
        return this.numberWithCommas(
          Number(new big(el.balance).div(big(10).pow(18)))
        );
      }
    }

    return 0;
  }
  async getWmocLastTx() {
    // v2 (Ethereum Mainnet)
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&contractaddress=${this.wmocAddress}&page=1&offset=10&sort=desc&apikey=${this.etherScanApiKey}`;

    //const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${this.wmocAddress}&page=1&offset=10&sort=desc&apikey=${this.ehterScanApiKey}`
    const lastTx = await axios.get(url);
    const result = lastTx.data.result;
    return result;
  }

  async getWmocInfoCount() {
    const url = `https://api.ethplorer.io/getAddressInfo/${this.wmocAddress}?apiKey=${this.ethplorerApiKey}`;

    // br(브로틀리) 제외 → zlib Brotli 디코딩 에러 방지
    const headers = { "Accept-Encoding": "identity" }; // 또는 "gzip, deflate"

    const MAX_RETRY = 3;
    const BASE_DELAY = 200; // ms

    for (let i = 0; i < MAX_RETRY; i++) {
      try {
        const res = await axios.get(url, {
          headers,
          timeout: 10_000,
          responseType: "json",
          validateStatus: (s) => s >= 200 && s < 300,
        });

        const data = res.data || {};
        const ti = data.tokenInfo || {};

        // 필드 검증 (없으면 에러)
        if (
          ti == null ||
          ti.holdersCount == null ||
          ti.transfersCount == null ||
          ti.issuancesCount == null
        ) {
          throw new Error("ethplorer: missing fields in tokenInfo");
        }

        const holderCount = Number(ti.holdersCount) || 0;
        const totalTransfersCount =
          (Number(ti.issuancesCount) || 0) + (Number(ti.transfersCount) || 0);

        return { holderCount, totalTransfersCount };
      } catch (e) {
        const msg = `${e?.code || ""} ${e?.message || ""}`.toLowerCase();
        const retriable =
          msg.includes("z_buf_error") || // 브로틀리 디코드 실패
          msg.includes("unexpected end of") || // 트렁케이션
          msg.includes("socket hang up") ||
          msg.includes("timeout") ||
          msg.includes("network") ||
          msg.includes("ecconnreset") ||
          [
            "ECONNRESET",
            "ECONNABORTED",
            "ETIMEDOUT",
            "EAI_AGAIN",
            "ENOTFOUND",
            "EPIPE",
          ].includes(e?.code);

        if (retriable && i < MAX_RETRY - 1) {
          const delay = BASE_DELAY * Math.pow(2, i); // 200 → 400 → 800ms
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        // 마지막 시도 실패 또는 비재시도 오류는 그대로 던짐
        throw e;
      }
    }
  }

  async getSwapVar() {
    const provider = new ethers.JsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${this.alchemyId}`
    );

    const contract = new ethers.Contract(
      this.wmocAddress,
      [
        "function maxSupply() public view returns (uint256)",
        "function balanceOf(address owner) view returns (uint256)",
        "function paused() public view returns (bool)",
      ],
      provider
    );

    const maxSupply_r = await contract.maxSupply();
    const maxSupplyWmoc = this.numberWithCommas(
      Number(new big(maxSupply_r).div(big(10).pow(18)))
    );

    const supplyable_r = await contract.balanceOf(this.wmocAddress);
    const supplyableWmoc = this.numberWithCommas(
      Number(new big(supplyable_r).div(big(10).pow(18)))
    );

    const pausedWmoc = await contract.paused();
    const ret = { maxSupplyWmoc, supplyableWmoc, pausedWmoc };
    //console.log(ret);
    return ret;
  }

  async getWmocInfo() {
    const mocBalance = await this.getMOCBalance();
    const wmocLastTx = await this.getWmocLastTx();
    const swapVar = await this.getSwapVar();
    const mocCirculatingSupply = await this.getMocCirculatingSupply();
    const count = await this.getWmocInfoCount();

    const wmocInfo = {
      maxSupplyWmoc: swapVar.maxSupplyWmoc,
      supplyableWmoc: swapVar.supplyableWmoc,
      pausedWmoc: swapVar.pausedWmoc,
      mocBalance: mocBalance,
      wmocLastTx: wmocLastTx,
      mocCirculatingSupply: mocCirculatingSupply,
      holderCount: count.holderCount,
      totalTransfersCount: count.totalTransfersCount,
    };

    return wmocInfo;
  }
}

module.exports = SwapInfo;
