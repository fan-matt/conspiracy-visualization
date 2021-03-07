class DataLoader {
    load(DATA) {
        this.data = DATA;

        // Build neighbors- this is for node/link hovering interaction
        // This isn't ideal, but better build it now than on the fly

        for(let link of this.data.links) {
            let source = Number(link.source);
            let target = Number(link.target);

            // Don't use Array.prototype.find since it returns the value and not the actual node
            let sourceNode = this.data.nodes[this.data.nodes.findIndex(node => Number(node.id) === source)];
            let targetNode = this.data.nodes[this.data.nodes.findIndex(node => Number(node.id) === target)];

            // This sets to empty array if it doesn't exist
            !sourceNode.neighbors && (sourceNode.neighbors = []);
            !targetNode.neighbors && (targetNode.neighbors = []);

            sourceNode.neighbors.push(targetNode);
            targetNode.neighbors.push(sourceNode);

            !sourceNode.links && (sourceNode.links = []);
            !targetNode.links && (targetNode.links = []);

            sourceNode.links.push(link);
            targetNode.links.push(link);
        }

        // Assign blank neighbors and links arrays to isolated nodes
        for(let node of this.data.nodes) {
            if(!node.neighbors) {
                node.neighbors = [];
            }

            if(!node.links) {
                node.links = [];
            }
        }
    }

    numNodes() {
        return this.data.nodes.length;
    }

    getData() {
        return this.data;
    }
}


export default DataLoader;