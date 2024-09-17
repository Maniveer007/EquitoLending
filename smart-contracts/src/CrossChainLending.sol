// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import {EquitoApp} from "./EquitoApp.sol";
import {bytes64, EquitoMessage} from "./libraries/EquitoMessageLibrary.sol";
import {IRouter} from "./interfaces/IRouter.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";
import {Errors} from "./libraries/Errors.sol";
import {EquitoMessageLibrary} from "./libraries/EquitoMessageLibrary.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title CrossChainSwap
/// @notice This contract facilitates token swaps between different blockchains using the Equito protocol.
contract CrossChainLending is EquitoApp {
    
    
    /// @notice Event emitted when a Borrow is requested.
    /// @param user the address of user requested borrow.
    event BorrowRequested(address user, bytes32 messageHash);

    /// @notice MAXIMUM Collateral ratio of the user collateral to the Borrow ammount.
    uint256 immutable COLLATERAL_RATIO;

    /// @notice LIQUIDATION_RATIO if the loan amount cross this ratio loan can be liquidated.
    uint256 immutable LIQUIDATION_RATIO;

    /// @notice FEES in percentage for every 30 days.
    uint256 immutable FEES_IN_PERCENTAGE_PER_30_DAYS; 
    
    /// @dev The address used to represent the native token.
    address internal constant NATIVE_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /// @notice Mapping to store the prices of supported tokens on different chains.
    /// @dev The first key is the chain selector, and the second key is the token address.
    mapping(uint256 => mapping(address => uint256)) public _tokenPrice;

    /// @notice Mapping to store Balances of user Collateral.
    /// @dev the key is User address.
    mapping(address => uint256) public _balances;

    /// @notice Mapping to store user borrow details of destination chain or source chain
    /// @dev the first key is chainselector
    /// @dev the second key is user address
    mapping(uint256 => mapping(address => Borrow)) public _userBorrow;

    constructor(address _router , uint256 _collateral , uint256 _fees) payable EquitoApp(_router) {
        COLLATERAL_RATIO = _collateral;
        FEES_IN_PERCENTAGE_PER_30_DAYS = _fees;
    }
 
    /// @notice Struct to store Borrow information.
    /// @param User The address of User requested Borrow.
    /// @param LoanAmount the LoanAmount of user taken in destination chain if native token in wei if ERC20 amount of erc20
    /// @param sourceChainSelector the source chain selector of the user Borrow.
    /// @param destiantionChainSelector the destination chain selector of the user Borrow.
    /// @param destinationChainToken the token borrowed to destination chain.
    /// @param StartTime start time of the loan.
    struct Borrow {
        bytes64 User;
        uint256 LoanAmount; 
        uint256 sourceChainSelector;
        uint256 destiantionChainSelector;
        address destinationChainToken;
        uint256 StartTime;
    }

    function _receiveMessageFromPeer(
        EquitoMessage calldata message, 
        bytes calldata messageData
    ) internal override {
        (string memory messageType , Borrow memory borrow ) = abi.decode(messageData , (string , Borrow));  
        if(keccak256(bytes(messageType)) == keccak256(bytes("BorrowRequesting"))){

            _userBorrow[message.sourceChainSelector]
                [EquitoMessageLibrary.bytes64ToAddress(borrow.User)] = borrow;
        
        if(borrow.destinationChainToken == NATIVE_TOKEN){
            TransferHelper.safeTransferETH(EquitoMessageLibrary.bytes64ToAddress(borrow.User), borrow.LoanAmount);
        }else{
            TransferHelper.safeTransfer(borrow.destinationChainToken,EquitoMessageLibrary.bytes64ToAddress(borrow.User),borrow.LoanAmount);
        } 
        }else if (keccak256(bytes(messageType)) == keccak256(bytes("repayBorrowedAmount"))){
            require(borrow.sourceChainSelector == router.chainSelector(),"This is not the Source chain of the loan");
            delete _userBorrow[router.chainSelector()][EquitoMessageLibrary.bytes64ToAddress(borrow.User)];
        }
        else if (keccak256(bytes(messageType)) == keccak256(bytes("Liquidate-Loan"))){
            delete _userBorrow[router.chainSelector()][EquitoMessageLibrary.bytes64ToAddress(borrow.User)];
        }

    }

    /// @notice BorrowAmount user borrow the amount on destination chain using the collateral on source chain.
    /// @param _amount The amount of source tokens.
    /// @param destinationChainSelector The identifier of the destination chain.
    /// @param destinationChainToken The address of the destination token.
    function BorrowAmount (
        uint _amount,
        uint destinationChainSelector,
        address destinationChainToken
        ) public payable {
        
        require(_userBorrow[router.chainSelector()][msg.sender].LoanAmount == 0,"User already has a loan");
        require(calculateDestinationMaximumBorrowAmount(msg.sender,destinationChainSelector,destinationChainToken) >= _amount,
        "user cannot withdraw greater than their max borrow amount");

        Borrow memory borrow = Borrow(
            EquitoMessageLibrary.addressToBytes64(msg.sender),
            _amount,
            router.chainSelector(),
            destinationChainSelector,
            destinationChainToken,
            block.timestamp
        );

        _userBorrow[router.chainSelector()][msg.sender] = borrow;

        bytes memory data = abi.encode("BorrowRequesting", borrow);
        bytes32 messageHash = router.sendMessage{value: msg.value}(
            getPeer(destinationChainSelector),
            destinationChainSelector,
            data
        );

        emit BorrowRequested( msg.sender , messageHash );
    }

    function repayBorrowedAmount (uint256 sourceChainSelectorOfLoan ,address token) public payable {
        
        bytes memory data = abi.encode("repayBorrowedAmount" , _userBorrow[sourceChainSelectorOfLoan][msg.sender]);

        bytes32 messageHash = router.sendMessage {value : router.getFee(address(this))}
        (
         getPeer(sourceChainSelectorOfLoan),
         sourceChainSelectorOfLoan,
         data
         );


        delete _userBorrow[sourceChainSelectorOfLoan][msg.sender];

        if ( token != NATIVE_TOKEN ){
            require (IERC20(token).balanceOf(msg.sender) >= calculateRepaymentAmount(msg.sender,sourceChainSelectorOfLoan) &&
            msg.value >= router.getFee(address(this)));
        }else{
            require(msg.value >= router.getFee(address(this)) + calculateRepaymentAmount(msg.sender,sourceChainSelectorOfLoan));
        }
    }


    function liquidate(address user ) public payable {
        require(HealthFactor(user)>90,"USER Loan is not Liquidatable");

        delete _userBorrow[router.chainSelector()][user];
        _balances[msg.sender] = _balances[user];
        _balances[user] = 0;

        bytes memory data = abi.encode("Liquidate-Loan" , _userBorrow[router.chainSelector()][msg.sender]);

        bytes32 messageHash = router.sendMessage {value : router.getFee(address(this))}
        (
         getPeer(_userBorrow[router.chainSelector()][user].destiantionChainSelector),
         _userBorrow[router.chainSelector()][user].destiantionChainSelector,
         data
        );
    }


    function calculateRepaymentAmount(address user ,uint256 sourceChainSelectorOfLoan)public view returns (uint256){
        Borrow memory borrow = _userBorrow[sourceChainSelectorOfLoan][user];

        return borrow.LoanAmount + (borrow.LoanAmount * FEES_IN_PERCENTAGE_PER_30_DAYS * ((block.timestamp - borrow.StartTime) / 30 days ) /100);
    }

    function calculateDestinationMaximumBorrowAmount(
        address user,
        uint256 destinationChainSelector,
        address destinationChainToken
    ) public view returns (uint256) {
        return
            (_balances[user] * _tokenPrice[router.chainSelector()][NATIVE_TOKEN] *COLLATERAL_RATIO) /
            (_tokenPrice[destinationChainSelector][destinationChainToken] * 100);
    }

    function setSwapAddress(
        uint256[] calldata chainSelectors,
        bytes64[] calldata swapAddresses
    ) external onlyOwner {
        _setPeers(chainSelectors, swapAddresses);
    }


    function setTokenPrice(
        uint256[] memory chainSelectors,
        address[] memory tokenAddress,
        uint256[] memory prices
    ) external onlyOwner {
        if (
            chainSelectors.length != prices.length  ||
            chainSelectors.length != tokenAddress.length
        ) revert Errors.InvalidLength();
        for (uint256 i = 0; i < chainSelectors.length; i++) {
            _tokenPrice[chainSelectors[i]][tokenAddress[i]] = prices[i];
        }
    }

    function HealthFactor(address user) public view returns(uint256){
        Borrow memory borrow = _userBorrow[router.chainSelector()][user];
        require(borrow.sourceChainSelector == router.chainSelector()
            ,"User is Not Taken Loan On This Account");
            /*
                loan amount on destination chain
            ________________________________________  x 100

                collateral amount on destination chain 
            */
        return (
            (borrow.LoanAmount * 100)
            / ((_balances[user] * _tokenPrice[borrow.destiantionChainSelector][borrow.destinationChainToken]) 
                /   _tokenPrice[router.chainSelector()][NATIVE_TOKEN]) 
        );

    }

    function giveCollateral() public payable {
        _balances[msg.sender] += msg.value;
    }

    receive() external payable {
        _balances[msg.sender] += msg.value; 
    }

    function testHealthFactor(uint loan , uint collateral) public pure returns(uint){
        return loan * 100 / collateral;
    }
}