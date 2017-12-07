import * as d3 from "d3";
import BaseVisualisation from "./basevisualisation.js";
/**
 * Graph visualising the connection between different tags. Each node is a tag and the edges between tags is the 
 * count of posts which have been tagged by both tags making up the edge.
 * Used as explanation of force simulation: https://bl.ocks.org/mbostock/4062045
 */
class TagGraph extends BaseVisualisation {

    /**
     * Constructor for TagGraph. Appends an svg element to root of specified width and height in options and 
     * creates a d3 ForceSimilated graph in there.
     * @param {*} root - The root html element the visualisation can use
     * @param {*} filterChangedCallback - The function to call when the visualisations filter has changed
     * @param {Object} options - The options to use for this visualisation.
     */
    constructor(root, filterChangedCallback, options) {
        super(root, filterChangedCallback);
        this.options = {
            width: 300,
            height: 300,
            node_radius: 5
        };
        Object.assign(this.options, options);
        this.svg = root.append("svg")
            .attr("width", this.options.height)
            .attr("height", this.options.width);
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id((d) => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.options.width / 2, this.options.height / 2));
        this.links = this.svg.append("g")
            .attr("class", "links");
        this.nodes = this.svg.append("g")
            .attr("class", "nodes");
    }

    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        // TODO: visualisation

        var data_subset = data.slice(0,21);
        console.log("data subset");
        console.log(data_subset);
        var nested_data = d3.nest()
            .key((d) => d.PostId)
            .entries(data_subset);
        console.log("nested data");
        console.log(nested_data);
        
        var link_data = [];
        var node_data = [];
        this.transformed_data = this.transformData(data);

        this.links.selectAll("line")
            .data(this.transformed_data.links)
            .enter().append("line")
                .attr("stroke-width", (d) => Math.sqrt(d.value)) // TODO: other function for weight
                .attr("stroke", (d) => "#0000ff"); // TODO: derive colour from value
            // TODO: update, exit

        this.nodes.selectAll("circle")
            .data(this.transformed_data.nodes)
            .enter().append("circle")
                .attr("r", this.options.node_radius)
                .attr("fill", (d) => "#ff0000") // TODO: change colour based on ID
                //.call(...) TODO: logic for interaction
            // TODO: update, exit
        this.simulation
            .nodes(this.transformed_data.nodes)
            .on("tick", this.ticked.bind(this))
        this.simulation
            .force("link")
            .links(this.transformed_data.links);
    }

    filter(data) {
        // TODO: filtering
        return data;
    }

    ticked() {
        this.links.selectAll("line")
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        this.nodes.selectAll("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
    }

    transformData(data) {
        // TODO: transform the actual data
        return {
            nodes: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
                { id: 5 }
            ],
            links: [
                { source: 1, target: 2, value: 1 },
                { source: 1, target: 3, value: 15 },
                { source: 1, target: 4, value: 10 },
                { source: 2, target: 3, value: 1 },
                { source: 3, target: 4, value: 13 }
            ]
        }
    }
}

export default TagGraph;