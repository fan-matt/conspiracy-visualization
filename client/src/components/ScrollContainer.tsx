import { FC , useState , useEffect , useRef } from 'react';
import styled from 'styled-components';
import { Scrollbar } from "react-scrollbars-custom";


const Container = styled.div <{height: number , maxHeight: number}>`
    display: block;
    height: ${props => (props.height ? `${props.height}px` : 0)};
    max-height: ${props => (props.maxHeight ? `${props.maxHeight}px` : 0)};
    border-radius: 5px;
    border-style: solid;
    border-color: darkgray;
    border-width: 2px;
    padding: 5px;
`;


const StyledScroll = styled(Scrollbar) <{height: number , maxHeight: number}>`
    height: ${props => (props.height ? `${props.height}px` : 0)};
    max-height: ${props => (props.maxHeight ? `${props.maxHeight}px` : 0)};
`;


type Props = {
    maxHeight: number;
}


const ScrollContainer: FC <Props> = (props) => {
    const [contentHeight , setContentHeight] = useState(0);
    
    const contentRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const content = contentRef.current;

        if(content) {
            setContentHeight(content.clientHeight);
        }
    } , [props.children]);

    // https://github.com/xobotyi/react-scrollbars-custom/issues/21#issuecomment-435786619
    return(
        <Container height={contentHeight} maxHeight={props.maxHeight}>
            <StyledScroll height={contentHeight} maxHeight={props.maxHeight}>
                <div ref={contentRef} className='scrollable-content'>
                    {props.children}
                </div>
            </StyledScroll>
        </Container>
    );
}


export default ScrollContainer;