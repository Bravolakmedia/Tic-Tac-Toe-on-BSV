import { TicTacToe } from './src/contracts/ticTacToe'
import { bsv, PubKey, toHex, TestWallet, DefaultProvider } from 'scrypt-ts'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        'No "PRIVATE_KEY" found in .env, Please run "npm run genprivkey" to generate a private key'
    )
}

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    [privateKey], // Pass privateKey as an array
    new DefaultProvider({
        network: bsv.Networks.testnet,
    })
)

async function main() {
    await TicTacToe.loadArtifact()

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1000

    const aliceKey = bsv.PrivateKey.fromRandom('testnet')
    const bobKey = bsv.PrivateKey.fromRandom('testnet')
    const alice = PubKey(toHex(aliceKey.publicKey)) // Replace with Alice's public key
    const bob = PubKey(toHex(bobKey.publicKey)) // Replace with Bob's public key

    const instance = new TicTacToe(alice, bob)
    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log(`TicTacToe contract deployed: ${deployTx}`)
}

main()
