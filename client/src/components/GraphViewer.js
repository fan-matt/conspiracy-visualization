import React , {useState , useEffect , useRef} from 'react';
import ForceGraph2D from 'react-force-graph-2d';

import { 
    mapNodeTypeToColor ,
    LINK_COLOR , 
    NODE_HIGHLIGHT_HOVER , 
    NODE_HIGHLIGHT_ADJACENT , 
    GRAPH_BACKGROUND_COLOR 
    } from './../util/DataConsts';


/**
 * This component serves more as a wrapper for the ForceGraph2D- it hides away a lot of the nitty gritty details
 * and only exposes the width, height, and data to pass in by props.
 * 
 * @param {*} props React props
 */
function GraphViewer(props) {
    let [hoveredNode , setHoveredNode]                  = useState(null);
    let [highlightNodes , setHighlightNodes]            = useState([]);
    let [highlightLinks , setHighlightLinks]            = useState([]);
    let [isNodeLinkHovering , setIsNodeLinkHovering]    = useState(false);


    const graphRef = useRef(null);

    // This runs exactly once after rendering for the first time
    useEffect(() => {
        // Cap the many body (aka charge) force
        // Without this, it reaches too far and starts to push stray nodes very far away
        const MAX_DIST = 1500;
        let chargeForce = graphRef.current.d3Force('charge');
        chargeForce.distanceMax(MAX_DIST);
        graphRef.current.d3Force('charge' , chargeForce);

        // Make the link forces a bit weaker to push out the nodes
        let linkForce = graphRef.current.d3Force('link');
        let strengthAccessor = linkForce.strength();
        linkForce.strength((link) => {
            let defaultForce = strengthAccessor(link);
            return 0.025 * defaultForce;
        });
        graphRef.current.d3Force('link' , linkForce);
      }, []);


      useEffect(() => {
        if(props.currentNode) {
            highlightNodeNeighbors(props.currentNode);
        }
      });


    
    function handleNodeClick(node , e) {
        graphRef.current.centerAt(node.x , node.y , 750);
        graphRef.current.zoom(3 , 750);

        // Callback
        if(props.onNodeClick) {
            props.onNodeClick(node , e);
        }

        console.log(node);
    }


    function handleNodeDragEnd(node) {
        // Fixes their positions so they don't float around anymore
        node.fx = node.x;
        node.fy = node.y;
    }


    function handleNodeColor(node) {
        return mapNodeTypeToColor(node.type);
    }


    /*
        Highlights node, adjacent nodes, and adjacent edges if
        node !== null

        otherwise, unhighlights everything
    */
    function highlightNodeNeighbors(node) {
        if(node) {
            let highlighted = node.neighbors.slice();
            highlighted.push(node);

            setHighlightNodes(highlighted);
            setHighlightLinks(node.links);
            setHoveredNode(node);
        }
        else {
            setHighlightLinks([]);
            setHighlightNodes([]);
            setHoveredNode(null);
        }
    }


    /*
        Highlights link and adjacent nodes if link !== null

        otherwise, unhighlights everything
    */
    function highlightLinkNeighbors(link) {
        if(link) {
            setHighlightLinks([link]);
            setHighlightNodes([link.source , link.target]);
        }
        else {
            setHighlightLinks([]);
            setHighlightNodes([]);
        }
    }



    function handleNodeHover(node) {
        highlightNodeNeighbors(node);
        setIsNodeLinkHovering(node === null);
    }


    function handleLinkHover(link) {
        highlightLinkNeighbors(link);
        setIsNodeLinkHovering(link === null);
    }


    function paintNode(node , ctx) {
        // add ring just for highlighted nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, 24 * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = (node === hoveredNode) ? NODE_HIGHLIGHT_HOVER : NODE_HIGHLIGHT_ADJACENT;
        ctx.fill();
    }


    function deactivateForces() {
        graphRef.current.d3Force('center' , null);
        graphRef.current.d3Force('charge' , null);
        graphRef.current.d3Force('link' , null);
    }


    function handleBackgroundClick() {
        graphRef.current.zoomToFit(500 , 50);
        props.onNodeClick(null);
    }


    return(
        <div className={props.className} width={props.width} height={props.height} style={{overflow: 'hidden'}}>
            <ForceGraph2D 
                ref={graphRef}
                backgroundColor={GRAPH_BACKGROUND_COLOR}

                width={props.width}
                height={props.height}
                graphData={props.data}

                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onNodeDragEnd={handleNodeDragEnd}
                nodeAutoColorBy={(node) => node.community}
                // nodeColor={handleNodeColor}
                nodeLabel={(node) => node.node}
                nodeRelSize={24}
                nodeCanvasObjectMode={node => highlightNodes.includes(node) ? 'before' : undefined}
                nodeCanvasObject={paintNode}

                onLinkHover={handleLinkHover}
                linkDirectionalArrowLength={link => highlightLinks.includes(link) ? 0 : 5}
                linkDirectionalParticles={4}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={link => highlightLinks.includes(link) ? 4 : 0}
                linkColor={() => LINK_COLOR}
                linkWidth={link => highlightLinks.includes(link) ? 5 : 1}
                linkLabel={(link) => `${link.source.node} -> ${link.relation} -> ${link.target.node}`}

                onBackgroundClick={handleBackgroundClick}

                d3AlphaDecay={0.02}
                d3VelocityDecay={0.1}
                cooldownTime={2500}
                onEngineStop={deactivateForces}
            />
        </div>
    );
}


export default GraphViewer;