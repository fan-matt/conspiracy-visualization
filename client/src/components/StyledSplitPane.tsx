import React from 'react';
import SplitPane from 'react-split-pane';


/*
    Don't use styled-components!
    Just pass in all the styling as below.

    https://github.com/tomkp/react-split-pane
*/


const STYLE = {
    height: 'calc(100vh - 100px)',
};


const RESIZER_STYLE = {
    background: '#12151c',
    opacity: 0.1,
    zIndex: 1,
    cursor: 'col-resize',
    width: '5px',
};


type Props = {
    children: React.ReactNode;
    split: "vertical" | "horizontal";
    minSize: number;
    defaultSize: number;
    onChange: (size: number) => void;
    size: number;
    pane2Style: object;
}

const StyledSplitPane = ({ children, ...props }: Props) => {
    return (
        <SplitPane {...props} style={STYLE} resizerStyle={RESIZER_STYLE} >
            {children}
        </SplitPane>
    );
}

export default StyledSplitPane;