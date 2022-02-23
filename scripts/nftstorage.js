const hre = require('hardhat')
const fs = require('fs')

const { NFTStorage, File, Blob } = require('nft.storage')

const fetch = require('node-fetch')

const { NFT_STORAGE_API_KEY } = require('../.env.js')

/*
async function main() {    
    const storage = new NFTStorage({ token: NFT_STORAGE_API_KEY })
    const cidDescription = await useNTFStorage_directory(storage);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  */

async function useNTFStorage_fetch(data, storage) {
  const response = await fetch('https://api.nft.storage/upload', {
    method: 'post',
    body: data,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + NFT_STORAGE_API_KEY,
      Host: 'api.nft.storage',
    },
  })
  const data2 = await response.json()
  console.log(data2.value.cid)
}

async function useNTFStorage_basic(data, storage) {
  // curl -X POST --data-binary @art.jpg -H 'Authorization: Bearer YOUR_API_KEY' https://api.nft.storage/upload
  const metadata = await storage.store({
    name: 'Descriptor file',
    description: 'File to specify the metadata of the nft',
    image: new File([data], 'description_0.json', { type: 'application/json' }),
  })
  console.log({ metadata })
}

async function useNTFStorage_advanced(data, storage) {
  const metadata2 = await storage.store({
    name: 'nft.storage store test',
    description:
      'Using the nft.storage metadata API to create ERC-1155 compatible metadata.',
    image: new File(
      [await fs.promises.readFile('./nft/collection/pinpie.png')],
      'pinpie.png',
      { type: 'image/png' },
    ),
    properties: {
      custom:
        'Any custom data can appear in properties, files are automatically uploaded.',
      file: new File(
        [await fs.promises.readFile('./nft/collection/seamonster.png')],
        'seamonster.png',
        { type: 'image/png' },
      ),
    },
  })
  //console.log('IPFS URL for the metadata:', metadata2.url)
  //console.log('metadata.json contents:\n', metadata2.data)
  console.log(
    'metadata.json contents with IPFS gateway URLs:\n',
    metadata2.embed(),
  )
}

async function useNTFStorage_directoryExample(data, storage) {
  const cid = await storage.storeDirectory([
    new File(
      [await fs.promises.readFile('./nft/collection/pinpie.png')],
      'pinpie.png',
    ),
    new File(
      [await fs.promises.readFile('./nft/collection/seamonster.png')],
      'seamonster.png',
    ),
  ])
  console.log({ cid })
  const status = await storage.status(cid)
  console.log(status)
}

async function useNTFStorage_directory(storage) {
  /*
  let range = n => [...Array(n).keys()]

  
  const files = range(4).map(index => index.toString()).map(index => {
    const buffer = await fs.promises.readFile(`./nft/collection/${index}`)
    return new File([buffer],"0".repeat(63)+index)
  })
*/
  const maxFiles = 4

  let fileCID = Array(maxFiles)
  let files = Array(maxFiles)
  for (index = 0; index < maxFiles; index++) {
    const buffer = await fs.promises.readFile(`./nft/collection/${index}`)
    files[index] = new File([buffer], '0'.repeat(63) + index)

    const cid = await storage.storeBlob(new Blob([buffer]))

    console.log({ cid })
    const status = await storage.status(cid)
    console.log(status)

    fileCID[index] = cid
  }

  /*
  const cidImages = await storage.storeDirectory(files)
  console.log({  cidImages })

  const status = await storage.status(cidImages)
  console.log(status)
  */

  let filesMetadata = Array(maxFiles)
  for (index = 0; index < maxFiles; index++) {
    const json = JSON.parse(
      fs.readFileSync(`./nft/collection/descriptor_${index}.json`),
    )

    json.image = `ipfs://${fileCID[index]}`
    fs.writeFileSync(
      `./nft/collection/descriptors/descriptor_${index}.json`,
      JSON.stringify(json, null, 2),
    )

    const buffer = await fs.promises.readFile(
      `./nft/collection/descriptors/descriptor_${index}.json`,
    )
    filesMetadata[index] = new File([buffer], '0'.repeat(63) + index)
  }

  const cidMetadata = await storage.storeDirectory(filesMetadata)
  console.log({ cidMetadata })

  const statusCidMetadata = await storage.status(cidMetadata)
  console.log(statusCidMetadata)

  // As we need the cids of the images for the descriptors, we are recreating the metadata files.
  // const cidMetadata = await storage.storeDirectory([])

  return statusCidMetadata
}

module.exports = useNTFStorage_directory
