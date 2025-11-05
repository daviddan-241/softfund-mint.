import { PublicKey } from '@solana/web3.js';
import { getMetaplex } from '../../lib/metaplex';
import { getSupabase } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const { txid, buyer, expectedLamports } = req.body;
    if (!txid || !buyer || !expectedLamports) return res.status(400).json({ error: 'missing params' });

    const { conn } = getMetaplex();
    const parsed = await conn.getParsedTransaction(txid, { commitment: 'finalized' });
    if (!parsed) return res.status(404).json({ error: 'tx not found or not finalized' });

    const keys = parsed.transaction.message.accountKeys.map(k => k.pubkey.toString());
    const treasury = process.env.TREASURY_ADDRESS;
    const idx = keys.indexOf(treasury);
    if (idx === -1) return res.status(400).json({ error: 'treasury not involved' });

    const pre = parsed.meta?.preBalances?.[idx] || 0;
    const post = parsed.meta?.postBalances?.[idx] || 0;
    const received = post - pre;
    if (received < expectedLamports) return res.status(400).json({ error: 'insufficient funds', received });

    const { mx } = getMetaplex();
    const metadataUri = (process.env.METADATA_URI_BASE || '') + '/softfund.json';
    const { nft } = await mx.nfts().create({
      uri: metadataUri,
      name: `softfund-${Date.now()}`,
      sellerFeeBasisPoints: 0,
      tokenOwner: new PublicKey(buyer)
    });

    try {
      const supa = getSupabase();
      if (supa) {
        await supa.from('minters').insert([{ buyer_pubkey: buyer, payment_txid: txid, nft_mint_address: nft.address.toString(), created_at: new Date().toISOString() }]);
      }
    } catch (e) {
      console.error('supabase log failed', e);
    }

    return res.status(200).json({ success: true, nft: nft.address.toString(), txid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

