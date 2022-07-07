// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <=0.9.0;

contract Ownable{
    // _owner is the owner of the token
    address private _owner;

    // event OwnershipTransferred is used to log that a ownership change of the token has occurred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Modifier, it require the current owner to be them same msg.sender
    modifier onlyOwner(){
        require(_owner == msg.sender , "Only owner can run this function.");
        _;
    } 

    constructor(){
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    function owner() public view returns(address){
        return _owner;
    }

    function transferredOwnership(address newOwner) public onlyOwner{
        _transferredOwnership(newOwner);
    }

    function _transferredOwnership(address newOwner) internal onlyOwner{
        require(newOwner != address(0),"New owner can not be the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
        
    }

    function renounceOwnership() public onlyOwner{
        _renounceOwnership();
    }

    function _renounceOwnership() internal{
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0); 
    }
}