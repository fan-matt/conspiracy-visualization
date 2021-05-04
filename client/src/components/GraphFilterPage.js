import React from 'react';
import styled from 'styled-components';

import SwitchMenuPage from './SwitchMenuPage';
import Label from './Label';
import Input from './Input';
import Dropdown from './Dropdown';
import Button from './Button';


const FormLabel = styled(Label)`
    margin-bottom: 10px;
`;


const FormInput = styled(Input)`
    width: calc(100% - 16px);
    margin-bottom: 20px;
`;


const FormDropdown = styled(Dropdown)`
    width: 200px;
`; 


const FormButton = styled(Button)`
    display: block;
`;


export default function GraphFilterPage(props) {
    return(
        <SwitchMenuPage>
            <form onSubmit={(e) => {e.preventDefault(); props.filter();}}>
                <FormLabel> Nodes (delimit with semicolon) </FormLabel>
                <FormInput 
                    type='text' 
                    value={props.filters.nodes} 
                    onInput={(e) => props.setFilters('nodes' , e.target.value)} 
                    autoFocus     
                />

                <FormLabel> Communities (delimit with semicolon) </FormLabel>
                <FormInput 
                    type='text' 
                    value={props.filters.communities} 
                    onInput={(e) => props.setFilters('communities' , e.target.value)} 
                />

                <FormLabel> Filter mode </FormLabel>
                <FormDropdown options={['Default' , 'Spanning' , 'Neighborhood']} />

                <FormButton style={{marginTop: '60px'}}> Filter </FormButton>
            </form>
        </SwitchMenuPage>
    );
};