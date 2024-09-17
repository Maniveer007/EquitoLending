import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChainSelect from "@/components/chain-select";
import { Input } from "@/components/ui/input";

const tokens = ["ETH", "USDT", "USDC", "DAI"];

export default function Home() {
  const [sourceChain, setSourceChain] = useState("");
  const [destinationChain, setDestinationChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");

  const handleTakeLoan = () => {};

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Take a Cross-Chain Loan</h1>
        <div className="space-y-4 max-w-md">
          <ChainSelect
            placeholder="Source Chain (Collateral)"
            onChange={setSourceChain}
            mode="from"
          />
          <ChainSelect
            placeholder="Destination Chain (Loan)"
            onChange={setDestinationChain}
            mode="to"
          />
          {/* // TODO: Add token select dropdown */}

          {/* // TODO : MAX Loan Amount */}
          <a>Maximum Amount can be taken as Loan : </a>
          <Input
            type="number"
            placeholder="Loan Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={handleTakeLoan} className="w-full">
            Take Loan
          </Button>
        </div>
      </main>
    </div>
  );
}
