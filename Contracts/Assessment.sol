// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed recipient, uint256 amount);
    event Transfer(address indexed sender, address indexed recipient, uint256 amount);
    event BalanceIncreased(address indexed owner, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // emit the event
        emit Deposit(msg.sender, _amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");

        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // emit the event
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function transfer(address payable _recipient, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than zero");
        require(balance >= _amount, "Insufficient balance");

        // transfer funds
        _recipient.transfer(_amount);

        // update balance
        balance -= _amount;

        // emit the event
        emit Transfer(msg.sender, _recipient, _amount);
    }

    function increaseBalance(uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_amount > 0, "Amount must be greater than zero");

        balance += _amount;

        emit BalanceIncreased(owner, _amount);
    }
}
