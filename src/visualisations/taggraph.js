import * as d3 from "d3";
import BaseVisualisation from "./basevisualisation.js";

/**
 * Graph visualising the connection between different tags. Each node is a tag and the edges between tags is the
 * count of posts which have been tagged by both tags making up the edge.
 * Used as explanation of force simulation: https://bl.ocks.org/mbostock/4062045
 */
class TagGraph extends BaseVisualisation {

<<<<<<< HEAD
=======
    initSelectionStuff() {
        var svg = d3.select("svg");
        var dragstart = this.dragstart;
        var dragend = this.dragend;
        var nodes = this.nodes;
        var self = this;
        var selectionRect = null;

        function dragStart() {
            var p = d3.mouse(this);
            self.dragstart = p;
            selectionRect = self.svg.append("rect")
                    .attr("x",p[0])
                    .attr("y",p[1])
                    .attr("width",0)
                    .attr("height",0)
                    .style("opacity",0.4);
        }

        function dragMove() {
            var p = d3.mouse(this);
            var width = Math.abs(self.dragstart[0] - p[0]);
            var height = Math.abs(self.dragstart[1] - p[1]);
            var x = self.dragstart[0] < p[0] ? self.dragstart[0] : p[0];
            var y = self.dragstart[1] < p[1] ? self.dragstart[1] : p[1];

            selectionRect
                    .attr("x",x)
                    .attr("y",y)
                    .attr("width", width)
                    .attr("height", height);
        }

        var isInsideSelection = function(d) {
            if(!self.dragstart || !self.dragend) return true;
            var x = d.x;
            var y = d.y;
            var minx = Math.min(self.dragstart[0],self.dragend[0]);
            var miny = Math.min(self.dragstart[1],self.dragend[1]);
            var maxx = Math.max(self.dragstart[0],self.dragend[0]);
            var maxy = Math.max(self.dragstart[1],self.dragend[1]);
            console.log(minx,miny,maxx,maxy,x,y);
            var res =  x > minx && x < maxx
                && y > miny && y < maxy;
            return res;
        }


        function dragEnd() {
            var p = d3.mouse(this);
            self.dragend = p;
            selectionRect.remove();
            self.selectedTags = [];
            nodes.selectAll("circle")
                .attr("fill", (d) => isInsideSelection(d) ? "green" : "red")
                .each(d => {
                    if (isInsideSelection(d)) {
                        self.selectedTags.push(d.id);
                    }
                });
            // console.log(self.dragstart);
            // console.log(self.dragend);
            self.filterChanged();
        }

        var dragBehavior = d3.drag()
            .on("drag", dragMove)
            .on("start", dragStart)
            .on("end", dragEnd);

        svg.call(dragBehavior);
    }


>>>>>>> 19787496dfdabf7d7bda23aa4f3f911d36aec091
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

        this.selection = {
            dragBehaviour: d3.drag()
                .on("start", this.selectionDragStarted.bind(this))
                .on("end", this.selectionDragEnded.bind(this))
                .on("drag", this.selectionDragMoved.bind(this)),
            rectangle: null,
            minCoords: [],
            maxCoords: [],
            selectedTags: []
        }
        this.svg.call(this.selection.dragBehaviour);
    }

    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        // TODO: visualisation

        var data_subset = data.slice(0,21);
        var nested_data = d3.nest()
            .key((d) => d.PostId)
            .entries(data_subset);

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
        // console.log("Start applying taggraph filter");
        var filtered = data;
        if(this.selectedTags.length >0 ) {
            filtered =  data.filter(d => this.selectedTags.indexOf(d.TagName) >= 0);
        }
        console.log("selectedTags", this.selectedTags);
        // console.log("data", data);
        // console.log("filtered", filtered);
        // console.log("Finished applying taggraph filter");
        return filtered;
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
        // Aggregate the data per post
        var nested_data = d3.nest()
            .key(d => d.PostId)
            .entries(data);
        // The nodes per tag
        var nodes = d3.map(data, d => d.TagName).keys();
        // Create the matrix indicating the amount of connections between nodes
        var connection_matrix = {};
        nested_data.forEach(element => {
            if (element.values.length > 1) {
                for (var i = 0; i < element.values.length; i++) {
                    var tagNameI = element.values[i].TagName;
                    for (var j = i + 1; j < element.values.length; j++) {
                        var tagNameJ = element.values[j].TagName
                        if (!connection_matrix[tagNameI]) {
                            connection_matrix[tagNameI] = {};
                        }
                        if (connection_matrix[tagNameI][tagNameJ]) {
                            connection_matrix[tagNameI][tagNameJ] = connection_matrix[tagNameI][tagNameJ] + 1;
                        } else {
                            connection_matrix[tagNameI][tagNameJ] = 1;
                        }

                        if (!connection_matrix[tagNameJ]) {
                            connection_matrix[tagNameJ] = {};
                        }
                        if (connection_matrix[tagNameJ][tagNameI]) {
                            connection_matrix[tagNameJ][tagNameI] = connection_matrix[tagNameJ][tagNameI] + 1;
                        } else {
                            connection_matrix[tagNameJ][tagNameI] = 1;
                        }
                    }
                }
            }
        });
        // Create all the links
        var links = [];
        for (var i = 0; i < nodes.length; i++) {
            var tagNameI = nodes[i];
            for (var j = i + 1; j < nodes.length; j++) {
                var tagNameJ = nodes[j];
                if (connection_matrix[tagNameI] && connection_matrix[tagNameI][tagNameJ]){
                    links.push({
                        source: tagNameI,
                        target: tagNameJ,
                        value: connection_matrix[tagNameI][tagNameJ]
                    });
                }
            }
        }

        return {
            nodes: nodes.map(d => ({id: d})),
            links: links
        };
    }

    /**
     * Returns true when an object is inside the selection.
     * @param {Object} node - The object to check if it is in the selection
     * @param {Number} node.x - The x coordinate of the object
     * @param {Number} node.y - The y coordinate of the object
     */
    isInsideSelection(node) {
        return (
            node.x > this.selection.minCoords[0]
            && node.x < this.selection.maxCoords[0]
            && node.y > this.selection.minCoords[1]
            && node.y < this.selection.maxCoords[1]
        );
    }

    /**
     * Callback function for when a drag event is started in the svg.
     * Updates the selections coordinates and adds a selection visualisation to 
     * the svg.
     */
    selectionDragStarted() {
        var p = d3.mouse(this.svg.node());
        this.selection.dragStartCoords = p;
        this.selection.minCoords = [ p[0], p[1] ];
        this.selection.maxCoords = [ p[0], p[1] ];
        this.selection.rectangle = this.svg.append("rect");
        this.redrawSelectionRectangle();
    }

    /**
     * Callback function for a drag moved event. Updates the selection coordinate and 
     * redraws the selection visualisation for the svg.
     */
    selectionDragMoved() {
        var p = d3.mouse(this.svg.node());
        this.selection.minCoords[0] = Math.min(this.selection.dragStartCoords[0], p[0]);
        this.selection.minCoords[1] = Math.min(this.selection.dragStartCoords[1], p[1]);
        this.selection.maxCoords[0] = Math.max(this.selection.dragStartCoords[0], p[0]);
        this.selection.maxCoords[1] = Math.max(this.selection.dragStartCoords[1], p[1]);
        this.redrawSelectionRectangle();
    }

    /**
     * Callback function for a drag ended event. Removes the selection visualisation from 
     * the svg, updates the visualisation of the nodes based on the selection and calls the 
     * filterChanged function.
     */
    selectionDragEnded() {
        this.selection.rectangle.remove();
        this.selection.selectedTags = [];
        this.nodes.selectAll("circle")
            .attr("fill", d => this.isInsideSelection(d) ? "green" : "red")
            .each(d => {
                if (this.isInsideSelection(d)) {
                    this.selection.selectedTags.push(d.id);
                }
            });
        this.filterChanged();
    }

    /**
     * Redraws the selection rectangle in the SVG based on the minimum and maximum coordinates 
     * of the selection.
     */
    redrawSelectionRectangle() {
        this.selection.rectangle
            .attr("x", this.selection.minCoords[0])
            .attr("y", this.selection.minCoords[1])
            .attr("width", Math.abs(this.selection.maxCoords[0] - this.selection.minCoords[0]))
            .attr("height", Math.abs(this.selection.maxCoords[1] - this.selection.minCoords[1]))
            .style("opacity", 0.2);
    }
}

export default TagGraph;