import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ChainSelect from "@/components/chain-select";
import { Input } from "@/components/ui/input";
import "./home.css";
import { useEquito } from "@/components/providers/equito/equito-provider";

const tokens = ["ETH", "USDT", "USDC", "DAI"];

export default function Home() {
  const { chain } = useEquito()["from"];
  // console.log(chain);

  const [sourceChain, setSourceChain] = useState("");
  const [destinationChain, setDestinationChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    console.log("Selected Source Chain:", sourceChain);
  }, [sourceChain]);

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
          {chain ? (
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${chain?.img}.png`}
            ></img>
          ) : (
            ""
          )}
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
          {destinationChain ? (
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${destinationChain.img}.png`}
              alt={`${destinationChain.name} logo`}
              width={32}
              height={32}
              className="chain-logo"
            />
          ) : null}
        </div>
      </div>

      <button onClick={handleTakeLoan} className="home_container_takeloan">
        Take Loan
      </button>
      {/* </main> */}
    </div>
  );
}
