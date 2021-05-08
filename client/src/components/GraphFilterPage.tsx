import { FC } from 'react';
import styled from 'styled-components';

import SwitchMenuPage from './SwitchMenuPage';
import Label from './Label';
import Input from './Input';
import Button from './Button';
import ScrollContainer from './ScrollContainer';

import { formatDate } from './../util/util';


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
        updateSubgraph: (settings: {
            id: number ,
            date: string ,
            depth: number
        } , nodeId: number) => void ,

        filters: {
            keywords: string ,
        }
        setFilters: (field: string , value: string) => void ,
        filter: () => void ,
        searchedNodes: any[]
};


const GraphFilterPage: FC<Props> = (props) => {
    let searchResults = props.searchedNodes.map((node) => {
        return(
            <StyledSearch onClick={() => {
                props.updateSubgraph({
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
                
                if(props.filters.keywords !== '') {
                    console.log(props.filters.keywords);

                    props.filter();
                }
            }}>
                <FormLabel> Keywords (delimit with semicolon) </FormLabel>
                <FormInput 
                    type='text' 
                    value={props.filters.keywords} 
                    onInput={(e) => props.setFilters('keywords' , e.target.value)} 
                    autoFocus     
                />

                <FormButton> Search </FormButton>
            </form>

            <h1 style={{fontWeight: 'bold' , margin: '40px 0'}}> Search Results: ({searchResults.length}) </h1>    
            
            {searchResults.length !== 0 ? 
                <ScrollContainer maxHeight={300}>
                    {searchResults}
                </ScrollContainer>

                : <> </>
            }

        </SwitchMenuPage>
    );
};


export default GraphFilterPage;