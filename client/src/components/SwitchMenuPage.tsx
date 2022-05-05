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
`;


type Props = {
    children: React.ReactNode
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