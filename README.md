# Source Verify

This is UI part of the [source-verify](https://github.com/ethereum/source-verify).

## Demo
[Source verify demo](https://streamable.com/q82v8x)

## Run locally

Install and run with npm:
```
npm install
npm start
```

You will see the host and port the plugin is running (default: `http://localhost:3000`).

Open https://remix.ethereum.org, click "Plugin Manager" on bottom left and click "Connect to Local Plugin" below the search bar. Enter a plugin name and the URL (e.g. `http://localhost:3000`) to add the local plugin to Remix.

## Publish to Ipfs
To publish plugin to ipfs run the command

```bash
yarn build
yarn ipfs
```
Update sourcify profile, in the remix directory with the generated plugin URL

# How to test in Remix

Create a Fetch.js file and have .sol file and metadata.json files available for verification. Sample codes

VerifyByNetwork:

```
(async () => {
    try {
        const verifyData = {
            address: '0x00C56d424FF9072779bD0df2d9bF50e759B86B58',
            chain: 'rinkeby',
            files: {
                'ballot.sol': await remix.call('fileManager', 'getFile', 'verified-sources/0x00C56d424FF9072779bD0df2d9bF50e759B86B58/ballot.sol'),
                'metadata.json': await remix.call('fileManager', 'getFile', 'verified-sources/0x00C56d424FF9072779bD0df2d9bF50e759B86B58/metadata.json'),
            }
        }
        console.log(JSON.stringify(verifyData))
        const t = await remix.call('sv', 'verifyByNetwork', verifyData.address, verifyData.chain, verifyData.files)
        console.log(t)
    } catch (e) {
        console.log(e.message)
    }
})()
```

Verify:
```
(async () => {
    try {
        const verifyData = {
            address: '0x00C56d424FF9072779bD0df2d9bF50e759B86B58',
            chain: 'rinkeby',
            files: {
                'ballot.sol': await remix.call('fileManager', 'getFile', 'verified-sources/0x00C56d424FF9072779bD0df2d9bF50e759B86B58/ballot.sol'),
                'metadata.json': await remix.call('fileManager', 'getFile', 'verified-sources/0x00C56d424FF9072779bD0df2d9bF50e759B86B58/metadata.json'),
            }
        }
        console.log(JSON.stringify(verifyData))
        const t = await remix.call('sv', 'verifyByNetwork', verifyData.address, verifyData.chain, verifyData.chain, verifyData.files)
        console.log(t)
    } catch (e) {
        console.log(e.message)
    }
})()
```

Fetch:
```
(async () => {
    try {
        console.log('fetch...')
        const t = await remix.call('sv', 'fetch', '0x00C56d424FF9072779bD0df2d9bF50e759B86B58')
        console.log(t)
    } catch (e) {
        console.log(e.message)
    }
})()
```

FetchByNetwork:
```
(async () => {
    try {
        console.log('fetch...')
        const t = await remix.call('sv', 'fetchByNetwork', '0x00C56d424FF9072779bD0df2d9bF50e759B86B58', 4)
        console.log(t)
    } catch (e) {
        console.log(e.message)
    }
})()
```
Inside a console run: 
```
remix.exeCurrent()
```
Note: javascript file should be in focus.
