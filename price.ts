import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const j = await r.json();
    const sol = j?.solana?.usd || null;
    res.status(200).json({ sol_price: sol });
  } catch (err) {
    res.status(500).json({ error: 'price fetch failed' });
  }
}
