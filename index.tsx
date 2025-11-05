import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

const USD_PRICE = 2.672;
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '6v4DR5rkDFa3WdCQ35wvtfVYfk7i233Uiu6GmQ7JCdRu';

export default function Home() {
  const [provider, setProvider] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).solana && (window as any).solana.isPhantom) {
      setProvider((window as any).solana);
    }
    fetch('/api/price').then(r => r.json()).then(d => setSolPrice(d.sol_price)).catch(() => setSolPrice(null));
  }, []);

  async function connect() {
    if (!provider) return alert('Install Phantom wallet first');
    try {
      const resp = await provider.connect();
      setPublicKey(resp.publicKey.toString());
    } catch (err:any) {
      console.error(err);
      alert('Connection failed: ' + err?.message);
    }
  }

  async function mint() {
    if (!publicKey) return alert('Connect wallet first');
    if (!solPrice) return alert('SOL price not loaded');
    setLoading(true);

    try {
      const solAmount = USD_PRICE / solPrice;
      const lamports = Math.round(solAmount * 1e9);

      const toPubkey = new PublicKey(TREASURY);
      const tx = new Transaction();
      tx.add(SystemProgram.transfer({ fromPubkey: new PublicKey(publicKey), toPubkey, lamports }));

      tx.feePayer = new PublicKey(publicKey);
      const bhRes = await fetch('/api/blockhash');
      const bhJson = await bhRes.json();
      tx.recentBlockhash = bhJson.blockhash;

      const signed = await provider.signTransaction(tx);
      const raw = signed.serialize();
      const resp = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signedTx: Buffer.from(raw).toString('base64'), buyer: publicKey, expectedLamports: lamports }) });
      const json = await resp.json();
      if (!json.txid) { alert('Submission failed: ' + JSON.stringify(json)); setLoading(false); return; }

      const mintResp = await fetch('/api/mint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txid: json.txid, buyer: publicKey, expectedLamports: lamports }) });
      const mintJson = await mintResp.json();
      if (mintJson.success) { alert('Minted! NFT: ' + mintJson.nft + '\nTx: ' + json.txid); }
      else { alert('Mint failed: ' + JSON.stringify(mintJson)); }
    } catch (err:any) { console.error(err); alert('Mint flow error: ' + err?.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{maxWidth:800, margin:'40px auto', fontFamily:'Inter, system-ui'}}>
      <Head><title>softfund — Mint</title></Head>
      <h1>softfund — Mint</h1>
      <p>Price: ${USD_PRICE} USD</p>
      <p>Current SOL price: {solPrice ? `$${solPrice.toFixed(4)}` : 'loading...'}</p>
      <p>Treasury: {TREASURY}</p>
      {publicKey ? (
        <div>
          <div>Connected: {publicKey}</div>
          <button onClick={mint} style={{marginTop:12,padding:'8px 14px'}} disabled={loading}>{loading ? 'Processing…' : 'Mint (Pay)'}</button>
        </div>
      ) : (
        <button onClick={connect} style={{padding:'8px 14px'}}>Connect Phantom</button>
      )}
      <hr style={{marginTop:30}} />
      <small>Note: this flow will use your MINT_AUTH_PRIVATE_KEY to mint NFTs on server-side after payment verification.</small>
    </div>
  );
}

