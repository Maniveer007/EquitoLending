// import { ProgressLoader } from "@/components/ui/progress-loader";
// import { Button } from "@/components/ui/button";
// import { useAccount } from "wagmi";
// import { ReactNode } from "react";
// import { toast } from "sonner";
// import {
//   PingStatus,
//   usePingPong,
// } from "./providers/ping-pong/ping-pong-provider";
// import { useExecutePingPong } from "./providers/ping-pong/use-execute-ping-pong";
// import { useEquito } from "./providers/equito/equito-provider";

// export const PingButton = () => {
//   const { from, to } = useEquito();
//   const { pingMessage, status, pingFee, pongFee } = usePingPong();
//   const { execute, isPending } = useExecutePingPong();

//   const { address } = useAccount();
//   const isDisabled =
//     !from.chain ||
//     !to.chain ||
//     !pingMessage ||
//     !address ||
//     isPending ||
//     pingFee.fee === undefined ||
//     pongFee.fee === undefined ||
//     pingFee.isLoading ||
//     pongFee.isLoading;

//   const onClick = () => {
//     toast.promise(execute(), {
//       loading: "Executing transaction...",
//       success: "Transaction successful!",
//       error: "Transaction failed",
//     });
//   };

//   const sfn: Record<PingStatus, ReactNode> = {
//     isIdle: (
//       <Button disabled={isDisabled} onClick={onClick}>
//         Send Ping & Receive Pong
//       </Button>
//     ),
//     isSendingPing: (
//       <>
//         <ProgressLoader dir="from" />
//         <p className="text-muted-foreground text-sm">Sending ping...</p>
//       </>
//     ),
//     isApprovingSentPing: (
//       <>
//         <ProgressLoader dir="from" />
//         <p className="text-muted-foreground text-sm">
//           Waiting for ping approval...
//         </p>
//       </>
//     ),
//     isDeliveringPingAndSendingPong: (
//       <>
//         <ProgressLoader dir="from" />
//         <p className="text-muted-foreground text-sm">
//           Delivering ping and sending pong...
//         </p>
//       </>
//     ),
//     isApprovingSentPong: (
//       <>
//         <ProgressLoader dir="to" />
//         <p className="text-muted-foreground text-sm">
//           Waiting for pong approval...
//         </p>
//       </>
//     ),
//     isDeliveringPong: (
//       <>
//         <ProgressLoader dir="to" />
//         <p className="text-muted-foreground text-sm">Delivering pong...</p>
//       </>
//     ),
//     isSuccess: (
//       <>
//         <Button disabled={isDisabled} onClick={onClick}>
//           Send Ping & Receive Pong
//         </Button>
//         <p className="text-green-500 text-sm">Ping Pong Successful!</p>
//       </>
//     ),
//     isError: (
//       <>
//         <Button disabled={isDisabled} onClick={onClick}>
//           Retry
//         </Button>
//         <p className="text-destructive text-sm">Ping Pong Error</p>
//       </>
//     ),
//   };

//   return (
//     <div className="flex flex-col justify-center items-center gap-2 w-64">
//       {sfn[status]}
//     </div>
//   );
// };
