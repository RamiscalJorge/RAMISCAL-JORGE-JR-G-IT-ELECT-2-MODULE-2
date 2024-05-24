import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
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

    // once wallet is set we can get a reference to our deployed contract
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
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
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

    if (balance == undefined) {
      getBalance();
    }

    return (
      <>
        <div className=" max-w-1/2 rounded px-5 py-4">
          <div className="max-w-1/2 rounded overflow-hidden shadow-lg px-10 py-12 bg-blue-500 text-white">
            <p className="mb-5 text-1xl font-medium">
              Your Account: <span className="block">{account} </span>
            </p>
            <p className="mb-4 font-medium">Your Main Balance: {balance}</p>
          </div>
          <div className="max-w-1/2 bg-slate-400 px-10 py-12 border rounded-md">
            <button
              onClick={deposit}
              className="py-4 px-4 bg-[#2596be] text-white border:none rounded-md mx-2 hover:bg-red-500 hover:text-white"
            >
              Deposit 1 ETH
            </button>
            <button
              onClick={withdraw}
              className="py-4 px-4 bg-[#2596be] text-white border:none rounded-md  hover:bg-red-500 hover:text-white"
            >
              Withdraw 1 ETH
            </button>
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <main className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-[#ebf4f5] to-[#b5c6e0">
        <header>
          <h1 className="text-2xl font-medium mb-5">
            Welcome to the Metacrafters ATM!
          </h1>
        </header>
        {initUser()}
        <style jsx>
          {`
            .container {
              text-align: center;
            }
          `}
        </style>
      </main>
    </>
  );
}
