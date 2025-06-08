const chai = require("chai");
const { expect } = chai;
const { ethers } = require("hardhat");


console.log("Hardhat Ethers Test:", typeof ethers?.utils?.parseUnits === 'function');

describe("ethers utils", function () {
  it("should parse units", async function () {
    const value = ethers.utils.parseUnits("1", 18);
    console.log(value.toString()); // 1000000000000000000
  });
});

// rest of your tests here...

describe("Stoken contract", function () {
  //global variable
  let Token;
  let stoken;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 1000000000;
  let tokenBlockReward = 50;
   
  beforeEach(async function () {
    console.log("Ethers available?", ethers && ethers.utils && typeof ethers.utils.parseUnits === 'function');

    //fetching the ContractFactory
    Token = await ethers.getContractFactory("Stoken");

    //get Signers from hardhat provided accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    //deploying the contract with cap and reward
    stoken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    //test to make sure owner is the one who deployed the contract
    it("should set the right owner", async function () {
      expect(await stoken.owner()).to.equal(owner.address);
    });

    // total supply =owner balance
    it("should asign the total supply of token to the owner", async function () {
      const ownerBalance = await stoken.balanceOf(owner.address);
     expect((await stoken.totalSupply()).toString()).to.equal(ownerBalance.toString()); 
    });

    //max capset
    it("should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await stoken.cap();
      expect(Number(ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    //block reward set
    it("should set the blockReward to the argumnt provided during deployment", async function () {
      const blockReward = await stoken.blockReward();
      expect(Number(ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });

  describe("Transactions", function () {
    it("should tranfer token between account", async function () {
      //Transfer 50 token from owner to addr1
      await stoken.transfer(addr1.address, 50);
      const addr1Balance = await stoken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("50");


      //Transfer 50 token from addr1 to addr2
      //We use .connect(signer) to send a transaaction from another account
      await stoken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await stoken.balanceOf(addr2.address);
      expect(addr2Balance.toString()).to.equal("50"); // ✅
 

    });

    it("Should fall if sender doesnt have enough token ", async function () {
      const initialOwnerBalance = await stoken.balanceOf(owner.address);
      //try to send 1 token from addr1 (0token) to owner(1000000 token)
      //'require' will evaluate false and revert the transaction
       try {
    // this should fail
    await stoken.connect(addr1).transfer(owner.address, 1);
    // if above line does NOT throw, fail the test explicitly:
    expect.fail("Expected transfer to fail but it succeeded");
  } catch (error) {
    // check that the error message contains "transfer amount exceeds balance"
    expect(error.message).to.include("VM Exception");

  }

      //owner balance shouldn't be affected
      expect((await stoken.balanceOf(owner.address)).toString()).to.equal(initialOwnerBalance.toString());
    });

    it("should update balance after transfer", async function () {
      const initialOwnerBalance = await stoken.balanceOf(owner.address);

      //transfer token from owner to addr1
      await stoken.transfer(addr1.address, 100);

      //tansfer token from owner to addr2
      await stoken.transfer(addr2.address, 50);

      const finalOwnerBalance = await stoken.balanceOf(owner.address);
      expect(finalOwnerBalance.toString()).to.equal(initialOwnerBalance.sub(150).toString());

      const addr1Balance = await stoken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("100");

      const addr2Balance = await stoken.balanceOf(addr2.address);
      expect(addr2Balance.toString()).to.equal("50");
    });
  });
});
