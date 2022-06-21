// The purpose of this script is to batch mint NFTs using metadata you uploaded to filebase
// We use the AWS-SDK to dynamically load all the files in our bucket, download their IPFS CID, and use them to mint NFTS with.
// We use the contract address from script 1 to mint the NFT
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import dotenv from "dotenv";
dotenv.config();
import AWS from "aws-sdk";

// Get the NFT Drop contract using the address produced from script 1
const myNftCollectionAddress = "0x7058A5f53347a305855bafc3eBDc8Be3D3ffe98c";
const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, "goerli");
const nftCollection = sdk.getNFTCollection(myNftCollectionAddress);

// Now we make a request to Filebase using their API
const filebaseAccessKey = "C204DB8CF0CB8F1860ED"; // Get this from your Filebase bucket
const filebaseSecretKey = "WdL6qh5cdDyjHPzskoZQGbKBlVzkr15z8uhyRCP3"; // Get this from your Filebase bucket
const bucketName = "test-thirdweb-filebase-bucket"; // Get this from your Filebase bucket

// Initialize the AWS SDK so we can access our Filebase bucket and file information
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  accessKeyId: filebaseAccessKey,
  secretAccessKey: filebaseSecretKey,
  Bucket: bucketName,
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  s3ForcePathStyle: true,
});

const params = {
  Bucket: bucketName,
  MaxKeys: 20,
};

// Function to list all the files in the bucket
const listFiles = function (params) {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        console.log("Successfully listed objects in bucket");
        resolve(data);
      }
    });
  });
};

// Call the listFiles function to get a list of all the files in the bucket defined in the params object
const files = await listFiles(params);

// Function to get the metadata for a file
const getMetadata = function (file) {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: "test-thirdweb-filebase-bucket",
        Key: file.Key,
      },
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

// Loop over each file we retrieved from the get files, and get the metadata for each file.
const cids = [];
for (let i = 0; i < files.Contents.length; i++) {
  const file = files.Contents[i];
  const fileData = await getMetadata(file);
  const cid = fileData.Metadata.cid;
  cids.push(cid);
}

// Now we can use the CIDs array to batch mint some NFTs
const batchMint = await nftCollection.mintBatch(
  // Convert our array of IPFS CID's to objects with the CID as the image
  cids.map((c, i) => {
    return {
      name: i.toString(),
      image: `ipfs://${c}`,
    };
  })
);

// Take a look at how our nft collection looks now
const nfts = await nftCollection.getAll();
console.log(nfts);
