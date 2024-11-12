import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Replace with your provider's API key, faucet contract address, and ABI
const provider = new ethers.providers.Web3Provider(window.ethereum);

const faucetAddress = process.env.FAUCET_ADDRESS;
const faucetABI = ['function requestTokens(address _receiver) public'];

function App() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Enter your address to request tokens');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  // Check if the user is already connected to MetaMask
  useEffect(() => {
    if (window.ethereum) {
      checkWalletConnection();
    } else {
      setStatus('Please install MetaMask to use this feature.');
    }
  }, []);

  // Function to connect the wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request the user's Ethereum account address
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const userAccount = accounts[0];
        setUserAddress(userAccount);
        setIsConnected(true);
        setAddress(userAccount);
        setStatus('Wallet connected');
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        setStatus('Failed to connect wallet. Please try again.');
      }
    } else {
      setStatus('MetaMask is not installed. Please install MetaMask.');
    }
  };

  // Function to check if the wallet is connected
  const checkWalletConnection = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      setUserAddress(accounts[0]);
      setIsConnected(true);
      setAddress(accounts[0]);
    }
  };

  const signer = provider.getSigner();

  const requestTokens = async () => {
    if (!ethers.utils.isAddress(address)) {
      setStatus('Invalid address. Please enter a valid Ethereum address.');
      return;
    }

    try {
      setStatus('Requesting tokens...');
      const faucetContract = new ethers.Contract(
        faucetAddress,
        faucetABI,
        signer
      );
      const tx = await faucetContract.requestTokens(address);
      await tx.wait();
      setStatus(`Success! Tokens sent to ${address}`);
    } catch (error) {
      console.error('Error requesting tokens:', error);
      setStatus('Error: Unable to send tokens. Please try again.');
    }
  };

  return (
    <div className="App">
      <h2>ERC20 Faucet</h2>

      {!isConnected ? (
        <button
          onClick={connectWallet}
          style={{ padding: '10px', width: '80%', marginBottom: '20px' }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Wallet connected: {userAddress}</p>
        </div>
      )}

      <button onClick={requestTokens} style={{ padding: '10px', width: '80%' }}>
        Request Tokens
      </button>
      <p>{status}</p>
    </div>
  );
}

export default App;
