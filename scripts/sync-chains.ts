#!/usr/bin/env npx tsx
/**
 * Sync chain data from ethereum-lists/chains repository
 * Generates optimized JSON files for frontend consumption
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CHAINS_REPO_API = 'https://api.github.com/repos/ethereum-lists/chains/contents/_data/chains';
const CUSTOM_CHAINS_DIR = join(process.cwd(), '_data', 'custom', 'chains');
const CUSTOM_ICONS_DIR = join(process.cwd(), '_data', 'custom', 'icons');
const ICONS_REPO_API = 'https://api.github.com/repos/ethereum-lists/chains/contents/_data/icons';
const RAW_BASE_URL = 'https://raw.githubusercontent.com/ethereum-lists/chains/master/_data';

interface ChainData {
	name: string;
	chain: string;
	shortName: string;
	chainId: number;
	networkId: number;
	rpc: string[];
	faucets?: string[];
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	infoURL?: string;
	explorers?: Array<{
		name: string;
		url: string;
		standard?: string;
		icon?: string;
	}>;
	icon?: string;
	features?: Array<{ name: string }>;
	status?: string;
	slip44?: number;
	ens?: { registry: string };
	parent?: {
		type: string;
		chain: string;
		bridges?: Array<{ url: string }>;
	};
	redFlags?: string[];
}

interface IconData {
	url: string;
	width: number;
	height: number;
	format: string;
}

interface ChainMini {
	id: number;
	name: string;
	symbol: string;
	chain: string;
	icon?: string;
	rpcCount: number;
	isTestnet: boolean;
	status?: string;
}

interface ChainFull extends ChainData {
	iconUrl?: string;
}

interface ChainEIP3085 {
	chainId: string;
	chainName: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: string[];
	blockExplorerUrls?: string[];
	iconUrls?: string[];
}

// Testnet detection patterns
const TESTNET_PATTERNS = [
	/testnet/i,
	/sepolia/i,
	/goerli/i,
	/rinkeby/i,
	/ropsten/i,
	/kovan/i,
	/mumbai/i,
	/fuji/i,
	/alfajores/i,
	/baklava/i,
	/chapel/i,
	/devnet/i,
	/stagenet/i
];

function isTestnet(chain: ChainData): boolean {
	const nameCheck = TESTNET_PATTERNS.some(pattern => pattern.test(chain.name));
	const shortNameCheck = TESTNET_PATTERNS.some(pattern => pattern.test(chain.shortName));
	const hasTestFaucets = chain.faucets && chain.faucets.length > 0;
	return nameCheck || shortNameCheck || (hasTestFaucets && chain.chainId > 1);
}

// Filter and validate RPC URLs
function filterRpcUrls(rpcs: string[]): string[] {
	return rpcs
		.filter(rpc => {
			// Only allow HTTPS URLs (no HTTP, no WS for security)
			if (!rpc.startsWith('https://')) return false;
			// Filter out URLs with API key placeholders
			if (rpc.includes('${') || rpc.includes('API_KEY') || rpc.includes('INFURA')) return false;
			return true;
		})
		.slice(0, 5); // Limit to 5 RPCs per chain
}

// Convert chainId to hex string
function toHexChainId(chainId: number): string {
	return '0x' + chainId.toString(16);
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'chains.click-sync'
				}
			});
			if (response.ok) return response;
			if (response.status === 403) {
				console.warn('Rate limited, waiting 60s...');
				await new Promise(r => setTimeout(r, 60000));
				continue;
			}
			throw new Error(`HTTP ${response.status}`);
		} catch (error) {
			if (i === retries - 1) throw error;
			await new Promise(r => setTimeout(r, 1000 * (i + 1)));
		}
	}
	throw new Error('Max retries exceeded');
}

async function fetchChainFiles(): Promise<string[]> {
	console.log('Fetching chain file list...');
	const response = await fetchWithRetry(CHAINS_REPO_API);
	const files = await response.json() as Array<{ name: string; download_url: string }>;
	return files
		.filter(f => f.name.startsWith('eip155-') && f.name.endsWith('.json'))
		.map(f => f.name);
}

async function fetchChainData(filename: string): Promise<ChainData | null> {
	try {
		const url = `${RAW_BASE_URL}/chains/${filename}`;
		const response = await fetch(url);
		if (!response.ok) return null;
		return await response.json() as ChainData;
	} catch (error) {
		console.warn(`Failed to fetch ${filename}:`, error);
		return null;
	}
}

async function fetchIconData(iconName: string): Promise<IconData[] | null> {
	try {
		const url = `${RAW_BASE_URL}/icons/${iconName}.json`;
		const response = await fetch(url);
		if (!response.ok) return null;
		return await response.json() as IconData[];
	} catch {
		return null;
	}
}

function getIconUrl(icons: IconData[] | null): string | undefined {
	if (!icons || icons.length === 0) return undefined;
	// Prefer PNG, then SVG
	const icon = icons.find(i => i.format === 'png') || icons.find(i => i.format === 'svg') || icons[0];
	return icon?.url;
}

// Load custom chains from _data/custom/chains
function loadCustomChains(): ChainFull[] {
	const customChains: ChainFull[] = [];

	if (!existsSync(CUSTOM_CHAINS_DIR)) {
		return customChains;
	}

	const files = readdirSync(CUSTOM_CHAINS_DIR)
		.filter(f => f.startsWith('eip155-') && f.endsWith('.json'));

	console.log(`Found ${files.length} custom chain file(s)`);

	for (const filename of files) {
		try {
			const filePath = join(CUSTOM_CHAINS_DIR, filename);
			const content = readFileSync(filePath, 'utf-8');
			const chain = JSON.parse(content) as ChainData;

			// Load custom icon if available
			let iconUrl: string | undefined;
			if (chain.icon && existsSync(CUSTOM_ICONS_DIR)) {
				const iconPath = join(CUSTOM_ICONS_DIR, `${chain.icon}.json`);
				if (existsSync(iconPath)) {
					try {
						const iconData = JSON.parse(readFileSync(iconPath, 'utf-8')) as IconData[];
						iconUrl = getIconUrl(iconData);
					} catch {
						console.warn(`Failed to load icon for ${chain.name}`);
					}
				}
			}

			customChains.push({ ...chain, iconUrl });
			console.log(`  Loaded custom chain: ${chain.name} (${chain.chainId})`);
		} catch (error) {
			console.warn(`Failed to load ${filename}:`, error);
		}
	}

	return customChains;
}

async function main() {
	console.log('Starting chain data sync...');
	const startTime = Date.now();

	// Fetch all chain files
	const chainFiles = await fetchChainFiles();
	console.log(`Found ${chainFiles.length} chain files`);

	// Fetch chain data in batches to avoid rate limiting
	const chains: ChainFull[] = [];
	const iconCache = new Map<string, IconData[] | null>();
	const batchSize = 50;

	for (let i = 0; i < chainFiles.length; i += batchSize) {
		const batch = chainFiles.slice(i, i + batchSize);
		console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chainFiles.length / batchSize)}...`);

		const results = await Promise.all(
			batch.map(async (filename) => {
				const chain = await fetchChainData(filename);
				if (!chain) return null;

				// Fetch icon if available
				let iconUrl: string | undefined;
				if (chain.icon) {
					if (!iconCache.has(chain.icon)) {
						iconCache.set(chain.icon, await fetchIconData(chain.icon));
					}
					iconUrl = getIconUrl(iconCache.get(chain.icon) || null);
				}

				return { ...chain, iconUrl } as ChainFull;
			})
		);

		chains.push(...results.filter((c): c is ChainFull => c !== null));

		// Small delay between batches
		if (i + batchSize < chainFiles.length) {
			await new Promise(r => setTimeout(r, 500));
		}
	}

	console.log(`Fetched ${chains.length} chains from ethereum-lists`);

	// Load and merge custom chains
	const customChains = loadCustomChains();
	const existingChainIds = new Set(chains.map(c => c.chainId));

	for (const customChain of customChains) {
		if (existingChainIds.has(customChain.chainId)) {
			console.log(`  Skipping custom chain ${customChain.chainId} - already exists in ethereum-lists`);
		} else {
			chains.push(customChain);
			console.log(`  Added custom chain: ${customChain.name} (${customChain.chainId})`);
		}
	}

	console.log(`Total chains after merge: ${chains.length}`);

	// Sort by chainId
	chains.sort((a, b) => a.chainId - b.chainId);

	// Generate mini version for list view
	const chainsMini: ChainMini[] = chains.map(chain => ({
		id: chain.chainId,
		name: chain.name,
		symbol: chain.nativeCurrency.symbol,
		chain: chain.chain,
		icon: chain.iconUrl,
		rpcCount: filterRpcUrls(chain.rpc).length,
		isTestnet: isTestnet(chain),
		status: chain.status
	}));

	// Generate EIP-3085 format for wallet integration
	const chainsEIP3085: Record<number, ChainEIP3085> = {};
	for (const chain of chains) {
		const rpcUrls = filterRpcUrls(chain.rpc);
		if (rpcUrls.length === 0) continue; // Skip chains with no valid RPCs

		chainsEIP3085[chain.chainId] = {
			chainId: toHexChainId(chain.chainId),
			chainName: chain.name,
			nativeCurrency: chain.nativeCurrency,
			rpcUrls,
			blockExplorerUrls: chain.explorers?.map(e => e.url).slice(0, 3),
			iconUrls: chain.iconUrl ? [chain.iconUrl] : undefined
		};
	}

	// Generate full data indexed by chainId
	const chainsFull: Record<number, ChainFull> = {};
	for (const chain of chains) {
		chainsFull[chain.chainId] = chain;
	}

	// Calculate statistics
	const stats = {
		total: chains.length,
		mainnets: chainsMini.filter(c => !c.isTestnet).length,
		testnets: chainsMini.filter(c => c.isTestnet).length,
		withRpc: Object.keys(chainsEIP3085).length,
		custom: customChains.filter(c => !existingChainIds.has(c.chainId)).length,
		lastUpdated: new Date().toISOString()
	};

	// Ensure output directory exists
	const outputDir = join(process.cwd(), 'static', 'data');
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	// Write output files
	writeFileSync(
		join(outputDir, 'chains-mini.json'),
		JSON.stringify(chainsMini)
	);
	console.log(`Written chains-mini.json (${(JSON.stringify(chainsMini).length / 1024).toFixed(1)}KB)`);

	writeFileSync(
		join(outputDir, 'chains-eip3085.json'),
		JSON.stringify(chainsEIP3085)
	);
	console.log(`Written chains-eip3085.json (${(JSON.stringify(chainsEIP3085).length / 1024).toFixed(1)}KB)`);

	writeFileSync(
		join(outputDir, 'chains-full.json'),
		JSON.stringify(chainsFull)
	);
	console.log(`Written chains-full.json (${(JSON.stringify(chainsFull).length / 1024).toFixed(1)}KB)`);

	writeFileSync(
		join(outputDir, 'stats.json'),
		JSON.stringify(stats, null, 2)
	);
	console.log(`Written stats.json`);

	// Also write to src/lib/data for SSR
	const libDataDir = join(process.cwd(), 'src', 'lib', 'data');
	if (!existsSync(libDataDir)) {
		mkdirSync(libDataDir, { recursive: true });
	}

	writeFileSync(
		join(libDataDir, 'chains-mini.json'),
		JSON.stringify(chainsMini)
	);
	writeFileSync(
		join(libDataDir, 'chains-eip3085.json'),
		JSON.stringify(chainsEIP3085)
	);
	writeFileSync(
		join(libDataDir, 'stats.json'),
		JSON.stringify(stats, null, 2)
	);

	const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
	console.log(`\nSync complete in ${elapsed}s`);
	console.log(`Stats: ${stats.total} chains (${stats.mainnets} mainnets, ${stats.testnets} testnets)`);
}

main().catch(error => {
	console.error('Sync failed:', error);
	process.exit(1);
});
