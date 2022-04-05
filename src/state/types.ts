export type Source = {
    path: string,
    name: string,
    content: string
}

export type FetchResult = {
    verificationStatus: string,
    metadata: any,
    sources: Source[]
}

export type FetchData = {
    address: string,
    network: string | number,
}

export type VerificationResult = {
    address: string,
    status: string,
    message: string,
    url?: string,
    storageTimestamp?: string
}

export type VerifyData = {
    address: string,
    chain: string | number,
    files: Record<string, any>
}

export type Chain = {
    name: string,
    title?: string, // Longer name for some networks
    chainId: number,
    shortName: string,
    network: string,
    networkId: number,
    supported?: boolean,
    monitored?: boolean
};

export type ChainMap = {
    [id: number]: Chain 
}
