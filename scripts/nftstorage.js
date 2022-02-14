const hre = require("hardhat");
const fs = require('fs')

const { NFTStorage, File } = require('nft.storage')


const fetch = require('node-fetch');

const {
  NFT_STORAGE_API_KEY  
} = require("../.env.js")

async function main() {
    const data = fs.readFileSync('./nft/collection/descriptor_0.json', 'utf8')
    const storage = new NFTStorage({ token: NFT_STORAGE_API_KEY })

    //await useNTFStorage_fetch(data, storage);
    //await useNTFStorage_basic(data, storage);
    //await useNTFStorage_advanced(data, storage);
    await useNTFStorage_directory(data, storage);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function useNTFStorage_fetch(data, storage) {
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
}

async function useNTFStorage_basic(data, storage) {
  // curl -X POST --data-binary @art.jpg -H 'Authorization: Bearer YOUR_API_KEY' https://api.nft.storage/upload
  const metadata = await storage.store({
    name: 'Descriptor file',
    description: 'File to specify the metadata of the nft',
    image: new File([data], 'description_0.json', { type: 'application/json' })
  });
  console.log({ metadata });
}

async function useNTFStorage_advanced(data, storage) {
  const metadata2 = await storage.store({
    name: 'nft.storage store test',
    description: 'Using the nft.storage metadata API to create ERC-1155 compatible metadata.',
    image: new File(
      [await fs.promises.readFile('./nft/collection/pinpie.png')], 
      'pinpie.png', 
      {type: 'image/png',}
    ),
    properties: {
      custom: 'Any custom data can appear in properties, files are automatically uploaded.',
      file: new File(
        [await fs.promises.readFile('./nft/collection/seamonster.png')],
        'seamonster.png',
        {type: 'image/png',}
      ),
    },
  })
  //console.log('IPFS URL for the metadata:', metadata2.url)
  //console.log('metadata.json contents:\n', metadata2.data)
  console.log(
    'metadata.json contents with IPFS gateway URLs:\n',
    metadata2.embed()
  )
}

async function useNTFStorage_directoryExample(data, storage) {
  const cid = await storage.storeDirectory([
    new File([await fs.promises.readFile('./nft/collection/pinpie.png')], 'pinpie.png'),
    new File([await fs.promises.readFile('./nft/collection/seamonster.png')], 'seamonster.png'),
  ])
  console.log({ cid })
  const status = await storage.status(cid)
  console.log(status)
}

async function useNTFStorage_directory(data, storage) {


  const cid = await storage.storeDirectory([
    new File([await fs.promises.readFile('./nft/collection/0')], "0".repeat(63)+'0'),
    new File([await fs.promises.readFile('./nft/collection/1')], "0".repeat(63)+'1'),
    new File([await fs.promises.readFile('./nft/collection/2')], "0".repeat(63)+'2'),
    new File([await fs.promises.readFile('./nft/collection/3')], "0".repeat(63)+'3'),
  ])
  
  console.log({ cid })
  const status = await storage.status(cid)
  console.log(status)

  const dataDescription = {
    "name": "Entret Planet",
    "description": "Created by [MarsAddiction](https://opensea.io/MarsAddiction?tab=created)\nEntret is a music vision created by Gutto Serta presenting Age of Smar Machine. In collaboration with Eralp Orkun Cihan and Feyza Aslan, this a 3D presentation from the sounds you hear. BONUS: the first 5 owners will get a copy of its original piece in a physical vinyl produced by Gutto Serta", 
    "image": `ipfs://${cid}/{id}`,
    "attributes": [ {
    }]
  }

  const response = await fetch('https://api.nft.storage/upload', {
    method: 'post',
    body: JSON.stringify(dataDescription),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + NFT_STORAGE_API_KEY,
      'Host': 'api.nft.storage'
    }
  });
  const data2 = await response.json();
  console.log({data2})
}

