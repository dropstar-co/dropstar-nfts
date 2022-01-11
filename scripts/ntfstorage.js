const hre = require("hardhat");
const fs = require('fs')

const { NFTStorage, File } = require('nft.storage')
const fetch = require('node-fetch');

const {
  NFT_STORAGE_API_KEY  
} = require("../.env.js")

async function main() {
  {

    const data = fs.readFileSync('./nft/collection/descriptor_0.json', 'utf8')
    //console.log({data})
    const response = await fetch('https://api.nft.storage/upload', {
      method: 'post',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + NFT_STORAGE_API_KEY,
        'Host': 'api.nft.storage'
      }
    });
    const data2 = await response.json();
    console.log(data2.value.cid);


    /*
    curl -X POST --data-binary @art.jpg -H 'Authorization: Bearer YOUR_API_KEY' https://api.nft.storage/upload
    */


    
    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY })
        
    const metadata = await client.store({
      name: 'Descriptor file',
      description: 'File to specify the metadata of the nft',
      image: new File([data], 'description_0.json', { type: 'application/json' })
    })

    console.log({metadata})
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
