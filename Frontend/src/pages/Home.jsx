import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ChainSelect from "@/components/chain-select";
import { Input } from "@/components/ui/input";
import "./home.css";
import { useEquito } from "@/components/providers/equito/equito-provider";
import { useReadContract } from "wagmi";
import LendingAbi from "@/lib/abi/lending.abi.ts";
import { useAccount } from "wagmi";
import { routerAbi } from "@equito-sdk/evm";
import { formatUnits, parseEther, parseEventLogs } from "viem";
import { config } from "@/lib/wagmi";
import { useApprove } from "@/components/providers/equito/use-approve";
import { generateHash } from "@equito-sdk/viem";
// import { waitForTransactionReceipt, getBlock } from "@wagmi/core";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { waitForTransactionReceipt, getBlock } from "@wagmi/core";
import { toast } from "sonner";

export default function Home() {
  const { data, writeContractAsync, isPending, reset } = useWriteContract();
  const { chain: sourceChain } = useEquito()["from"];
  const { chain: destinationChain } = useEquito()["to"];
  const [amount, setAmount] = useState("");
  const { switchChainAsync } = useSwitchChain();
  const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const { address, isConnected } = useAccount();
  const approve = useApprove();
  // console.log(address, isConnected);
  // console.log(sourceChain);

  const { data: collateral } = useReadContract({
    address: sourceChain?.LendingContract,
    abi: LendingAbi,
    functionName: "_balances",
    args: [address || NATIVE_ADDRESS],
    chainId: sourceChain?.definition.id,
  });

  // console.log("Fee:", collateral);

  const { data: destinationBalance } = useReadContract({
    address: destinationChain?.LendingContract,
    abi: LendingAbi,
    functionName: "getBalance",
    args: [],
    chainId: destinationChain?.definition.id,
  });

  const { data: sourceBalance } = useReadContract({
    address: sourceChain?.LendingContract,
    abi: LendingAbi,
    functionName: "_balances",
    args: [address || NATIVE_ADDRESS],
    chainId: sourceChain?.definition.id,
  });

  const { data: fees } = useReadContract({
    address: sourceChain?.RouterContract,
    abi: routerAbi,
    functionName: "getFee",
    args: [sourceChain?.RouterContract || NATIVE_ADDRESS],
    chainId: sourceChain?.definition.id,
  });
  // console.log("Fees:", fees);
  // calculateDestinationMaximumBorrowAmount

  const { data: maximum_borrow } = useReadContract({
    address: sourceChain?.LendingContract,
    abi: LendingAbi,
    functionName: "calculateDestinationMaximumBorrowAmount",
    args: [
      address || NATIVE_ADDRESS,
      destinationChain?.chainSelector || 0,
      NATIVE_ADDRESS,
    ],
    chainId: sourceChain?.definition.id,
  });

  // console.log("Maximum Borrow:", maximum_borrow);

  const { data: destinationamount } = useReadContract({
    address: sourceChain?.LendingContract,
    abi: LendingAbi,
    functionName: "calculateAmountonDestinationChain",
    args: [
      parseEther(amount, "wei"),
      destinationChain?.chainSelector,
      NATIVE_ADDRESS,
    ],
    chainId: sourceChain?.definition.id,
  });
  // console.log("destination amount:", destinationamount);
  console.log(sourceChain?.definition?.nativeCurrency?.symbol);
  console.log(sourceChain?.definition);

  const handleTakeLoan = async () => {
    if (!amount) {
      toast.error("Amount is required");
      return;
    }
    if (Number(amount) > Number(formatUnits(maximum_borrow, 18))) {
      console.log("Amount is greater than maximum limit");

      toast.error("Amount is greater than maximum limit");
      return;
    }
    if (Number(amount) <= 0) {
      toast.error("Amount is invalid");
      return;
    }
    if (!sourceChain) {
      toast.error("Source Chain is required");
      return;
    }
    if (!destinationChain) {
      toast.error("Destination Chain is required");
      return;
    }
    if (destinationamount > destinationBalance) {
      toast.error(
        "Sorry for inconvenience, Destination chain does not have enough balance to process the transaction please lend less amount"
      );
      return;
    }

    console.log("Take Loan");
    const hash1 = await writeContractAsync({
      address: sourceChain?.LendingContract,
      abi: LendingAbi,
      functionName: "BorrowAmount",
      value: BigInt(fees),
      chainId: sourceChain?.definition.id,
      args: [
        parseEther(amount, "wei"),
        destinationChain?.chainSelector || 0,
        NATIVE_ADDRESS,
      ],
    });

    console.log(hash1);
    console.log(sourceChain?.definition.id);

    const sendReceipt = await waitForTransactionReceipt(config, {
      hash: hash1,
      chainId: sourceChain?.definition.id,
    });

    console.log("Send Receipt:", sendReceipt);

    const sentMessage = parseEventLogs({
      abi: routerAbi,
      logs: sendReceipt.logs,
    }).flatMap(({ eventName, args }) =>
      eventName === "MessageSendRequested" ? [args] : []
    )[0];

    const { sentPingTimestamp } = await getBlock(config, {
      chainId: sourceChain?.definition.id,
      blockNumber: sendReceipt.blockNumber,
    });

    const { proof } = await approve.execute({
      messageHash: generateHash(sentMessage.message),
      fromTimestamp: Number(sentPingTimestamp) * 1000,
      chainSelector: sourceChain?.chainSelector,
    });

    await switchChainAsync({ chainId: destinationChain?.definition.id });

    const hash2 = await writeContractAsync({
      address: destinationChain?.RouterContract,
      abi: routerAbi,
      functionName: "deliverAndExecuteMessage",
      args: [sentMessage.message, sentMessage.messageData, BigInt(0), proof],
      chainId: destinationChain?.definition.id,
    });

    const txRecipt2 = await waitForTransactionReceipt(config, {
      hash: hash2,
      chainId: destinationChain?.definition.id,
    });

    console.log("Tx Receipt 2:", txRecipt2);
  };

  return (
    <div className="home_container">
      <h1 className="home_container_container">TAKE A CROSS-CHAIN LOAN</h1>
      <div className="home_container_from">
        <ChainSelect placeholder="Source Chain (Collateral)" mode="from" />
        <div className="home_container_from_body">
          <h2>You send</h2>
          {/* TODO : CHANGE THIS TO TOTAL AMOUNT */}
          <p>
            Available: {formatUnits(`${sourceBalance || 0}` || 0, 18)}{" "}
            {sourceChain?.definition?.nativeCurrency?.symbol}
          </p>
          <p>
            collateral: {formatUnits(collateral || 0, 18)}{" "}
            {sourceChain?.definition?.nativeCurrency?.symbol}{" "}
          </p>
        </div>
        <div className="home_container_from_input">
          <input
            // type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {sourceChain ? (
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${sourceChain?.img}.png`}
            ></img>
          ) : (
            ""
          )}
        </div>
        <div className="home_container_from_bottom">
          <p>
            Transaction fees : {formatUnits(fees || 0, 18)}{" "}
            {sourceChain?.definition?.nativeCurrency?.symbol}
          </p>
        </div>
      </div>

      <div className="home_container_to">
        <ChainSelect placeholder="Destination Chain (Loan)" mode="to" />
        <div className="home_container_to_body">
          <h2>You receive</h2>
          <p>
            Available: {formatUnits(`${destinationBalance || 0}`, 18)}{" "}
            {destinationChain?.definition?.nativeCurrency?.symbol}
          </p>
        </div>
        <div className="home_container_to_input">
          <h2>{formatUnits(`${destinationamount || 0}`, 18)}</h2>
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
