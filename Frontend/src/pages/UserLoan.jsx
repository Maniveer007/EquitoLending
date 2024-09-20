import "./userLoan.css";
import GaugeChart from "react-gauge-chart";
import { chains } from "@/lib/chains";
import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import LendingAbi from "@/lib/abi/lending.abi.ts";
import { formatUnits, parseEventLogs, parseUnits } from "viem";
import { routerAbi } from "@equito-sdk/evm";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getBlock } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { useApprove } from "@/components/providers/equito/use-approve";
import { generateHash } from "@equito-sdk/viem";

const UserLoan = () => {
  console.log(chains);
  let loans = [];
  const { data, writeContractAsync, isPending, reset } = useWriteContract();
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const approve = useApprove();

  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    // console.log(chain);

    const { data: repaymentamount } = useReadContract({
      address: chain?.LendingContract,
      abi: LendingAbi,
      functionName: "calculateRepaymentAmount",
      args: [address, chain?.chainSelector],
      chainId: chain?.definition.id,
    });

    const { data: borrow } = useReadContract({
      address: chain?.LendingContract,
      abi: LendingAbi,
      functionName: "_userBorrow",
      args: [chain?.chainSelector, address],
      chainId: chain?.definition.id,
    });
    // console.log(borrow);

    const destinationChain = chains?.filter((chain) => {
      return chain.chainSelector == (borrow != undefined ? borrow[3] : 0);
    })[0];

    const sourceChain = chains.filter((chain) => {
      return chain.chainSelector == (borrow != undefined ? borrow[2] : 0);
    })[0];

    // console.log(
    //   destinationChain != undefined ? destinationChain.definition.id : 0
    // );

    const { data: fees } = useReadContract({
      address: destinationChain?.RouterContract,
      abi: routerAbi,
      functionName: "getFee",
      args: [destinationChain?.RouterContract || NATIVE_ADDRESS],
      chainId: destinationChain?.definition.id,
    });

    const { data: HealthFactor } = useReadContract({
      address: chain?.LendingContract,
      abi: LendingAbi,
      functionName: "HealthFactor",
      args: [address || NATIVE_ADDRESS],
      chainId: chain?.definition.id,
    });

    console.log(HealthFactor, chain?.definition.id);

    // console.log("Fees:", fees);

    if (borrow == undefined || borrow[2] != chain.chainSelector) {
      continue;
    }
    if (borrow != undefined) {
      console.log();

      loans.push({
        source: sourceChain,
        destination: destinationChain,
        repaymentamount: repaymentamount,
        fees: fees,
        HealthFactor: Number(HealthFactor) / 100,
      });
    }

    // console.log(repaymentamount);
  }
  console.log(loans);

  const handleClick = async (loan) => {
    console.log("Loan");

    switchChainAsync({ chainId: loan.destination?.definition.id });

    const hash1 = await writeContractAsync({
      address: loan?.destination?.LendingContract,
      abi: LendingAbi,
      functionName: "repayBorrowedAmount",
      value: [loan?.repaymentamount + loan?.fees],
      args: [loan?.source?.chainSelector, NATIVE_ADDRESS],
      chainId: loan.destination?.definition.id,
    });

    console.log("Hash1:", hash1);

    const sendReceipt = await waitForTransactionReceipt(config, {
      hash: hash1,
      chainId: loan?.destination?.definition.id,
    });

    console.log("Send Receipt:", sendReceipt);

    const sentMessage = parseEventLogs({
      abi: routerAbi,
      logs: sendReceipt.logs,
    }).flatMap(({ eventName, args }) =>
      eventName === "MessageSendRequested" ? [args] : []
    )[0];

    const { sentPingTimestamp } = await getBlock(config, {
      chainId: loan.destination?.definition.id,
      blockNumber: sendReceipt.blockNumber,
    });

    const { proof } = await approve.execute({
      messageHash: generateHash(sentMessage.message),
      fromTimestamp: Number(sentPingTimestamp) * 1000,
      chainSelector: loan.destination?.chainSelector,
    });

    await switchChainAsync({ chainId: loan.source?.definition.id });

    const hash2 = await writeContractAsync({
      address: loan.source?.RouterContract,
      abi: routerAbi,
      functionName: "deliverAndExecuteMessage",
      args: [sentMessage.message, sentMessage.messageData, BigInt(0), proof],
      chainId: loan.source?.definition.id,
    });

    const txRecipt2 = await waitForTransactionReceipt(config, {
      hash: hash2,
      chainId: loan.source?.definition.id,
    });
  };

  return (
    <>
      {loans.length > 0 ? (
        loans.map((loan) => {
          return (
            <div className="userLoan_card_container">
              <div className="userLoan_card_header">
                <h2>Amount</h2>
                <p>
                  {formatUnits(loan?.repaymentamount, 18) +
                    " " +
                    loan?.destination?.definition?.nativeCurrency?.symbol}
                </p>
              </div>
              <div className="userLoan_card_graph">
                <GaugeChart
                  id="gauge-chart1"
                  nrOfLevels={10}
                  colors={["green", "orange", "red"]}
                  arcWidth={0.3}
                  cornerRadius={3}
                  arcPadding={0.01}
                  percent={loan?.HealthFactor}
                  textColor={"white"}
                  style={{ width: "350px" }}
                  // hideText={true} // If you want to hide the text
                />
              </div>
              <p>Loan taken from : {loan?.source?.definition?.name}</p>
              <p>Loan taken to : {loan?.destination?.definition?.name}</p>
              <div className="userloan_payloan">
                <button
                  onClick={() => {
                    handleClick(loan);
                  }}
                >
                  Pay loan
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <>
          <div className="userLoan_card_container">You have No Loans</div>
        </>
      )}
    </>
  );
};

export default UserLoan;
