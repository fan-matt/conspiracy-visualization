import React from 'react';
import styled from 'styled-components';


const StyledLabel = styled.label`
    font-family: 'Courier New', Courier, monospace;
    display: block;
`;


export default function Label(props) {
    return(
        <StyledLabel {... props}> {props.children} </StyledLabel>
    );
}