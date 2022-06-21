// The purpose of this script is to batch mint NFTs using metadata you uploaded to filebase
// This script uses a csv file to batch mint the NFTs, rather than the AWS SDK that we used in script 3.
// We use the contract address from script 1 to mint the NFT
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

// Get the NFT Drop contract using the address produced from script 1
const myNftCollectionAddress = "0x7058A5f53347a305855bafc3eBDc8Be3D3ffe98c";
const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, "goerli");
const nftCollection = sdk.getNFTCollection(myNftCollectionAddress);

// Read in metadata from csv as a object
const metadata = fs.readFileSync("./metadata.csv", "utf8");
console.log(metadata);

const headers = metadata.split("\n")[0].split(",");
const rows = metadata.split("\n").slice(1);

// Create an array of objects from the rows of the csv
const metadataArray = rows.map((row) => {
  const rowArray = row.split(",");
  const rowObject = {};
  headers.forEach((header, index) => {
    // remove /n and /r
    rowObject[header.replace(/\n|\r/g, "")] = rowArray[index];
  });
  return rowObject;
});

const batchMint = await nftCollection.mintBatch(metadataArray);
