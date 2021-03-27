import React from 'react';

import styled from 'styled-components';


let StyledHeader = styled.header`
    width: 100%;
    height: 100px;
    background-color: #12151c;
    text-align: center;
    line-height: 100px;
    font-size: 25px;
    color: #f7f7f7;
    font-family: 'Courier New', Courier, monospace;
`;


function Header(props) {
    return(
        <StyledHeader>
            Conspiracy Theory Network {props.date ? ' | ' + props.date : ''}
        </StyledHeader>
    )
}

export default Header;