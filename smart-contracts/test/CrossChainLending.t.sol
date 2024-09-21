// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {Router} from "../src/Router.sol";
import {IRouter} from "../src/interfaces/IRouter.sol";
import {IEquitoFees} from "../src/interfaces/IEquitoFees.sol";
import {CrossChainLending} from "../src/CrossChainLending.sol";
import {MockVerifier} from "./mock/MockVerifier.sol";
import {MockReceiver} from "./mock/MockReceiver.sol";
import {MockEquitoFees} from "./mock/MockEquitoFees.sol";
import {bytes64, EquitoMessage, EquitoMessageLibrary} from "../src/libraries/EquitoMessageLibrary.sol";
import {MockERC20} from "../src/examples/MockERC20.sol";
import {Errors} from "../src/libraries/Errors.sol";

/// @title CrossChainSwapTest
/// @dev Test suite for the CrossChainSwap contract
contract CrossChainLendingTest is Test {
    Router router;
    CrossChainLending lending;
    MockVerifier verifier;
    MockReceiver receiver;
    MockEquitoFees equitoFees;
    MockERC20 token0;

    address nativeToken = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address constant OWNER = address(0x03132);
    address constant ALICE = address(0xA11CE);
    address constant BOB = address(0xB0B);
    address equitoAddress = address(0x45717569746f);

    uint256 constant INITIAL_FEE = 0.1 ether;

    function setUp() public {
        vm.startPrank(OWNER);
        verifier = new MockVerifier();
        equitoFees = new MockEquitoFees();
        receiver = new MockReceiver();
        router = new Router(
            1,
            address(verifier),
            address(equitoFees),
            EquitoMessageLibrary.addressToBytes64(equitoAddress)
        );
        lending = new CrossChainLending(address(router));
        token0 = new MockERC20("Token0", "TK0", 1_000_000 ether);

        vm.deal(address(lending), 1_000 ether);
        token0.transfer(address(lending), 1_000 ether);
        uint256[] memory chainSelectors = new uint256[](2);
        chainSelectors[0] = 1;
        chainSelectors[1] = 1;
        address[] memory tokens = new address[](2);
        tokens[0] = address(token0);
        tokens[1] = nativeToken;
        uint256[] memory prices = new uint256[](2);
        prices[0] = 100 ;
        prices[1] = 100;
        uint256[] memory chainSelectorsforPeers = new uint256[](2);
        chainSelectorsforPeers[0] = 1;
        address[] memory peers = new address[](2);
        peers[0] = address(lending);
        lending.setLendingAddress(chainSelectorsforPeers, peers);
        lending.setTokenPrice(chainSelectors , tokens ,prices);
        vm.stopPrank();
    }

    
    function testFail_when_tokenPriceIsNotSet() public {
        lending.BorrowAmount(100,1, address(0x00156));
    }

    function testCrossChainLending_withNativeEth() public {

        address user = address(0x00156);
        vm.deal(user, 100 ether);
        vm.startPrank(user);
        CrossChainLending.Borrow memory borrow = CrossChainLending.Borrow({
            User: EquitoMessageLibrary.addressToBytes64(user) ,
            LoanAmount : 1 ether,
            sourceChainSelector : 1, //any source chain selector
            destinationChainSelector : 1, // destinarion chain selector of our router
            destinationChainToken : nativeToken,
            StartTime : block.timestamp
        });
        
        lending.giveCollateral{value:80 ether}();

        lending.BorrowAmount{value:router.getFee(address(this))}(1 ether,1, nativeToken);
        uint userBalanceBefore = address(user).balance;
        uint lendingBalanceBefore = address(lending).balance;
        bytes1 operationId = 0x01;
        bytes memory data = abi.encode(operationId,borrow);

        EquitoMessage memory message = EquitoMessage({
            blockNumber: 1,
            sourceChainSelector: 1,
            sender: EquitoMessageLibrary.addressToBytes64(address(lending)),
            destinationChainSelector: 1,
            receiver: EquitoMessageLibrary.addressToBytes64(address(lending)),
            hashedData: keccak256(data)
        });

        router.deliverAndExecuteMessage(
            message,
            data,
            0,
            bytes("0")
        );

        uint userBalanceAfter = address(user).balance;
        uint lendingBalanceAfter = address(lending).balance;

        assertEq(userBalanceAfter, userBalanceBefore + 1 ether);
        assertEq(lendingBalanceAfter, lendingBalanceBefore - 1 ether);     
        vm.stopPrank();
    }

    function testCrossChainLending_without_nativeEth() public {
            
            address user = address(0x00156);
            vm.deal(user, 100 ether);
            vm.startPrank(user);
            CrossChainLending.Borrow memory borrow = CrossChainLending.Borrow({
                User: EquitoMessageLibrary.addressToBytes64(user) ,
                LoanAmount : 1 ether,
                sourceChainSelector : 1, //any source chain selector
                destinationChainSelector : 1, // destinarion chain selector of our router
                destinationChainToken : address(token0),
                StartTime : block.timestamp
            });
            
            lending.giveCollateral{value:80 ether}();
    
            lending.BorrowAmount{value:router.getFee(address(this))}(1 ether,1, address(token0));
            uint userBalanceBefore = token0.balanceOf(user);
            uint lendingBalanceBefore = token0.balanceOf(address(lending));
            bytes1 operationId = 0x01;
            bytes memory data = abi.encode(operationId,borrow);
    
            EquitoMessage memory message = EquitoMessage({
                blockNumber: 1,
                sourceChainSelector: 1,
                sender: EquitoMessageLibrary.addressToBytes64(address(lending)),
                destinationChainSelector: 1,
                receiver: EquitoMessageLibrary.addressToBytes64(address(lending)),
                hashedData: keccak256(data)
            });
    
            router.deliverAndExecuteMessage(
                message,
                data,
                0,
                bytes("0")
            );
    
            uint userBalanceAfter = token0.balanceOf(user);
            uint lendingBalanceAfter = token0.balanceOf(address(lending));
    
            assertEq(userBalanceAfter, userBalanceBefore + 1 ether);
            assertEq(lendingBalanceAfter, lendingBalanceBefore - 1 ether);     
    }

    function test_liquidate() public {
        testCrossChainLending_without_nativeEth();
        address user = address(0x00156);
        vm.startPrank(OWNER);
        uint256[] memory chainSelectors = new uint256[](2);
        chainSelectors[0] = 1;
        chainSelectors[1] = 1;
        address[] memory tokens = new address[](2);
        tokens[0] = address(token0);
        tokens[1] = nativeToken;
        uint256[] memory prices = new uint256[](2);
        prices[0] = 10 ;
        prices[1] = 1000;

        lending.setTokenPrice(chainSelectors, tokens, prices);

        assertGe(lending.HealthFactor(user),90);

        address rand = vm.addr(70);
        vm.startPrank(rand);
        vm.deal(rand, 1 ether);

        uint randcollateralBefore = lending._balances(rand);
        lending.liquidate{value : router.getFee(address(this))}(user);

        CrossChainLending.Borrow memory borrow = CrossChainLending.Borrow({
                User: EquitoMessageLibrary.addressToBytes64(user) ,
                LoanAmount : 1 ether,
                sourceChainSelector : 1, //any source chain selector
                destinationChainSelector : 1, // destinarion chain selector of our router
                destinationChainToken : address(token0),
                StartTime : block.timestamp
            });
            
            uint lendingBalanceBefore = token0.balanceOf(address(lending));
            bytes1 operationId = 0x03; 
            bytes memory data = abi.encode(operationId,borrow);
    
            EquitoMessage memory message = EquitoMessage({
                blockNumber: 1,
                sourceChainSelector: 1,
                sender: EquitoMessageLibrary.addressToBytes64(address(lending)),
                destinationChainSelector: 1,
                receiver: EquitoMessageLibrary.addressToBytes64(address(lending)),
                hashedData: keccak256(data)
            });
    
            router.deliverAndExecuteMessage(
                message,
                data,
                0,
                bytes("0")
            );

        uint randcollateralAfter = lending._balances(rand);
        assertEq(randcollateralAfter, randcollateralBefore + 80 ether);

    }
}
