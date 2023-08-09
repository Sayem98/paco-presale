import Web3 from "web3";
import { TOKEN_ABI, PRESALE_ABI, PRESALE_ADDRESS, MULTICALL_ABI, MULTICALL_ADDRESS } from "../utils/contract";
  import {toast } from 'react-toastify';
const rpc = "https://bsc.getblock.io/fc461820-6d93-4ac2-bec1-16cc38e1a83e/mainnet/";

function useContract() {
  const getWeb3 = async (type) => {
    if (type === "r") {
      try{
        const web3 = new Web3(rpc);
        console.log(web3);
        return { web3 };
      }catch(err){
        toast.error("Error in getting web3");
      }
      
    } else if (type === "w") {
      if (!window.ethereum) {
        toast.error("Please install metamask");
        return;
      }
      try{
        const web3 = new Web3(window.ethereum);
        return { web3 };
      }catch(err){
        toast.error("Error in getting web3");
      }
    }
  };

  const getContract = async (abi, address, type) => {
    if (type ==='w' && !window.ethereum) {
      toast.error("Please install metamask");
      return;
    }
    console.log(type);
    try{
      
      const { web3 } = await getWeb3(type);
      const contract = new web3.eth.Contract(abi, address);
      return contract;
    }catch(err){
      toast.error("Error in getting contract");
    }
  };

  const getAccountBalance = async (address) => {

    const { web3 } = await getWeb3("r");
    try{
      let balance = await web3.eth.getBalance(address);
      balance = Web3.utils.fromWei(balance, "ether");
      return balance;
    }catch(err){
      toast.error("Error in getting account balance");
    }
  };

  const getTokenBalance = async (address, tokenAddress) => {
    try{
      const token = await getContract(TOKEN_ABI, tokenAddress, "r");
      let balance = await token.methods.balanceOf(address).call();
      balance = Web3.utils.fromWei(balance, "ether");
      return balance;
    }catch(err){
      toast.error("Error in getting token balance");
    }
    
  };

  

  const getData = async (abi, address) => {
    console.log('getData');
    
    const contract = await getContract(abi, address, "r");
    console.log(contract);
    console.log(await contract.methods.presale_time().call());

    const multicall = await getContract(MULTICALL_ABI, MULTICALL_ADDRESS, "r");

    const calls = [
      [address, contract.methods.presale_time().encodeABI()],
      [address, contract.methods.token().encodeABI()],
      [address, contract.methods.usdc().encodeABI()],
      [address, contract.methods.usdt().encodeABI()],
      [address, contract.methods.rate().encodeABI()],
      [address, contract.methods.total_sold().encodeABI()],
      // [address, contract.methods.min_perchase_amount().encodeABI()],
      // [address, contract.methods.max_perchase_amount().encodeABI()],
      [address, contract.methods.total_token_for_sale().encodeABI()],
      [address, contract.methods.getETHPrice().encodeABI()],
    ];

    const {web3} = await getWeb3("r");
    var data;
    try{
     data = await multicall.methods.aggregate(calls).call();
    }catch(err){
      toast.error("Error in getting data");
    }

    console.log(data);


    let presale_time = parseInt(data.returnData[0]);

    const token = web3.eth.abi.decodeParameter("address", data.returnData[1]);
    const usdc = web3.eth.abi.decodeParameter("address", data.returnData[2]);
    const usdt = web3.eth.abi.decodeParameter("address", data.returnData[3]);
    const rate = parseFloat(web3.utils.fromWei(data.returnData[4], "ether")).toFixed(7);
    const total_sold = web3.utils.fromWei(data.returnData[5], "ether");
    // const min_perchase_amount = web3.utils.fromWei(data.returnData[6], "ether");
    // const max_perchase_amount = web3.utils.fromWei(data.returnData[7], "ether");
    const total_token_for_sale = web3.utils.fromWei(data.returnData[6], "ether");
    const getETHPrice = web3.utils.fromWei(data.returnData[7], "nano") * 10;

    console.log(presale_time, token, usdc, usdt, rate, total_sold, total_token_for_sale, getETHPrice);

    return {
      presale_time,
      token,
      usdc,
      usdt,
      rate,
      total_sold,
      // min_perchase_amount,
      // max_perchase_amount,
      total_token_for_sale,
      getETHPrice,
    };
  };

  const checkApprove = async (address, acount) => {
    if(!acount){
      return;
    }
    try{
      const token = await getContract(TOKEN_ABI, address, "r");
    const allowance = await token.methods
      .allowance(acount, PRESALE_ADDRESS)
      .call();
    // console.log(allowance);
    const eth_allowance = Web3.utils.fromWei(allowance, "ether");
    return eth_allowance;
    }catch(err){
      toast.error("Error in checking approval");
    }
    
  };

  const approve_token = async (address, amount, acount) => {
    if (!window.ethereum) {
      toast.error("Please install metamask");
      return;
    }
    const token = await getContract(TOKEN_ABI, address, "w");

    amount = Web3.utils.toWei(amount, "ether");
    try {
      await token.methods
        .approve(PRESALE_ADDRESS, amount)
        .send({ from: acount });
    } catch (err) {
      console.log(err);
      toast.error("Approve failed");
    }
  };

  const buy_with_token = async (address, amount, acount, paymentType) => {
    if (!window.ethereum) {
      toast.error("Please install metamask");
      return;
    }
    const contract = await getContract(PRESALE_ABI, address, "w");
    amount = Web3.utils.toWei(amount, "ether");
    try {
      const buy = await contract.methods
        .buy_with_stablecoins(paymentType, amount)
        .send({ from: acount });
    } catch (err) {
      console.log(err);
      toast.error("Buy failed");
    }
  };

  const buy_with_native_token = async (address, amount, acount) => {
    if (!window.ethereum) {
      toast.error("Please install metamask");
      return;
    }
    const contract = await getContract(PRESALE_ABI, address, "w");
    amount = Web3.utils.toWei(amount, "ether");
    try {
      const buy = await contract.methods
        .buy_with_native_token()
        .send({ from: acount, value: amount });
    } catch (err) {
      console.log(err);
      toast.error("Buy failed");
    }
  };

  return {
    getContract,
    getWeb3,
    getData,
    buy_with_token,
    approve_token,
    checkApprove,
    buy_with_native_token,
    getAccountBalance,
    getTokenBalance,
  };
}

export default useContract;
