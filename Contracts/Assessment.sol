// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    constructor() payable {
        owner = payable(msg.sender);
        balance = msg.value;
    }

    function getBalance() external view returns (uint256) {
        return balance;
    }

    function deposit() external payable onlyOwner {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        balance += msg.value;
        emit Deposit(msg.sender, msg.value);

        assert(balance == address(this).balance);
    }

    function withdraw(uint256 _withdrawAmount) external onlyOwner {
        if (balance < _withdrawAmount) {
            revert InsufficientBalance(balance, _withdrawAmount);
        }

        balance -= _withdrawAmount;
        (bool success, ) = owner.call{value: _withdrawAmount}("");
        require(success, "Transfer failed");

        emit Withdraw(owner, _withdrawAmount);

        assert(balance == address(this).balance);
    }

    // This function is called for plain Ether transfers for every call with empty calldata.
    receive() external payable {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // This function is called when no other function matches.
    // It must be marked `payable` to accept Ether.
    fallback() external payable {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
