import { Connection } from '@solana/web3.js';
const RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export default async function handler(req, res) {
  try {
    const conn = new Connection(RPC, 'confirmed');
    const { blockhash } = await conn.getLatestBlockhash('finalized');
    res.status(200).json({ blockhash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
