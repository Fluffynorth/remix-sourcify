import React, { useReducer, useContext, useMemo } from 'react';
import { Dropdown } from "../common/form/Dropdown"
import { AddressInput } from "../common/form/AddressInput"
import { chainOptions } from "../../common/Constants"
import { remixClient } from "../../remix/RemixClient"
import { useDispatchContext, useStateContext } from '../../state/Store'
import { onFetched } from '../../state/actions';
import {Alert, Spinner} from "../common";
import { isAddress } from 'web3-utils';
import { Context } from '../../state/chain';
import { Chain } from '../../state/types';

export type IFetchState = {
    isLoading: boolean,
    error: any,
    chain: any,
    address: string
}

export type IFetchActions = {
    type: 'set_loading' | 'set_error' | 'set_address' | 'set_chain';
    payload?: any
}

export const reducer = (state: IFetchState, action: IFetchActions ) => {
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
                address: action.payload.trim()
            };
        case 'set_chain':
            return {
                ...state,
                chain: action.payload
            };
        default:
            return state;
    }
}

export const ChainListDropDown = () => {
    const { sourcifyChains } = useContext(Context)
    return <ContractFetcher chains={sourcifyChains} />
}

type Props = {
    chains: Chain[]
}

const ContractFetcher = React.memo(({ chains }: Props) => {
    const initialState: IFetchState = {
        isLoading: false, 
        chain: chainOptions[0],
        address: '',
        error: null
    }

    const parsedChains = useMemo(() => chains.map((chain) => {
        return {
            label: chain.title || chain.name,
            value: chain.chainId,
            id: chain.chainId
        }
    }), [chains])

    const stateContext = useStateContext();
    const dispatchContext = useDispatchContext();

    const [state, dispatch] = useReducer(reducer, initialState)
    const onSubmit = async (e: any) => {
        e.preventDefault();
        dispatch({ type: 'set_loading', payload: true });

        try {
            if (!isAddress(state.address)) {
                throw new Error(`Invalid address: ${state.address}`);
            }
            const fetchResult = await remixClient.fetchByNetwork(state.address, state.chain.id);
            await remixClient.saveFetchedToRemix(fetchResult, state.address);
            await remixClient.focusFileManager();
            dispatchContext(onFetched(fetchResult));
            dispatch({ type: 'set_loading', payload: false });
            dispatch({ type: 'set_error',  payload: null });
        } catch (err) {
            dispatch({ type: 'set_error',  payload: err });
            dispatch({ type: 'set_loading', payload: false });
        }
    };
    
    return (
        <div>
                <p className="card-text my-2 mb-3">Input a verified contract's address to load its source code in the editor.</p>
                    <form className="d-flex flex-column" onSubmit={onSubmit}>
                        <Dropdown 
                            chainOptions={parsedChains} 
                            chain={state.chain} 
                            setChain={(chain: any) => dispatch({ type: 'set_chain', payload: chain })} />

                        <AddressInput 
                            setAddress={(address: string) => dispatch({ type: 'set_address', payload: address })} 
                        />

                        <button 
                            type="submit" 
                            className="btn btn-primary my-2 mb-0" 
                            disabled={!state.address}>Fetch</button>
                    </form>
                {
                    state.isLoading && <Spinner />
                }
                {
                    state.error && <Alert type={'danger'} heading={state.error}>
                        </Alert>
                }
                {
                    (!state.error && stateContext?.fetchResult?.verificationStatus === 'partial') && (
                        <Alert type={'warning'} heading='This is a partially matched contract!'>
                        </Alert>
                    )
                }
                {
                    !state.error && stateContext.fetchResult && (
                        <Alert type={'success'} heading='Contract successfully fetched!'>
                        </Alert>
                    )
                }
        </div>
    )
})
