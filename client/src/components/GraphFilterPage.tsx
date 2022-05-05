import React, { useState } from 'react';
import styled from 'styled-components';

import SwitchMenuPage from './SwitchMenuPage';
import Label from './Label';
import Input from './Input';
import Button from './Button';
import ScrollContainer from './ScrollContainer';

import { formatDate } from './../util/util';
import { NeighborhoodSearchSettings, RawNode } from './../types';


const FormLabel = styled(Label)`
    margin-bottom: 10px;
`;


const FormInput = styled(Input)`
    width: calc(100% - 16px);
    margin-bottom: 20px;
`;


const FormButton = styled(Button)`
    display: block;
`;


const StyledSearch = styled.div`
    padding: 10px 5px;
    line-height: 18px;
    cursor: pointer;

    transition: 0.3s;
    border-radius: 5px;

    & > h1 {
        color: cornflowerblue;
    }

    &:hover{
        background-color: darkslategray;
    }
`;


type Props = {
        updateSubgraph: (settings: NeighborhoodSearchSettings , nodeId: number) => void ,

        filters: {
            keywords: string ,
        }
        setFilters: (field: string , value: string) => void ,
        focusGraph: (focus: string) => void,
        filter: () => void ,
        searchedNodes: Array<RawNode>
};


const GraphFilterPage = ({ updateSubgraph, filters, setFilters, focusGraph, filter, searchedNodes}: Props) => {

    let searchedNodesList = searchedNodes.slice();

    const [focus, setFocus] = useState("");

    searchedNodesList.sort((a , b) => {
        const dateA = new Date(a.Date);
        const dateB = new Date(b.Date);

        return dateA.valueOf() - dateB.valueOf();
    }).reverse();

    if(searchedNodesList.length >= 80) {
        searchedNodesList.length = 80;
    }

    let searchResults = searchedNodesList.map((node, i) => {
        return(
            <StyledSearch key={`nodeSearch${i}`} onClick={() => {
                updateSubgraph({
                    id: node.node_id ,
                    date: node.Date ,
                    depth: -1
                } , node.node_id)
            }}>
                <h1> {node.node} </h1>
                <h5> {formatDate(node.Date)} </h5>
            </StyledSearch>
        );
    })

    return(
        <SwitchMenuPage>
            <form onSubmit={(e) => {
                e.preventDefault();
                focusGraph(focus);
            }}>
                <FormLabel> Focus (delimit with semicolon) </FormLabel>
                <FormInput 
                    type='text' 
                    onInput={(e: React.FormEvent<HTMLInputElement>) => 
                        {
                            let eTarget = e.target as HTMLInputElement;
                            setFocus(eTarget.value);
                        }
                    } 
                    autoFocus     
                />

                <FormButton> Focus </FormButton>
            </form>

            <div style={{height: "20px"}}></div>

            <form onSubmit={(e) => {
                e.preventDefault();
                
                if(filters.keywords !== '') {
                    console.log(filters.keywords);

                    filter();
                }
            }}>
                <FormLabel> Keywords (delimit with semicolon) </FormLabel>
                <FormInput 
                    type='text' 
                    value={filters.keywords} 
                    onInput={(e: React.FormEvent<HTMLInputElement>) => 
                        {
                            let eTarget = e.target as HTMLInputElement;
                            setFilters('keywords' , eTarget.value);
                        }
                    } 
                    autoFocus     
                />

                <FormButton> Search </FormButton>
            </form>

            <h1 style={{fontWeight: 'bold' , margin: '40px 0'}}> Search Results: ({searchResults.length}) </h1>    
            
            {searchResults.length !== 0 ? 
                <ScrollContainer maxheight={300}>
                    {searchResults}
                </ScrollContainer>

                : <> </>
            }

        </SwitchMenuPage>
    );
};


export default GraphFilterPage;