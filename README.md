# Softfund — Full minting project (Metaplex)

WARNING: This project can mint real NFTs on Solana Mainnet and accept real SOL payments. **Do not deploy to Mainnet until you test on Devnet and you fully understand the security implications.**

## What this repo contains
- Next.js frontend that connects to Phantom and initiates a payment/mint flow.
- API endpoints to prepare/verify payments and to mint NFTs server-side using Metaplex.
- Supabase logging helper (optional) to persist minter records for later airdrops.
- An `airdrop` script to mint reward NFTs to all logged minters.

## Quick start (local / dev)
1. Create a `.env.local` file (do NOT commit this) with at least these values:
   ```env
   SOLANA_RPC_URL=https://api.devnet.solana.com   # use devnet for testing
   TREASURY_ADDRESS=6v4DR5rkDFa3WdCQ35wvtfVYfk7i233Uiu6GmQ7JCdRu
   MINT_AUTH_PRIVATE_KEY=[JSON array string of secretKey from Keypair.generate()]
   SUPABASE_URL=your_supabase_url_or_leave_blank
   SUPABASE_SERVICE_KEY=your_supabase_service_key_or_leave_blank
   METADATA_URI_BASE=https://your-hosted-metadata.example.com
   ```
2. Install dependencies: `npm install`
3. Run locally: `npm run dev`
4. Test the flow on Devnet with small amounts (use Phantom configured for Devnet).

## Deploy to Vercel
- Create a Vercel project and add the environment variables above as **Project** secrets.
- Deploy the project. To accept real funds, set `SOLANA_RPC_URL` to `https://api.mainnet-beta.solana.com` and ensure `TREASURY_ADDRESS` is your desired address.

## How the flow works
1. Frontend calculates SOL amount for $2.672 via CoinGecko and asks backend to prepare expectedLamports.
2. Frontend creates/sends a signed SOL transfer from buyer to treasury (client-side sign + send), then posts the payment txid to `/api/mint`.
3. Backend `/api/mint` verifies on-chain the treasury received the expected lamports, then uses Metaplex to create & mint an NFT to the buyer address.
4. Backend logs the mint in Supabase (if configured) for later airdrops.

## Airdrops
- Use `npm run airdrop` (requires MINT_AUTH_PRIVATE_KEY and SUPABASE keys) to mint reward NFTs to addresses in the `minters` table.
- Be aware minting thousands of NFTs on Mainnet costs significant SOL and storage fees.

## Security
- NEVER commit `MINT_AUTH_PRIVATE_KEY` to GitHub. Always store in Vercel env vars or a secure secret manager.
- Protect admin scripts; do not expose `/api/airdrop` publicly.
