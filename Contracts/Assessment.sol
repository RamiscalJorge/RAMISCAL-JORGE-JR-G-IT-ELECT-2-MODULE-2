// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public withdrawalLimit;
    mapping(address => bool) public whitelist;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    error UnauthorizedAccess();
    error InsufficientBalance(uint256 availableBalance, uint256 requestedAmount);
    error WithdrawalLimitExceeded(uint256 requestedAmount, uint256 limit);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "You are not whitelisted to perform this action");
        _;
    }

    constructor(uint256 _withdrawalLimit) payable {
        owner = payable(msg.sender);
        balance = msg.value;
        withdrawalLimit = _withdrawalLimit;
        whitelist[msg.sender] = true; // Owner is automatically whitelisted
    }

    function getBalance() external view returns (uint256) {
        return balance;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _withdrawAmount) external onlyWhitelisted {
        require(_withdrawAmount > 0, "Withdrawal amount must be greater than zero");
        require(_withdrawAmount <= withdrawalLimit, "Withdrawal amount exceeds the limit");
        require(balance >= _withdrawAmount, "Insufficient balance for withdrawal");

        balance -= _withdrawAmount;
        (bool success, ) = msg.sender.call{value: _withdrawAmount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function setWhitelist(address _address, bool _status) external onlyOwner {
        whitelist[_address] = _status;
    }

    function setWithdrawalLimit(uint256 _newLimit) external onlyOwner {
        withdrawalLimit = _newLimit;
    }

    receive() external payable {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    fallback() external payable {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
