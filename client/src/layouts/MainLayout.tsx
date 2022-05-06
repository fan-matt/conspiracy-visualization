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
    setPopup: (hasPopup: boolean) => void;
}

const MainLayout = ({ children, label, setPopup }: Props) => {
    return(
        <Layout>
            <Header label={label} setPopup={setPopup}/>
            {children}
        </Layout>
    );
}


export default MainLayout;