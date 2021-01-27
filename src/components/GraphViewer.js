import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

import Data from './../data/data.json';


function GraphViewer(props) {
    return(
        <div className={props.className} width={props.width} height={props.height} style={{overflow: 'hidden'}}>
            <ForceGraph2D 
                graphData={Data}
                width={props.width}
                height={props.height}
                backgroundColor='#9e9e9e'
                // nodeRelSize={20}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    ctx.beginPath();
                    ctx.arc(node.x , node.y , 5 , 0 , 2 * Math.PI , false);

                    let fillStyle = 'black'

                    switch(node.val.type) {
                        case 'required':
                            fillStyle = 'green';
                            break;
                        
                        case 'cseonly':
                            fillStyle = 'pink';
                            break;
                        
                        case 'notoffered':
                            fillStyle = 'gray';
                            break;
                        
                        case 'elective':
                            fillStyle = 'white';
                            break;
                        
                        case 'capstone':
                            fillStyle = 'blue';
                            break;
                        
                        case 'optional':
                            fillStyle = 'lightgreen';
                            break;
                        
                        default:
                            fillStyle = 'black'
                            break;
                    }
                    ctx.fillStyle = fillStyle;
                    ctx.fill()
                    // ctx.fillText(label, node.x, node.y);
                }}
            />
        </div>
    );
}


export default GraphViewer;