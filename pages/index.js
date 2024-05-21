import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atmAbi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function UniqueHomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";
  const atmABI = atmAbi.abi;

  useEffect(() => {
    const fetchWallet = async () => {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        handleAccount(accounts);
      }
    };

    fetchWallet();
  }, []);

  useEffect(() => {
    if (ethWallet && account) {
      const fetchATMContract = () => {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const signer = provider.getSigner();
        const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
        setATM(atmContract);
      };

      fetchATMContract();
    }
  }, [ethWallet, account]);

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
  };

  const fetchBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      fetchBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      fetchBalance();
    }
  };

  const initializeUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      fetchBalance();
    }
    const increaseBalance = async () => {
      if (atm) {
          let tx = await atm.increaseBalance(10); // Increase the balance by 10 units
          await tx.wait();
          fetchBalance();
      }
  };
  
    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Unique Metacrafters ATM!</h1>
      </header>
      {initializeUser()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f0f2f5;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
  
        header {
          background-color: #6200ea;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
  
        header h1 {
          margin: 0;
        }
  
        p {
          font-size: 1.2em;
          color: #333;
        }
  
        button {
          background-color: #6200ea;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 10px 20px;
          font-size: 1em;
          cursor: pointer;
          margin: 10px 5px;
          transition: background-color 0.3s;
        }
  
        button:hover {
          background-color: #3700b3;
        }
  
        button:focus {
          outline: none;
        }
      `}
      </style>
    </main>
  );
}
