import React from 'react';

import styled from 'styled-components';


let StyledHeader = styled.header`
    width: 100%;
    height: 100px;
    background-color: #2d2d2d;
    text-align: center;
    line-height: 100px;
    font-size: 30px;
    color: #f7f7f7;
    font-family: 'Courier New', Courier, monospace;
`;


function Header(props) {
    return(
        <StyledHeader>
            Graph Demo
        </StyledHeader>
    )
}

export default Header;