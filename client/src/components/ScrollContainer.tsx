import { useState , useEffect , useRef } from 'react';
import styled from 'styled-components';
import { Scrollbar } from "react-scrollbars-custom";


const Container = styled.div <{height: number , maxheight: number}>`
    display: block;
    height: ${props => (props.height ? `${props.height}px` : 0)};
    max-height: ${props => (props.maxheight ? `${props.maxheight}px` : 0)};
    border-radius: 5px;
    border-style: solid;
    border-color: darkgray;
    border-width: 2px;
    padding: 5px;
`;


const StyledScroll = styled(Scrollbar) <{height: number , maxheight: number}>`
    height: ${props => (props.height ? `${props.height}px` : 0)};
    max-height: ${props => (props.maxheight ? `${props.maxheight}px` : 0)};
`;


type Props = {
    children: React.ReactNode;
    maxheight: number;
}


const ScrollContainer = ({ children, maxheight }: Props) => {
    const [contentHeight , setContentHeight] = useState(0);
    
    const contentRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const content = contentRef.current;

        if(content) {
            setContentHeight(content.clientHeight);
        }
    } , [children]);

    // https://github.com/xobotyi/react-scrollbars-custom/issues/21#issuecomment-435786619
    return(
        <Container height={contentHeight} maxheight={maxheight}>
            <StyledScroll height={contentHeight} maxheight={maxheight}>
                <div ref={contentRef} className='scrollable-content'>
                    {children}
                </div>
            </StyledScroll>
        </Container>
    );
}


export default ScrollContainer;