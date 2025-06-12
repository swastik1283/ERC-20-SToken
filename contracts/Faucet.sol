//SPDX-License-Identifier:MIT

pragma solidity ^0.8.26;

//interface allowing one contrct to talk to other contract in the contract
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
    
}

contract Faucet {
    //state variable for contract owner
    address payable owner;
    IERC20 public token;
    uint256 public withdrawlAmount = 50 * (10 ** 18);
event Debug(address  indexed to,uint256 Nowtime,uint256 nextAllowed);
    //declare variable to hold timme interval
    uint256 public lockTime =  1 hours;

    //event

   event Withdraw(address indexed to ,uint256 indexed amount);

    event Deposit(address indexed from, uint256 indexed amount);

    //mapping to map address of user or wallet and the time interval
    mapping(address => uint256) nextAccessTime;
    constructor(address tokenAddress) payable {
        token = IERC20(tokenAddress);
        owner = payable(msg.sender);
    }
    function requestToken() public {
        emit Debug(msg.sender,block.timestamp,nextAccessTime[msg.sender]);
        require(
            msg.sender != address(0),
            "request must not originate from a zero account"
        );
        uint256 faucetBal= token.balanceOf(address(this));
        require(
            faucetBal >= withdrawlAmount,
            "insufficient balance in faucet for withdrawl"
        );
        require(
            block.timestamp >= nextAccessTime[msg.sender],
            "Insufficient time elapsed since last withdrawl try again later"
        );

        nextAccessTime[msg.sender] = block.timestamp + lockTime;
        bool success=token.transfer(msg.sender,withdrawlAmount);
         require(success,"transfer failed");
        
    }
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function setWithdrawlAmount(uint256 amount) public onlyOwner {
        withdrawlAmount = amount * (10 ** 18);
    }

    function setlockTime(uint256 amount) public onlyOwner {
        lockTime = amount * 1 hours;
    }

    function withdrawl() external onlyOwner {
        emit Withdraw(msg.sender,token.balanceOf(address(this)));
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner can call this function ");
        _;
    }
}
