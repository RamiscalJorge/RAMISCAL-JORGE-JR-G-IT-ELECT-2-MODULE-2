import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error getting balance: ", error);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        setLoading(true);
        const tx = await atm.deposit({ value: ethers.utils.parseEther(depositAmount) });
        await tx.wait();
        setLoading(false);
        getBalance();
      } catch (error) {
        setLoading(false);
        console.error("Error making deposit: ", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        setLoading(true);
        const tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        setLoading(false);
        getBalance();
      } catch (error) {
        setLoading(false);
        console.error("Error making withdrawal: ", error);
      }
    }
  };

  const refreshBalance = () => {
    getBalance();
  };

  useEffect(() => {
    getWallet();
  }, []);

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button
          onClick={connectAccount}
          className="py-4 px-4 border bg-[#2596be] text-white rounded-md hover:bg-red-500 hover:text-white"
        >
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <>
        <div className="max-w-1/2 rounded px-5 py-4">
          <div className="max-w-1/2 rounded overflow-hidden shadow-lg px-10 py-12 bg-gray-600 text-white">
            <p className="mb-5 text-1xl font-medium">
              Your Account: <span className="block">{account}</span>
            </p>
            <p className="mb-4 font-medium">Your Balance: {balance} ETH</p>
          </div>
          <div className="max-w-1/2 bg-slate-400 px-10 py-12 border rounded-md">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="py-2 px-4 mb-4 border rounded-md"
              placeholder="Enter amount to deposit in ETH"
            />
            <button
              onClick={deposit}
              className={`py-4 px-4 bg-[#2596be] text-white border:none rounded-md mx-2 hover:bg-red-500 hover:text-white ${loading && 'opacity-50 cursor-not-allowed'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Deposit ETH'}
            </button>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="py-2 px-4 mb-4 border rounded-md"
              placeholder="Enter amount to withdraw in ETH"
            />
            <button
              onClick={withdraw}
              className={`py-4 px-4 bg-[#2596be] text-white border:none rounded-md  hover:bg-red-500 hover:text-white ${loading && 'opacity-50 cursor-not-allowed'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Withdraw ETH'}
            </button>
            <button
              onClick={refreshBalance}
              className="py-4 px-4 bg-[#2596be] text-white border:none rounded-md mx-2 mt-4 hover:bg-red-500 hover:text-white"
            >
              Refresh Balance
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <main className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-[#ebf4f5] to-[#b5c6e0]">
        <header>
          <h1 className="text-2xl font-medium mb-5">
            Welcome to the Metacrafters ATM!
          </h1>
        </header>
        {initUser()}
        <style jsx>{`
          .container {
            text-align: center;
          }
        `}</style>
      </main>
    </>
  );
}
