import { useState } from "react";
import ChainSelect from "@/components/chain-select";
// import { ChainCard } from "@/components/chain-card";S
import { useEquito } from "@/components/providers/equito/equito-provider";
import "./addCollateral.css";
import { formatUnits, parseEther, parseEventLogs, parseUnits } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import LendingAbi from "@/lib/abi/lending.abi.ts";
import { useAccount } from "wagmi";

export default function AddCollateral() {
  const [amount, setAmount] = useState("");
  const { chain } = useEquito()["from"];
  const { data, writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();
  const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  console.log("hi");
  console.log(chain);

  const { data: collateral } = useReadContract({
    address: chain?.LendingContract,
    abi: LendingAbi,
    functionName: "_balances",
    args: [address || NATIVE_ADDRESS],
    chainId: chain?.definition.id,
  });

  console.log("Fee:", collateral);
  console.log(formatUnits(collateral || 0, 18));

  const handleAddCollateral = async () => {
    const hash1 = writeContractAsync({
      address: chain?.LendingContract,
      abi: LendingAbi,
      functionName: "giveCollateral",
      value: [parseUnits(amount, 18)],
      chainId: chain?.definition.id,
    });

    // Reset form or show success message
  };

  return (
    <div className="addCollateral_container">
      <div className="addCollateral_container_container">
        <ChainSelect mode="from" />
        <div className="addCollateral_container_from_input">
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
        <div className="addcollateral_bottom">
          <button onClick={handleAddCollateral}>Add Collateral</button>
          <div>
            <p>
              Collateral Amount: {formatUnits(collateral || 0, 18)}{" "}
              {chain?.definition.nativeCurrency.symbol || "ETH"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
