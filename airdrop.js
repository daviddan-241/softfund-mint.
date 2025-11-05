require('dotenv').config();
const { getMetaplex } = require('../lib/metaplex');
const { createClient } = require('@supabase/supabase-js');

async function run() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Supabase not configured in env; aborting');
    process.exit(1);
  }
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await supa.from('minters').select('buyer_pubkey').limit(10000);
  if (error) throw error;
  const { mx } = getMetaplex();
  for (const row of data) {
    const buyer = row.buyer_pubkey;
    const { nft } = await mx.nfts().create({
      uri: (process.env.METADATA_URI_BASE || '') + '/reward.json',
      name: 'softfund Reward',
      sellerFeeBasisPoints: 0,
      tokenOwner: buyer
    });
    console.log('minted reward to', buyer, nft.address.toString());
  }
}

run().catch(console.error);
