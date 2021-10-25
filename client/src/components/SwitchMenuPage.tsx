import styled from 'styled-components';


const StyledSwitchMenuPage = styled.div`
    width: calc(100% - 100px);
    height: 100%;
    color: #f7f7f7;
    font-family: 'Courier New', Courier, monospace;
    overflow-y: auto;
    overflow-x: auto;
    padding: 50px;
    overflow-wrap: break-word;

    /* h2 {
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 15px;
    }

    h3 {
        font-size: 20px;
        line-height: 30px;
        margin-bottom: 45px;
    } */
`;


type Props = {
    children: any
}


/*
    A simple, high-level component that represents a generalized 
    SwitchMenu page.

    In the current UI, the SwitchMenu is the menu at the right of the
    graph visualization but above the footer.
*/
export default function SwitchMenuPage({children}: Props) {
    return (
        <StyledSwitchMenuPage>
            {children}
        </StyledSwitchMenuPage>
    );
}