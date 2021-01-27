import React from 'react';
import styled from 'styled-components';

import Header from './../components/Header';


let Layout = styled.div`
    width: 100vw;
    height: 100vh;

    background-color: #3d3d3d;
`;


function MainLayout(props) {
    return(
        <Layout>
            <Header />
            {props.children}
        </Layout>
    );
}


export default MainLayout;