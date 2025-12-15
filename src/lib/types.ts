export interface ChainMini {
	id: number;
	name: string;
	symbol: string;
	chain: string;
	icon?: string;
	rpcCount: number;
	isTestnet: boolean;
	status?: string;
}

export interface ChainEIP3085 {
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

export interface ChainFull {
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
	iconUrl?: string;
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

export interface ChainStats {
	total: number;
	mainnets: number;
	testnets: number;
	withRpc: number;
	lastUpdated: string;
}
