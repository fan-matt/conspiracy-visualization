import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import SwitchMenuPage from './SwitchMenuPage';

import ScrollContainer from './ScrollContainer';
import Input from './Input';

type StaticGraph = {
    graph_id: number;
    title: string;
}

type Props = {
    setGraph: (id: number, name: string) => void;
}

const StyledGraph = styled.div`
    padding: 10px 5px;
    line-height: 18px;
    cursor: pointer;

    transition: 0.3s;
    border-radius: 5px;

    & > h1 {
        color: cornflowerblue;
    }

    &:hover{
        background-color: darkslategray;
    }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;  

  margin: 30px 0;
  & > p {
    margin-bottom: 10px;
  }
`;

const GraphGraphsPage = ({ setGraph }: Props) => {
    const [graphIds, setGraphIds] = useState<Array<StaticGraph>>([]);

    function fetchGraphs() {
        fetch('./api/getStaticGraphList', {
            method: "GET"
        })
        .then((response) => response.json())
        .then((response) => {setGraphIds(response); console.log(response)});
    }

    useEffect(() => {
        console.log("Fetching graphs");
        fetchGraphs();
    }, []);

    const graphElements = graphIds.map((graph) => {
        return(
            <StyledGraph onClick={() => {
                setGraph(graph.graph_id, graph.title);
            }}>
                <h1> {graph.title} </h1>
            </StyledGraph>
        );
    })

    return (
        <SwitchMenuPage>
            <h1 style={{fontWeight: 'bold' , marginBottom: '40px'}}> Static Graphs: ({graphElements.length}) </h1>    
            
            {graphElements.length !== 0 ? 
                <ScrollContainer maxHeight={300}>
                    {graphElements}
                </ScrollContainer>

                : <> </>
            }


        <h1 style={{fontWeight: 'bold' , margin: '40px 0'}}> Graph Upload: </h1>    

        <form action="./api/storeGraph" encType="multipart/form-data" method="post">
            <Field>
                <p> Graph Name: </p>
                <Input type="text" name="title" required />
            </Field>

            <Field>
                <p> Node File: </p> 
                <Input type="file" name="nodes" required />
            </Field>

            <Field>
                <p> Relationship File: </p>
                <Input type="file" name="relationships" required />
            </Field>

            <Field>
                <p> Password: </p>
                <Input  type="password" name="password" required />
            </Field>

            <Input type="submit" value="Upload" />
        </form>
        </SwitchMenuPage>
    );
};

export default GraphGraphsPage;