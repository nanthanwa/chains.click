#!/usr/bin/env npx tsx
/**
 * Populate Cloudflare KV with chain data
 *
 * This script uploads chain data to Cloudflare KV for edge caching.
 * Run after sync-chains.ts to update the KV store.
 *
 * Usage:
 *   npx tsx scripts/populate-kv.ts
 *
 * Environment variables:
 *   CLOUDFLARE_ACCOUNT_ID - Cloudflare account ID
 *   CLOUDFLARE_API_TOKEN - API token with KV write permissions
 *   KV_NAMESPACE_ID - KV namespace ID to populate
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/lib/data');

// KV keys matching the cache.ts definitions
const KV_KEYS = {
	CHAINS_MINI: 'chains:mini',
	CHAINS_EIP3085: 'chains:eip3085',
	STATS: 'chains:stats',
	LAST_UPDATED: 'meta:lastUpdated'
};

interface KVBulkWriteItem {
	key: string;
	value: string;
	expiration_ttl?: number;
}

async function populateKV() {
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
	const apiToken = process.env.CLOUDFLARE_API_TOKEN;
	const namespaceId = process.env.KV_NAMESPACE_ID;

	if (!accountId || !apiToken || !namespaceId) {
		console.log('⚠️  Missing environment variables for KV population');
		console.log('   Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, KV_NAMESPACE_ID');
		console.log('   Skipping KV population (static JSON will be used)');
		return;
	}

	console.log('📦 Populating Cloudflare KV with chain data...');

	try {
		// Read data files
		const chainsMini = fs.readFileSync(path.join(DATA_DIR, 'chains-mini.json'), 'utf-8');
		const chainsEIP3085 = fs.readFileSync(path.join(DATA_DIR, 'chains-eip3085.json'), 'utf-8');
		const stats = fs.readFileSync(path.join(DATA_DIR, 'stats.json'), 'utf-8');

		// Prepare bulk write items
		const items: KVBulkWriteItem[] = [
			{ key: KV_KEYS.CHAINS_MINI, value: chainsMini },
			{ key: KV_KEYS.CHAINS_EIP3085, value: chainsEIP3085 },
			{ key: KV_KEYS.STATS, value: stats },
			{ key: KV_KEYS.LAST_UPDATED, value: JSON.stringify(new Date().toISOString()) }
		];

		// Also store individual chain data for faster lookups
		const chainsEIP3085Obj = JSON.parse(chainsEIP3085);
		for (const [chainId, chainData] of Object.entries(chainsEIP3085Obj)) {
			items.push({
				key: `chain:${chainId}`,
				value: JSON.stringify(chainData)
			});
		}

		// Upload in batches (KV bulk write limit is 10,000 items)
		const BATCH_SIZE = 100;
		let uploaded = 0;

		for (let i = 0; i < items.length; i += BATCH_SIZE) {
			const batch = items.slice(i, i + BATCH_SIZE);

			const response = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/bulk`,
				{
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${apiToken}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(batch)
				}
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`KV bulk write failed: ${response.status} ${error}`);
			}

			uploaded += batch.length;
			console.log(`   Uploaded ${uploaded}/${items.length} items...`);
		}

		console.log('✅ KV population complete!');
		console.log(`   Total items: ${items.length}`);
		console.log(`   Namespace: ${namespaceId}`);

	} catch (error) {
		console.error('❌ KV population failed:', error);
		process.exit(1);
	}
}

// Run if called directly
populateKV();
