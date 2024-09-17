// import { useCallback } from "react";
// import { waitForTransactionReceipt } from "@wagmi/core";
// import { pingPongAbi } from "@/lib/abi/ping-pong.abi";

// import {
//   useWriteContract,
//   useWaitForTransactionReceipt,
//   useAccount,
//   useSwitchChain,
// } from "wagmi";
// import { config } from "@/lib/wagmi";
// import { usePingPong } from "@/components/providers/ping-pong/ping-pong-provider";
// import { useEquito } from "../equito/equito-provider";

// export const useSendPing = () => {
//   const { from, to } = useEquito();
//   const { address } = useAccount();
//   const { switchChainAsync } = useSwitchChain();
//   const { pingMessage, pingFee } = usePingPong();

//   const {
//     data: hash,
//     writeContractAsync,
//     isPending,
//     reset,
//   } = useWriteContract();

//   const {
//     isLoading: isConfirming,
//     isSuccess,
//     isError,
//   } = useWaitForTransactionReceipt({
//     hash,
//     chainId: from.chain?.definition.id,
//     query: {
//       enabled: !!hash && from.chain?.definition.id !== undefined,
//     },
//   });

//   const execute = useCallback(async () => {
//     if (!address) throw new Error("No address found, please connect a wallet");
//     if (!from.chain) throw new Error("No from chain found");
//     if (!to.chain) throw new Error("No to chain found");
//     if (pingFee.fee === undefined) {
//       throw new Error("Fee not found");
//     }
//     if (pingMessage === undefined) {
//       throw new Error("Ping message not found");
//     }

//     try {
//       // make sure we are on the from chain
//       await switchChainAsync({ chainId: from.chain.definition.id });

//       const hash = await writeContractAsync({
//         address: from.chain.pingPongContract,
//         abi: pingPongAbi,
//         functionName: "sendPing",
//         value: pingFee.fee,
//         chainId: from.chain.definition.id,
//         args: [BigInt(to.chain.chainSelector), pingMessage],
//       });

//       return await waitForTransactionReceipt(config, {
//         hash,
//         chainId: from.chain.definition.id,
//       });
//     } catch (error) {
//       console.log({ error });
//       throw new Error("Send ping failed");
//     }
//   }, [
//     address,
//     from.chain,
//     to.chain,
//     pingFee.fee,
//     pingMessage,
//     switchChainAsync,
//     writeContractAsync,
//   ]);

//   return {
//     isPending,
//     isConfirming,
//     isSuccess,
//     isError,
//     execute,
//     reset,
//   };
// };
