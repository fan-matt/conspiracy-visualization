import styled from 'styled-components';
import Button from './Button'

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


type Props = {
    label: string | undefined;
    setPopup: (hasPopup: boolean) => void
};

const Header = ({ label, setPopup}: Props) => {
    return(
        <StyledHeader>
            Conspiracy Theory Network {label ? ' | ' + label : ''}
            <Button onClick={() => setPopup(true)}>Open Analytics</Button>
        </StyledHeader>
    )
}

export default Header;