import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Map } from "immutable";

import MainLayout from "./layouts/MainLayout";
import GraphViewer from "./components/GraphViewer";
import StyledSplitPane from "./components/StyledSplitPane";
import GraphSwitchMenu from "./components/GraphSwitchMenu";
import Footer from "./components/Footer";

import { formatDate } from "./util/util";
import { nodeModuleNameResolver } from "typescript";

/*
    Currently, this is everything to the right of the graph visualization
*/
let MenuAndFooter = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

/*
    The main React application! Holds all the goodies

    Props:
        N/A
*/
function App() {
  const [splitWidth, setSplitWidth] = useState(window.innerWidth);
  const [graphWidth, setGraphWidth] = useState((splitWidth / 3) * 2);
  const [graphHeight, setGraphHeight] = useState(window.innerHeight - 100);
  const [currentNode, setCurrentNode] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [data, setData] = useState({ nodes: [], links: [] });
  const [graphDate, setGraphDate] = useState(undefined);

  const [focusString, setFocusString] = useState("");

  const [searchedObjects, setSearchedObjects] = useState({
    nodes: [],
    links: [],
  });

  const [neighborhoodSettings, setNeighborhoodSettings] = useState(
    Map({ id: -1, date: "", depth: -1 })
  );

  const [findObjectSettings, setFindObjectSettings] = useState(
    Map({ communities: [], keywords: [] })
  );

  const [graphDates, setGraphDates] = useState([]);

  const [graphFilters, setGraphFilters] = useState({
    keywords: [],
    communities: [],
  });

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  });

  useEffect(() => {
    fetch("./api/helloworld")
      .then((res) => res.text())
      .then((text) => console.log(text));

    const fetchLatestGraph = async () => {
      const dates = await fetchDates();
      const datesArray = dates.Date;
      const latestDate = datesArray[datesArray.length - 1];

      setGraphDate(formatDate(latestDate));

      console.log("latest date");
      console.log(latestDate);

      setNeighborhoodSettings(neighborhoodSettings.set("date", latestDate));

      console.log("neighborhood settings state");
      console.log(neighborhoodSettings.toObject());

      const subgraph = await fetchNeighborhood({
        id: 1,
        date: datesArray[datesArray.length - 1],
        depth: 20,
      });

      console.log(subgraph);

      setData(processGraph(subgraph));
    };

    fetchLatestGraph();
  }, []);

  async function fetchDates() {
    const response = await fetch("./api/graphDates", {
      method: "POST",
    });

    const dates = await response.json();

    console.log("Dates:");
    console.log(dates);

    return dates;
  }

  async function fetchNeighborhood(settings) {
    console.log("in fetchNeighborhood");
    console.log(neighborhoodSettings.toObject());

    const response = await fetch("./api/neighborhood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: settings }),
    });

    const subgraph = await response.json();
    return subgraph;
  }

  async function fetchObjects(settings) {
    const response = await fetch("./api/findObject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: settings }),
    });

    const objects = await response.json();
    return objects;
  }

  function processGraph(graphJson) {
    // Set id field and source/target
    let nodes = graphJson.nodes;
    let links = graphJson.links;

    nodes.forEach((node) => {
      node.id = node.node_id;
      delete node.node_id;

      node.neighbors = [];
      node.links = [];
    });

    links.forEach((link) => {
      link.id = link.rel_id;
      delete link.rel_id;

      link.source = nodes.find((node) => node.id === link.obj1);
      link.target = nodes.find((node) => node.id === link.obj2);

      if (link.source && link.target) {
        link.source.neighbors.push(link.target);
        link.source.links.push(link);

        if (link.source !== link.target) {
          link.target.neighbors.push(link.source);
          link.target.links.push(link);
        } else {
          link.curvature = 3;
        }
      }
    });

    return { nodes: nodes, links: links };
  }

  async function updateSubgraph(settings, focus) {
    console.log("settings");
    console.log(settings);

    const subgraph = await fetchNeighborhood(settings);
    const processedSubgraph = processGraph(subgraph);
    console.log("Request data");
    console.log(subgraph);

    setData(processedSubgraph);

    setGraphDate(formatDate(settings.date));

    if (focus) {
      setCurrentNode(processedSubgraph.nodes.find((node) => node.id === focus));
    }
  }

  /*
        *************************************************************
        EVENT HANDLERS
        *************************************************************
    */

  function onWindowResize() {
    // Proportional size after resize
    setGraphWidth((graphWidth / splitWidth) * window.innerWidth);
    setGraphHeight(window.innerHeight - 100);

    setSplitWidth(window.innerWidth);
  }

  /*
        This is what gets called when the SplitPane bar is
        moved to resize the panes but not the component
    */
  function onSplitResize(size) {
    setGraphWidth(size);
  }

  function onNodeClick(node, event) {
    setCurrentNode(node);
  }

  function onPageChange(newIndex) {
    setCurrentPageIndex(newIndex);
  }

  function setGraphFilter(field, value) {
    let filterCopy = Object.assign({}, graphFilters);
    filterCopy[field] = value;
    setGraphFilters(filterCopy);
  }

  async function filterGraph() {
    console.log("graphFilters");
    console.log(graphFilters);

    let newFilter = Object.assign({}, graphFilters);
    newFilter.keywords = graphFilters.keywords.split(";");

    const objects = await fetchObjects(newFilter);
    setSearchedObjects(objects);
    console.log(searchedObjects);
    // fetchGraph();
  }

  function communityMembers(node) {
    return data.nodes.filter((n) => n.community === node.community);
  }

  async function voteNode(node, vote) {
    const max_neighbors = 20;
    const neighbors = node.links.length; // Yes yes this is sloppy (and incorrect) but it's "correct enough"

    const neighborLimit = Math.min(max_neighbors, neighbors);

    for (let i = 0; i < neighborLimit; i++) {
      let link = node.links[i];
      let neighbor = node.id === link.source.id ? link.target : link.source;

      const payload = {
        id: neighbor.id,
        date: neighbor.Date,
        vote: vote,
      };

      console.log("payload");
      console.log(payload);
      console.log(node);

      await fetch("./api/voteNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: payload }),
      });

      const linkPayload = {
        id: link.id,
        date: link.Date,
        sourceId: link.obj1,
        targetId: link.obj2,
        vote: vote,
      };

      await fetch("./api/voteRel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: linkPayload }),
      });
    }
  }

function arrayExistsIn(arr, str) {
  let result = false;;

  arr.forEach(element => {
    if(str.indexOf(element) > -1) {
      result = true;
    }
  });

  return result;
}

function focusGraph(focus) {
  // let focusArray = focus.split(";");

  // let dataCopy = Object.assign({}, data);
  // let nodes = dataCopy.nodes;
  // let filteredNodes = nodes.filter(node => arrayExistsIn(focusArray, node.node));

  // let filteredLinks = dataCopy.links.filter(link => arrayExistsIn(focusArray, link.source.node) && arrayExistsIn(focusArray, link.target.node))

  // dataCopy.nodes = filteredNodes;
  // dataCopy.links = filteredLinks;

  // setData(dataCopy);

  setFocusString(focus);
}

  return (
    <div className="App">
      <MainLayout date={graphDate}>
        <StyledSplitPane
          split="vertical"
          minSize={200}
          defaultSize={(window.innerWidth / 3) * 2}
          onChange={onSplitResize}
          size={graphWidth}
          pane2Style={{ overflowX: "auto" }}
        >
          <GraphViewer
            width={graphWidth}
            height={graphHeight}
            data={data}
            onNodeClick={onNodeClick}
            currentNode={currentNode}
            focusString={focusString}
          />

          <MenuAndFooter>
            <GraphSwitchMenu
              pageIndex={currentPageIndex}
              onIndexChange={onPageChange}
              currentNode={currentNode}
              setCurrentNode={(node) => {
                setCurrentNode(node);
              }}
              communityMembers={communityMembers}
              filters={graphFilters}
              setFilters={setGraphFilter}
              filter={filterGraph}
              searchedNodes={searchedObjects.nodes}
              updateSubgraph={updateSubgraph}
              voteNode={voteNode}
              focusGraph={focusGraph}
            />
            <Footer />
          </MenuAndFooter>
        </StyledSplitPane>
      </MainLayout>
    </div>
  );
}

export default App;
