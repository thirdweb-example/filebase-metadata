// The purpose of this script is to mint an NFT using metadata you uploaded to filebase
// We use the contract address from script 1 to mint the NFT
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import dotenv from "dotenv";
dotenv.config();

// Replace this with your wallet address
const myAddress = "0xb371d1C5629C70ACd726B20a045D197c256E1054";

// Get the NFT Drop contract using the address produced from script 1
const myNftCollectionAddress = "0x7058A5f53347a305855bafc3eBDc8Be3D3ffe98c";

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, "goerli");

const nftCollection = sdk.getNFTCollection(myNftCollectionAddress);

// Your Filebase metadata info
const CID = "QmUKXciEhyYzLvj2D1AsbSYQfiMs2vVbhR87bntnzxytL2";

// Mint the NFT
const tx = await nftCollection.mint.to(myAddress, {
  name: "Your Filebase NFT",
  description: "NFT with Filebase IPFS metadata",
  image: `ipfs://${CID}`,
});

const nfts = await nftCollection.getAll();

console.log(nfts);
