class DataLoader {
    load(DATA) {
        this.data = DATA;
    }

    numNodes() {
        return this.data.nodes.length;
    }

    getData() {
        return this.data;
    }
}


export default DataLoader;