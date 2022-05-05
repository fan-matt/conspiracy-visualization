import React from 'react';
import styled from 'styled-components';

import Header from '../components/Header';


let Layout = styled.div`
    width: 100vw;
    height: 100vh;

    background-color: #3d3d3d;
`;

type Props = {
    children: React.ReactNode;
    label: string;
}

const MainLayout = ({ children, label }: Props) => {
    return(
        <Layout>
            <Header label={label} />
            {children}
        </Layout>
    );
}


export default MainLayout;