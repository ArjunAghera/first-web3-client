import * as React from "react";
import { ethers } from "ethers";
import "./App.css";
import { useEffect } from "react";
import { useState } from "react";
import abi from "./utils/WavePortal.json";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [count, setCount] = useState("");
  const [message, setMessage] = useState("");
  const contractAddress = "0xF8a5bD0c69D00c02ca74fc89817bf81cA008efb2";
  const contractABI = abi.abi;
  const chechIfWalletIsConnected = async () => {
    const { ethereum } = window;
    try {
      if (!ethereum) {
        console.log("Login in through your Metamask wallet");
      } else {
        console.log(
          "You are loggedin and we have your ethereum object",
          ethereum
        );
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("This the authoprized account", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask installed");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    chechIfWalletIsConnected();
    getAllWaves();
  }, [allWaves]);
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getWaveCount();
        console.log("Retirved wave count", count.toNumber());
        setCount(count.toNumber());

        const waveTxn = await wavePortalContract.wave(message);
        console.log("Minning", waveTxn.hash);

        await waveTxn.wait();
        console.log("Minned", waveTxn.hash);
        alert("Wave mined");

        setMessage("");

        count = await wavePortalContract.getWaveCount();
        console.log("Retirved wave count", count.toNumber());
        setCount(count.toNumber());
      } else {
        console.log("No ethereum object found");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">👋 Hey there!</div>

          <div className="bio">
            I am Arjun and I am a Developer, Photographer and Designer! Connect
            your Ethereum wallet and wave at me!
          </div>

          <div className="bio">Total Waves: {count}</div>

          <form action="">
            <textarea
              name="message"
              id="message"
              onChange={handleChange}
              placeholder="Enter your message here"
            ></textarea>
          </form>

          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>

          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          {allWaves.map((wave, index) => {
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "OldLace",
                  marginTop: "16px",
                  padding: "8px",
                }}
              >
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
