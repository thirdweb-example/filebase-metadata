import {
  ThirdwebNftMedia,
  useNFTCollection,
  useNFTs,
} from "@thirdweb-dev/react";
import React from "react";
import styles from "../styles/Home.module.css";

export default function NFTCollection() {
  const nftCollection = useNFTCollection(
    "0x7058A5f53347a305855bafc3eBDc8Be3D3ffe98c"
  );
  const { data: nfts, isLoading } = useNFTs(nftCollection);

  console.log(nfts);

  return (
    <div className={styles.container}>
      <div className={styles.collectionContainer}>
        <div className={styles.detailPageContainer}>
          <h1>My Filebase NFT Collection</h1>
          <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />
        </div>

        {!isLoading ? (
          <div className={styles.nftBoxGrid}>
            {nfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
    </div>
  );
}
