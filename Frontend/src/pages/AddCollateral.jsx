import { useState } from "react";
import ChainSelect from "@/components/chain-select";
// import { ChainCard } from "@/components/chain-card";S
import { useEquito } from "@/components/providers/equito/equito-provider";
import "./addCollateral.css";

export default function AddCollateral() {
  const [amount, setAmount] = useState("");
  const { chain } = useEquito()["from"];

  console.log("hi");
  console.log(chain);

  const handleAddCollateral = () => {
    // Here you would integrate with the blockchain to add collateral
    console.log(
      `Adding ${amount} ${selectedToken} as collateral on ${selectedChain}`
    );

    // Reset form or show success message
  };

  return (
    <div className="addCollateral_container">
      <div className="addCollateral_container_container">
        <ChainSelect mode="from" />
        {/* <div>
          <label>Selected Token:</label>
          <div>{chain?.definition.nativeCurrency.symbol}</div>
        </div> */}
        <div>
          {/* <label>Amount:</label> */}
          {/* <input
            // type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded bg-gray-50 text-gray-800"
            placeholder="Enter amount"
          /> */}
        </div>

        <div className="addCollateral_container_from_input">
          <input
            // type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"></img>
        </div>
        <div className="addcollateral_bottom">
          <button onClick={handleAddCollateral}>Add Collateral</button>
          <div>
            <p>
              Collateral Amount: 0.00{" "}
              {chain?.definition.nativeCurrency.symbol || "ETH"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
