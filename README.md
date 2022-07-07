# Filebase NFT Metadata Example

This example demonstrates how you can use [Filebase](https://docs.filebase.com/) to store the metadata of your NFTs minted using thirdweb.

By default, thirdweb uploads your metadata to various IPFS providers behind the scenes for you. But sometimes, you may want more control of how you are storing the metadata of your NFTs, and a good way to do that is to use [Filebase](https://docs.filebase.com/).

## Tools

- [**Filebase**](https://portal.thirdweb.com/pre-built-contracts/pack): To upload our images and store them on IPFS using Filebase's SDK and GUI.
- [**Edition contract**](https://portal.thirdweb.com/pre-built-contracts/nft-collection): To create a collection of NFTs with metadata stored on Filebase.
- [**TypeScript SDK**](https://docs.thirdweb.com/typescript): To write [scripts](./scripts) that create and deploy our NFT Collection, and mint NFTs into.
- [**React SDK**](https://docs.thirdweb.com/react): We've also built a basic application to view all of the NFTs that are minted into our collection using our React SDK.

## Using This Repo

To create your own version of this template, you can use the following steps:

```bash
npx thirdweb create --template filebase-metadata
```

### Deploying NFT Collection

You can use the [thirdweb dashboard](https://thirdweb.com/dashboard) to deploy your NFT Collection.

In this example, we provide a script to deploy the NFT Collection contract using the SDK, inside [1-create-nft-collection.mjs](./scripts/1-create-nft-collection.mjs).

```jsx
const contractAddress = await sdk.deployer.deployNFTCollection({
  name: "My Filebase NFT Collection",
  primary_sale_recipient: "your-wallet-address",
});
```

### Minting an NFT with an Image uploaded via Filebase

Head to the [Filebase Console](https://console.filebase.com/), and upload an image file to a bucket using IPFS.

This produces a unique identifier that you can copy into the [2-mint-nft.mjs](./scripts/2-mint-nft.mjs) script.

```js
// Your Filebase file CID
const CID = "QmUKXciEhyYzLvj2D1AsbSYQfiMs2vVbhR87bntnzxytL2";
```

Then use this CID to mint an NFT using its identifier on IPFS:

```js
// Mint the NFT
const tx = await nftCollection.mint.to(myAddress, {
  name: "Your Filebase NFT",
  description: "NFT with Filebase IPFS metadata",
  image: `ipfs://${CID}`, // Using the CID here
});
```

### Batch Minting NFTs

[Filebase's S3-compatible API](https://docs.filebase.com/api-documentation/s3-compatible-api) can be used by several standardized S3-compatible frameworks, tools, clients and SDKs to manage data stored through Filebase.

This means we can use the [AWS SDK](https://docs.filebase.com/configurations/code-development/aws-sdk-javascript) to view information about our Filebase bucket.

In the [3-batch-mint-nfts.mjs](./scripts/3-batch-mint-nfts.mjs) script, we use the AWS SDK to list all of the files that are in our Filebase bucket.

With this information, we can get all of the `CID`s of the files that are in our bucket, and then use them to batch mint NFTs.

Firstly, we initialize the AWS S3 object using the access key and secret key we find on the Filebase Console.

```js
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
```

Then, we can list all of the files available in our bucket.

```js
// Function to list all the files in the bucket
const listFiles = function (params) {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// Call the listFiles function to get a list of all the files in the bucket defined in the params object
const files = await listFiles(params);
```

From here, we loop over the files, and get the `CID` of each file:

```js
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
```

Now we can use all of the CIDs to batch mint the NFTs.

```js
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
```

### Batch Mint NFTs using CSV File

Alternatively, we could generate a CSV file containing all of the CIDs, and then use that to batch mint the NFTs instead.

```js
// Read in metadata from csv as a object
const metadata = fs.readFileSync("./metadata.csv", "utf8");

const headers = metadata.split("\n")[0].split(",");
const rows = metadata.split("\n").slice(1);

// Create an array of objects from the rows of the csv
const metadataArray = rows.map((row) => {
  const rowArray = row.split(",");
  const rowObject = {};
  headers.forEach((header, index) => {
    rowObject[header.replace(/\n|\r/g, "")] = rowArray[index];
  });
  return rowObject;
});

const batchMint = await nftCollection.mintBatch(metadataArray);
```

### Creating a Web App to view NFTs

Inside the [index.js](./pages/index.js) file, we use the thirdweb React SDK to create a web app that can view the NFTs that we minted into this NFT Collection

```jsx
const { data: nfts, isLoading } = useNFTs(nftCollection);
```

We then `map` over the `nfts` array and use the `ThirdwebNftMedia` to render the metadata of the NFTs.

```jsx
{
  nfts?.map((nft) => (
    <div className={styles.nftBox} key={nft.metadata.id.toString()}>
      <ThirdwebNftMedia metadata={nft.metadata} className={styles.nftMedia} />
      <h3>{nft.metadata.name}</h3>
    </div>
  ));
}
```

## Join our Discord!

For any questions, suggestions, join our discord at [https://discord.gg/thirdweb](https://discord.gg/thirdweb).
