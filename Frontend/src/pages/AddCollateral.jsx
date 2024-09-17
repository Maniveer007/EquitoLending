import { useState } from "react";
import ChainSelect from "@/components/chain-select";
// import { ChainCard } from "@/components/chain-card";S
import { useEquito } from "@/components/providers/equito/equito-provider";

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
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <ChainSelect mode="from" />

        <div className="mt-6">
          <label className="block text-gray-700 font-semibold">
            Selected Token:
          </label>
          <div className="p-3 border rounded bg-gray-100 text-gray-800">
            {chain?.definition.nativeCurrency.symbol}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-gray-700 font-semibold">Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded bg-gray-50 text-gray-800"
            placeholder="Enter amount"
          />
        </div>
        <button
          onClick={handleAddCollateral}
          className="mt-8 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
        >
          Add Collateral
        </button>
        <div className="mt-6 text-center text-gray-700 font-semibold">
          Current Collateral Amount: 0.00{" "}
          {chain?.definition.nativeCurrency.symbol || "ETH"}
        </div>
      </div>
    </div>
  );
}
