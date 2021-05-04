import React from 'react';
import styled from 'styled-components';


const StyledButton = styled.button`
    padding: 8px;
    border-width: 2.5px;
    border-radius: 4px;
    border-style: solid;
    border-color: white;
    background-color: #323949;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    transition: 0.5s;
    cursor: pointer;

    &:hover {
        border-color: #95ecf4;
    }
`;


export default function Button(props) {
    return(
        <StyledButton {...props}>
            {props.children}
        </StyledButton>
    );
}