// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <=0.9.0;

contract EtherStaking {
    address public owner;

    struct Position {
        uint positionId;
        address walletAddress;
        uint createdDate;
        uint unlockDate;
        uint percentInterest;
        uint weiStaked;
        uint weiInterest;
        bool open;
    }


    uint public currentPositionId;
    mapping(uint => Position) public positions;
    mapping(address => uint[]) public posiitonIdsByAddress;
    mapping(uint => uint) tiers;
    uint[] public dayLockPeriods;

    constructor() payable {
        owner = msg.sender;
        currentPositionId = 0;

        tiers[30] = 7;
        tiers[90] = 10;
        tiers[180] = 12;

        dayLockPeriods.push(30);
        dayLockPeriods.push(90);
        dayLockPeriods.push(180);
    }

    function stakeEther(uint numDays) external payable{
        require(tiers[numDays] > 0,"Mapping not found");

        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            block.timestamp,
            block.timestamp + (numDays * 1 days),
            tiers[numDays],
            msg.value,
            calculateInterest(tiers[numDays],msg.value),
            true
        );

        posiitonIdsByAddress[msg.sender].push(currentPositionId);
        currentPositionId += 1;
    }

    function calculateInterest(uint basisPoints,uint weiAmount) private pure returns(uint){
        return basisPoints / 100 * weiAmount;// 7/100 => 0.07 (7 percent)
    }

    function modifyLockPeriods(uint numDays, uint basisPoints) external {
        require(owner == msg.sender, "Only owner may modify staking period");

        tiers[numDays] = basisPoints;
        dayLockPeriods.push(numDays);
    }

    function getLockPeriods() external view returns(uint[] memory){
        return dayLockPeriods;
    }

    function getInterestRate(uint numDays) external view returns(uint){
        return tiers[numDays];
    }

    function getPositionbyId(uint positionId) external view returns(Position memory){
        return positions[positionId];
    }

    function getTierbyId(uint id) external view returns(uint){
        return tiers[id];
    }

    function getPositionIdsForAddress(address walletAddress) external view returns (uint[] memory){
        return posiitonIdsByAddress[walletAddress];
    }

    function changeUnlockDate(uint positionId, uint newUnlockDate) external {
        require(owner == msg.sender, "Only owner may modify staking periods");

        positions[positionId].unlockDate = newUnlockDate;
    }

    function closePosition(uint positionId) external {
        require(positions[positionId].walletAddress == msg.sender, "Only position creator may modify position");
        require(positions[positionId].open == true, "Position is closed");

        positions[positionId].open = false;

        if (block.timestamp > positions[positionId].unlockDate){
            uint amount = positions[positionId].weiStaked + positions[positionId].weiInterest;
            (bool success,) = payable(msg.sender).call{value: amount}("");
            require(success,"close position failed");
        } else {
            (bool success,) = payable(msg.sender).call{value : positions[positionId].weiStaked}("");
            require(success,"close position failed");
        }
    }
}
