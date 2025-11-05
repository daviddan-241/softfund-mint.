import { Connection } from '@solana/web3.js';

const RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export default async function handler(req, res) {
  try {
    const { signedTx } = req.body;
    if (!signedTx) return res.status(400).json({ error: 'missing signedTx' });

    const connection = new Connection(RPC, 'confirmed');
    const raw = Buffer.from(signedTx, 'base64');
    const txid = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(txid, 'finalized');
    res.status(200).json({ success: true, txid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
