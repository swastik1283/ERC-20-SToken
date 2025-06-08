const hre=require("hardhat");
async function main(){
  const Stoken= await hre.ethers.getContractFactory("Stoken");
  const stoken=await  Stoken.deploy(100000000,50);


  await stoken.deployed();
 
  
  console.log("STOKEN IS DEPLOYED",stoken.address);

}

main()
.then(()=>process.exit(0))
.catch((error)=>{
    console.error(error);
    process.exitCode=1;
});