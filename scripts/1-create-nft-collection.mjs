// The outcome of this script is the contract address of the NFT Drop you deploy!
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import dotenv from "dotenv";
dotenv.config();

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, "goerli");

// Replace this with your wallet address
const myAddress = "0xb371d1C5629C70ACd726B20a045D197c256E1054";

const contractAddress = await sdk.deployer.deployNFTCollection({
  name: "My Filebase NFT Collection",
  primary_sale_recipient: myAddress,
});

console.log("NFT Collection deployed:", contractAddress);
