import React from 'react';
import styled from 'styled-components';


const StyledLabel = styled.label`
    font-family: 'Courier New', Courier, monospace;
    display: block;
`;

type Props = {
    children: React.ReactNode;
};

export default function Label({children, ...props}: Props) {
    return(
        <StyledLabel {... props}> {children} </StyledLabel>
    );
}