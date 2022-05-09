import { MouseEventHandler } from 'react';
import styled from 'styled-components'

let StyledBackdrop = styled.div`
    position: fixed;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
`

type Props = {
    setPopup: (hasPopup: boolean) => void
};

const PopupBackdrop = ({ setPopup } : Props) => {
    return (
        <StyledBackdrop onClick = {() => setPopup(false)}/>
    )
}

export default PopupBackdrop