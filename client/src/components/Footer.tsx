import styled from 'styled-components';

let StyledFooter = styled.div`
    width: 100%;
    height: 100px;
    line-height: 100px;
    text-align: center;
    font-family: 'Courier New', Courier, monospace;
    color: #f7f7f7;
    font-size: 16px;
    background-color: #12151c;
`;


const Footer = () => {
    return (
        <StyledFooter>
            Complex Networks Group at UCLA, { new Date().getFullYear() }
        </StyledFooter>
    );
};

export default Footer;