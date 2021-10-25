import React, { useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";

import {
  LINK_COLOR,
  NODE_HIGHLIGHT_HOVER,
  NODE_HIGHLIGHT_ADJACENT,
  GRAPH_BACKGROUND_COLOR,
} from "./../util/DataConsts";

/**
 * This component serves more as a wrapper for the ForceGraph2D- it hides away a lot of the nitty gritty details
 * and only exposes the width, height, and data to pass in by props.
 *
 * @param {*} props React props
 */
function GraphViewer(props) {
  let [hoveredNode, setHoveredNode] = useState(null);
  let [highlightNodes, setHighlightNodes] = useState([]);
  let [highlightLinks, setHighlightLinks] = useState([]);

  const graphRef = useRef(null);

  useEffect(() => {
    graphRef.current.zoom(0.2, 0);
  }, []);

  useEffect(() => {
    if (props.currentNode) {
      graphRef.current.centerAt(props.currentNode.x, props.currentNode.y, 1000);
      graphRef.current.zoom(0.25, 1000);
    }
  }, [props.currentNode]);

  useEffect(() => {
    setForces();
    // graphRef.current.d3ReheatSimulation();
  }, [props.data]);

  useEffect(() => {
    if (props.currentNode) {
      highlightNodeNeighbors(props.currentNode);
    } else {
      // setHighlightLinks([]);
      // setHighlightNodes([]);
    }
  }, [props.currentNode]);

  function setForces() {
    const MAX_NODES = 1100;
    let numNodes = props.data.nodes.length;

    // Cap the many body (aka charge) force
    // Without this, it reaches too far and starts to push stray nodes very far away
    const MAX_DIST = 700;
    let chargeForce = graphRef.current.d3Force("charge");
    chargeForce.distanceMax(MAX_DIST);
    // chargeForce.strength(Math.min(numNodes / MAX_NODES , 1) * (Math.min(numNodes / MAX_NODES , 1) * (-50 + 50) - 50));
    // chargeForce.strength(Math.min(numNodes / MAX_NODES , 1) * (Math.min(numNodes / MAX_NODES , 1) * -80));
    chargeForce.strength(-300);
    graphRef.current.d3Force("charge", chargeForce);

    let strengthForce = graphRef.current.d3Force("center");
    strengthForce.strength(0);
    graphRef.current.d3Force("center", strengthForce);

    // Make the link forces a bit weaker to push out the nodes
    let linkForce = graphRef.current.d3Force("link");
    linkForce.strength((link) => {
      let source = String(link.source.id);
      let target = String(link.target.id);

      let nodes = props.data.nodes;

      if (source && target) {
        // Don't use Array.prototype.find since it returns the value and not the actual node
        let sourceNode =
          nodes[nodes.findIndex((node) => String(node.id) === source)];
        let targetNode =
          nodes[nodes.findIndex((node) => String(node.id) === target)];

        if (sourceNode && targetNode) {
          // return 1 / Math.min(sourceNode.neighbors.length , targetNode.neighbors.length) * (Math.min(numNodes / MAX_NODES , 1) * (0.05 - 0.025) + 0.025);
          return (
            (1 /
              Math.min(
                sourceNode.neighbors.length,
                targetNode.neighbors.length
              )) *
            0.015
          );
        } else {
          // This is necessary- it prevents the graph from trying to find source/target nodes that no longer exist
          // It can be any value, just has to be something
          return 1;
        }
      }
    });
    graphRef.current.d3Force("link", linkForce);
  }

  function handleNodeClick(node, e) {
    graphRef.current.centerAt(node.x, node.y, 1000);
    graphRef.current.zoom(0.25, 1000);

    console.log(node);

    // Callback
    if (props.onNodeClick) {
      props.onNodeClick(node, e);
    }
  }

  function handleNodeDragEnd(node) {
    // Fixes their positions so they don't float around anymore
    node.fx = node.x;
    node.fy = node.y;
  }

  /*
        Highlights node, adjacent nodes, and adjacent edges if
        node !== null

        otherwise, unhighlights everything
    */
  function highlightNodeNeighbors(node) {
    if (node) {
      let highlighted = node.neighbors.slice();
      highlighted.push(node);

      setHighlightNodes(highlighted);
      setHighlightLinks(node.links);
      setHoveredNode(node);
    } else {
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
    if (link) {
      setHighlightLinks([link]);
      setHighlightNodes([link.source, link.target]);
    } else {
      setHighlightLinks([]);
      setHighlightNodes([]);
    }
  }

  function handleNodeHover(node) {
    if (!props.currentNode) {
      highlightNodeNeighbors(node);
    }
  }

  function handleLinkHover(link) {
    if (!props.currentNode) {
      highlightLinkNeighbors(link);
    }
  }

  function paintNode(node, color, ctx) {
    const NODE_SIZE = handleNodeSize(node);

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_SIZE * 1.1, 0, 2 * Math.PI, false);
    ctx.fillStyle = "black";
    ctx.fill();

    // add ring just for highlighted nodes
    if (highlightNodes.includes(node)) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_SIZE * 1.4, 0, 2 * Math.PI, false);
      ctx.fillStyle =
        node === hoveredNode ? NODE_HIGHLIGHT_HOVER : NODE_HIGHLIGHT_ADJACENT;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
    ctx.fillStyle = color ? color : node.__indexColor;
    ctx.fill();

    // ctx.beginPath();
    // ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
    // ctx.fillStyle = node.color;
    // ctx.fill();
  }

  function deactivateForces() {
    // Don't just set forces to null! This breaks hot reload and maybe other things
    function zeroForce(forceName) {
      let force = graphRef.current.d3Force(forceName);
      force.strength(0);
      graphRef.current.d3Force(forceName, force);
    }

    zeroForce("center");
    zeroForce("charge");
    zeroForce("link");
  }

  function handleBackgroundClick() {
    graphRef.current.zoomToFit(750, 50);
    props.onNodeClick(null);

    setHighlightNodes([]);
    setHighlightLinks([]);
  }

  function handleNodeSize(node) {
    const MIN_SIZE = 36;
    const MAX_SIZE = 72;
    const MAX_NEIGHBORS = 5;

    let numNeighbors = node.neighbors.length;

    const NODE_SIZE = Math.max(
      Math.min(Math.log(numNeighbors) / MAX_NEIGHBORS, 1) * MAX_SIZE,
      MIN_SIZE
    );

    return NODE_SIZE;
  }

  function fixNode(node) {
    node.fx = node.x;
    node.fy = node.y;
  }

  return (
    <div
      className={props.className}
      width={props.width}
      height={props.height}
      style={{ overflow: "hidden" }}
    >
      <ForceGraph2D
        ref={graphRef}
        backgroundColor={GRAPH_BACKGROUND_COLOR}
        width={props.width}
        height={props.height}
        graphData={props.data}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        // nodeAutoColorBy="community"
        nodeLabel="node"
        nodeCanvasObject={(node, ctx) => paintNode(node, undefined, ctx)}
        nodePointerAreaPaint={paintNode}
        onNodeDragEnd={(node) => fixNode(node)}
        onLinkHover={handleLinkHover}
        onLinkClick={(link) => console.log(link)}
        linkDirectionalArrowLength={(link) =>
          highlightLinks.includes(link) ? 0 : 5
        }
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={(link) =>
          highlightLinks.includes(link) ? 4 : 0
        }
        linkColor={() => LINK_COLOR}
        linkWidth={(link) => (highlightLinks.includes(link) ? 5 : 1)}
        linkLabel={(link) =>
          `${link.source.node} -> ${link.relation} -> ${link.target.node}`
        }
        linkCurvature="curvature"
        onBackgroundClick={handleBackgroundClick}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.04}
        cooldownTime={4500}
        // onEngineStop={deactivateForces}
      />
    </div>
  );
}

export default GraphViewer;
