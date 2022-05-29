import React, { useReducer, useEffect, useContext, useMemo} from "react";
import { Alert, Spinner } from "../common";
import { REPOSITORY_URL, chainOptions } from '../../common/Constants';
import { useStateContext, useDispatchContext } from "../../state/Store";
import { remixClient } from "../../remix/RemixClient";
import { AddressInput } from "../common/form/AddressInput"
import { Dropdown } from "../common/form/Dropdown"
import { VerificationResult } from "../../state/types";
import { Context } from '../../state/chain';
import web3utils from "web3-utils";
import { Chain } from '../../state/types';

export type IVerifyState = {
    isLoading: boolean,
    error: any,
    chain: any,
    address: string,
    files: [],
    contractName: string
    isListening: boolean
}

export type IVerifyActions = {
    type: 'set_loading' | 'set_error' | 'set_address' | 'set_chain' | 'set_files' | 'set_listening' | 'set_contract_name';
    payload?: any
}

export const reducer = (state: IVerifyState, action: IVerifyActions) => {
    switch(action.type) {
        case 'set_loading':
            return {
                ...state,
                isLoading: action.payload
            };
        case 'set_error':
            return {
                ...state,
                isLoading: false,
                error: ( action.payload && ( action.payload.info || action.payload.toString() ))
            };
        case 'set_address':
            return {
                ...state,
                address: action.payload.toString().trim()
            };
        case 'set_chain':
            return {
                ...state,
                chain: action.payload
            };
        case 'set_files':
            return {
                ...state,
                files: action.payload
            };
        case 'set_listening':
            return {
                ...state,
                isListening: action.payload
            };
        case 'set_contract_name':
            return {
                ...state,
                contractName: action.payload
            }
        default:
            return state;
        }
}

export const ChainListDropDown = () => {
    const { sourcifyChains } = useContext(Context)
    return <VerifyContract chains={sourcifyChains} />
}

type Props = {
    chains: Chain[]
}

const VerifyContract = React.memo(({ chains }: Props) => {

    const initialState: IVerifyState = {
        isLoading: false,
        chain: chainOptions[0],
        address: '',
        error: null,
        files: [],
        contractName: "",
        isListening: false
    }

    const parsedChains = useMemo(() => chains.map((chain) => {
        return {
            label: chain.name,
            value: chain.chainId,
            id: chain.chainId
        }
    }), [chains])

    const stateContext = useStateContext();
    const dispatchContext = useDispatchContext();

    const [state, dispatch] = useReducer(reducer, initialState);

    // if (!state.isListening) {
    //     remixClient.listenOnCompilationFinishedEvent((data: any) => {
    //         dispatch({ type: 'set_files', payload: [data.target.replace("browser/", ""), "metadata.json"] });
    //         console.log('HERE')
    //     });
    //
    //         console.log('DISPATCH')
    //     dispatch({ type: 'set_listening', payload: true});
    //     console.log(state.isListening)
    // }

    useEffect(() => {
        if (!state.isListening) {
            remixClient.listenOnCompilationFinishedEvent(async () => {
                const { contractName, files } = await remixClient.fetchLastCompilation();
                dispatch({ type: "set_contract_name", payload: contractName });
                dispatch({ type: "set_files", payload: files });
                dispatch({ type: "set_error", payload: null });
            });
            dispatch({type: 'set_listening', payload: true});
        }
    }, [state.isListening])

    const onSubmit = async (e: any) => {
        e.preventDefault();
        dispatch({ type: 'set_error', payload: null} );
        dispatchContext({ type: 'set_verification_result', payload: null} );
        dispatch({ type: 'set_loading', payload: true })

        const formData = new FormData();

        if (web3utils.isAddress(state.address)) {
            formData.append('address', state.address);
        } else {
            dispatch({ type: "set_error", payload: "Invalid address" });
            dispatch({ type: 'set_loading', payload: false });
            return;
        }

        formData.append('chain', state.chain.id.toString());

        if (state.files.length > 0) {
            state.files.forEach((file: any) => formData.append('files', file));
        } else {
            dispatch({ type: "set_error", payload: "No contracts to verify" });
            dispatch({ type: 'set_loading', payload: false });
            return;
        }

        const response: VerificationResult = await remixClient.verifyByForm(formData);
        if (response.status === 'no match') {
            dispatch({ type: 'set_error', payload: response.message} );
        } else {
            dispatchContext({ type: 'set_verification_result', payload: response} );
        }
        dispatch({ type: 'set_loading', payload: false });
    }

    const generateAlertSuccessHeading = (): string => {
        const timestamp = stateContext.verificationResult.storageTimestamp;
        if (timestamp) {
            const formattedTimestamp = new Date(timestamp).toUTCString();
            return `Contract already verified on ${formattedTimestamp}`;
        }

        const matchString = stateContext.verificationResult.status === "perfect" ? "successfully" : "only partially";
        return `Contract ${matchString} verified`;
    };

    return (
        <div>
            <p className="card-text my-2">
                Upload, verify & publish contract metadata and sources.
            </p>
            <p className="card-text my-2">
                Note: <br/>
                1. Compile contracts in Remix, before attempting verification <br/>
                2. The metadata must be exactly the same as at deployment time
            </p>
            <p className="card-text my-2">
                Search repository for verified contract <a href={`${REPOSITORY_URL}`} target="_blank" rel="noopener noreferrer" >here.</a>
            </p>
            <form className="d-flex flex-column" onSubmit={onSubmit}>
                <Dropdown 
                    chainOptions={parsedChains}
                    chain={state.chain}
                    setChain={(chain: any) => dispatch({ type: 'set_chain', payload: chain })} />
                <AddressInput 
                    setAddress={(address: string) => dispatch({ type: 'set_address', payload: address })} />
                <button 
                    type="submit" 
                    className="btn btn-primary my-2" 
                    disabled={!state.address}>Verify
                </button>
                {
                    state.contractName &&
                    <>
                        <label className="text-muted mt-2">CONTRACT</label>
                        <p>{ state.contractName }</p>
                    </>

                }
                {
                    state.files.length > 0 &&
                    <>
                        <label className="text-muted mt-2">FILES</label>
                        <ul className="verifier-file-list border p-2 d-flex flex-column text-muted">
                            {state.files.map(file => <li key={file.name}>{file.name}</li>)}
                        </ul>
                    </>
                }
            </form>
            {
                state.isLoading && <Spinner />
            }
            {
                state.error && <Alert type={'danger'} heading={state.error}>
                    </Alert>
            }
            {
                stateContext.verificationResult && !state.error && (
                    <Alert type='success' heading={generateAlertSuccessHeading()}>
                        <p className="m-0 mt-2">
                            View the assets in the
                            <a href={`${stateContext.verificationResult.url}`} target="_blank"rel="noopener noreferrer"> Contract Repo.</a>
                        </p>
                    </Alert>
                )
            }
            <p className="my-1"><a
                href="https://docs.sourcify.dev/" target="_blank" rel="noopener noreferrer" >Documentation</a>
            </p>
            <p className="my-1">Questions: <a
                href="https://gitter.im/ethereum/source-verify" target="_blank" rel="noopener noreferrer" >Gitter</a>
            </p>
            <p className="my-1">Source code: <a
                href="https://github.com/ethereum/sourcify" target="_blank" rel="noopener noreferrer" >GitHub</a>
            </p>
            <p className="m-0">Feel free to contribute.</p>
        </div>
    )
});
