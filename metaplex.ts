import { Connection, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';

export function getMetaplex() {
  const rpc = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const conn = new Connection(rpc, 'confirmed');

  if (!process.env.MINT_AUTH_PRIVATE_KEY) {
    throw new Error('MINT_AUTH_PRIVATE_KEY not set in env');
  }

  let keyJson;
  try {
    keyJson = JSON.parse(process.env.MINT_AUTH_PRIVATE_KEY);
  } catch (e) {
    throw new Error('MINT_AUTH_PRIVATE_KEY must be a JSON array string of the secretKey (Uint8Array)');
  }

  const secret = Uint8Array.from(keyJson);
  const keypair = Keypair.fromSecretKey(secret);

  const mx = Metaplex.make(conn)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage({
      address: 'https://node1.bundlr.network',
      providerUrl: rpc,
    }));

  return { mx, conn, keypair };
}
