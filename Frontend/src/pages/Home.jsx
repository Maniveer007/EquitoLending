import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChainSelect from "@/components/chain-select";
import { Input } from "@/components/ui/input";
import "./home.css";

const tokens = ["ETH", "USDT", "USDC", "DAI"];

export default function Home() {
  const [sourceChain, setSourceChain] = useState("");
  const [destinationChain, setDestinationChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");

  const handleTakeLoan = () => {};

  return (
    <div className="home_container">
        <h1 className="home_container_container">TAKE A CROSS-CHAIN LOAN</h1>
        <div className="home_container_from">
          <ChainSelect
            placeholder="Source Chain (Collateral)"
            onChange={setSourceChain}
            mode="from"
          />
          <div className="home_container_from_body">
            <h2>You send</h2>
            <p>Available: 98864.80 USDC</p>
          </div>
          <div className="home_container_from_input">
            <input
              // type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"></img>
          </div>
          <div className="home_container_from_bottom">
            <p>Transaction fees : 0.00028571 ETH</p>
          </div>
        </div>

        <div className="home_container_to">
          <ChainSelect
            placeholder="Destination Chain (Loan)"
            onChange={setDestinationChain}
            mode="to"
          />
          <div className="home_container_to_body">
            <h2>You receive</h2>
            <p>Available: 98864.80 USDC</p>
          </div>
          <div className="home_container_to_input">
            <h2>0.00</h2>
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"></img>
          </div>
        </div>

        <button onClick={handleTakeLoan} className="home_container_takeloan">
          Take Loan
        </button>
      {/* </main> */}
    </div>
  );
}
