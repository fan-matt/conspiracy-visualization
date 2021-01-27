import React , {useState , useEffect} from 'react';

import MainLayout from './layouts/MainLayout';
import GraphViewer from './components/GraphViewer';


function App() {
    let [graphWidth , setGraphWidth] = useState(window.innerWidth / 2);
    let [graphHeight , setGraphHeight] = useState(window.innerHeight - 100);


    useEffect(() => {
        window.addEventListener('resize' ,  setDim);

        return () => {
            window.removeEventListener('resize' , setDim);
        }
    });

    function setDim() {
        setGraphWidth(window.innerWidth / 2)
        setGraphHeight(window.innerHeight - 100)
    }

    return (
        <div className="App">
            <MainLayout>
                <GraphViewer width={graphWidth} height={graphHeight} />
            </MainLayout>
        </div>
    );
}

export default App;
