import { TokenStandard, createV1, mintV1 } from "@metaplex-foundation/mpl-token-metadata";
import { KeypairSigner, PublicKey, generateSigner, publicKey } from "@metaplex-foundation/umi";
import * as fs from "fs"
import * as bs58 from "bs58";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  Umi,
  createSignerFromKeypair,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import { web3JsEddsa } from "@metaplex-foundation/umi-eddsa-web3js";
import { web3JsRpc } from "@metaplex-foundation/umi-rpc-web3js";
import { fetchHttp } from "@metaplex-foundation/umi-http-fetch";

// const walletAdapter: WalletAdapter = {
//   publicKey: payer.publicKey, //I might need to fill
// };

export const umi = createUmi("https://api.devnet.solana.com")
  .use(web3JsEddsa())
  .use(web3JsRpc("https://api.devnet.solana.com", {httpAgent: false}))
  .use(fetchHttp())
//   .use(bundlrUploader())

let secretKey = bs58.decode("3VXnem4KDbvF1Z7eCZuF7z5sVrmWwTvUkVW1Est9YXjvzZmoNKA8BxVq6z5bQgFbYJFw6hVa8TWxrVT8TpS4osyo")
const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(keypairIdentity(myKeypairSigner));

console.log("UMI SETUP")

async function createToken(mint: KeypairSigner) {
    await createV1(umi, {
        mint,
        authority: umi.payer,
        name: "USDC-R",
        uri: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
        sellerFeeBasisPoints: percentAmount(5),
        decimals: 6,
        tokenStandard: TokenStandard.Fungible
    }).sendAndConfirm(umi)
    console.log({"usdc-h": mint.publicKey})
}

async function mintToken(mint: PublicKey) {
    const tx = await mintV1(umi, {
        mint,
        authority: umi.payer,
        amount: 1_000_000,
        tokenOwner: umi.payer.publicKey,
        tokenStandard: TokenStandard.Fungible
    }).sendAndConfirm(umi)
    console.log({"mint-tx": bs58.encode(tx.signature)})
}

async function main() {
    // const mint = generateSigner(umi)
    // createToken(mint)
    let mintPubkey = publicKey("GChq3tnLMwzaEk739o7gBeBHeoTCjgu9eHt39qBcvK2s")
    await mintToken(mintPubkey)
    
}

main().then(() => {
    console.log("DONE")
}).catch((error) => {
    console.log("Error")
    console.log(error)
})