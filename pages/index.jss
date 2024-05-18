import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atmAbi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function UniqueHomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atmAbi.abi;

  const fetchWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  }

  const handleAccount = (accounts) => {
    if (accounts) {
      console.log("Account connected: ", accounts);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    fetchATMContract();
  };

  const fetchATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const fetchBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    }
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit({ value: ethers.utils.parseEther("1") });
      await tx.wait();
      fetchBalance();
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(ethers.utils.parseEther("1"));
      await tx.wait();
      fetchBalance();
    }
  }

  const initializeUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount} className="btn btn-primary">Connect MetaMask Wallet</button>;
    }

    if (balance === undefined) {
      fetchBalance();
    }

    return (
      <div className="user-info">
        <p className="account-info">Your Account: {account}</p>
        <p className="balance-info">Your Balance: {balance} ETH</p>
        <div className="buttons">
          <button onClick={deposit} className="btn btn-deposit">Deposit 1 ETH</button>
          <button onClick={withdraw} className="btn btn-withdraw">Withdraw 1 ETH</button>
        </div>
      </div>
    );
  }

  useEffect(() => { fetchWallet(); }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initializeUser()}
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f0f4f8;
        }
        header {
          margin-bottom: 20px;
        }
        h1 {
          font-size: 2.5em;
          color: #333;
          margin-bottom: 20px;
        }
        .user-info {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: left;
          max-width: 400px;
        }
        .account-info, .balance-info {
          font-size: 1.2em;
          margin: 10px 0;
          color: #333;
        }
        .buttons {
          margin-top: 20px;
        }
        .btn {
          display: inline-block;
          margin: 10px;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          transition: background-color 0.3s ease;
        }
        .btn-primary {
          background-color: #007bff;
          color: #fff;
        }
        .btn-deposit {
          background-color: #28a745;
          color: #fff;
        }
        .btn-withdraw {
          background-color: #dc3545;
          color: #fff;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .btn:disabled {
          background-color: #ddd;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
