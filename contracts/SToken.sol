//SPDX-License-Identifier:MIT

pragma solidity ^0.8.30;

//ERC20 import from openzeppelin to use in creation of token 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//MaxSupply import from openzeppelin
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

//import for burnable token 
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

//initial supply to owner of  70 million
//MaxSupply 
//Burnable inherited in this too 
contract Stoken is ERC20Capped,ERC20Burnable{
    address payable public owner;
   //Block reward functionality 
    uint256 public blockReward;
    constructor(uint256 cap,uint256 reward) ERC20("SToken","ST") ERC20Capped(cap * (10 ** decimals())){
       owner = payable(msg.sender);
 _mint(owner,70000000 * (10 ** decimals()));  
 blockReward=reward *(10 ** decimals());

  }
 
  //internal funtion cause we dont want this to call from outside of the contract
  function _mintMinerReward() internal {
     _mint(block.coinbase,blockReward);
  }  

  function _update(
    address from,
    address to,
    uint256 amount
) internal virtual override(ERC20,ERC20Capped) {
    // Mint miner reward on every transfer (except minting or reward minting itself)
    if (
        from != address(0) &&
        to != block.coinbase &&
        block.coinbase != address(0)
    ) {
        _mintMinerReward();
    }

    super._update(from, to, amount);
}

    
    //set block reward
 
  function setBlockreward (uint256 reward) public onlyOwner{
         blockReward = reward * (10 ** decimals());

  }
  function destroy() public onlyOwner{
    selfdestruct(owner);
  }
  //modifier  that will be used in setBlockreward function so that onlyOwner can set the blockreward
  modifier onlyOwner{
    require(msg.sender == owner , "only owner can call this function");
    _;
  }

}
 