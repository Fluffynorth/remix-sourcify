import React from 'react';
import { VerifyContract } from "./components/verify-contract/VerifyContract";
import { ContractFetcher } from "./components/contract-fetcher/ContractFetcher";
import { remixClient } from './remix/RemixClient';

function App() {

  remixClient.createClient();

  return (
    <div className="App">
      <ContractFetcher/>
      <VerifyContract/>
    </div>
  )
}

export default App;
