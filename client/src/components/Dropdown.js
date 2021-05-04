import React from 'react';
import styled from 'styled-components';


const StyledSelect = styled.select`
    padding: 8px;
    border-width: 2.5px;
    border-radius: 4px;
    border-style: solid;
    border-color: white;
    background-color: #323949;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    transition: 0.5s;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
    background: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>") 96% / 15% no-repeat #323949;
    /* background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>"); */


    &:focus {
        border-color: #95ecf4;
        outline: none;
    }
`;


const StyledOption = styled.option`
    cursor: pointer;
`;


export default function Dropdown(props) {
    let options = props.options.map((option , i) => <StyledOption key={String(i) + ' dropdown'}> {option} </StyledOption>)

    return(
        <StyledSelect {... props}>
            {options}
        </StyledSelect>
    );
}