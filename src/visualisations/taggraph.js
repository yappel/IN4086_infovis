import * as d3 from "d3";
import BaseVisualisation from "./basevisualisation.js";
import { json } from "d3";

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
        var domnode = root.node();
        var containerSize = domnode.getBoundingClientRect();
        // Merge options and default options
        this.options = {
            width: containerSize.width,
            height: containerSize.height,
            node_radius: 10,
            use_percentage: true
        };
        var style = {
            node_radius: 10,
            node_colour: "red",
            node_colour_hover: "orange",
            node_colour_selected: "green",
            node_stroke_colour: "#fff",
            node_stroke_width: 1.5,
            link_colour: "#0000ff"
        }
        Object.assign(this.options, options);
        this.options.style ? Object.assign(this.options.style, style) : this.options.style = style;
        // Create drawing element
        this.svg = root.append("svg")
            .attr("width", this.options.width)
            .attr("height", this.options.height);
        // Init the simulation forces
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id((d) => d.id))
            .force("charge", d3.forceManyBody()
                .strength(-0.3 * Math.min(this.options.height,this.options.width))
                .distanceMax([Math.min(this.options.height,this.options.width)]))
            .force("center", d3.forceCenter(this.options.width / 2, this.options.height / 2));
        // Create the selections for the links and nodes
        this.links = this.svg.append("g")
            .attr("class", "links");
        this.nodes = this.svg.append("g")
            .attr("class", "nodes");
        // Define behaviour for selection with dragging
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
        // Call super method & transform to graph data format
        super.update(data, filtered_data, data_has_changed);
        this.transformed_data = this.transformData(data)
        var filtered_data_transformed = this.transformData(filtered_data);
        this.transformed_data.links = filtered_data_transformed.links;
        // Define scale for opacity and force link weights
        var weightScale = d3.scaleLinear()
            .domain(d3.extent(this.transformed_data.links, function (d) { return Math.pow(d.value,1) }))
            .range([.01, 1]);
        // Select all links and update based on data
        var selected_links = this.links.selectAll("line")
            .data(this.transformed_data.links);
        selected_links
            .attr("stroke-width", (d) => weightScale(d.value) * 10) // TODO: other function for weight
            .attr("stroke", (d) => this.options.style.link_colour) // TODO: derive colour from value
            .style("opacity", (d) => Math.max(weightScale(d.value), 0.25));//(d) => weightScale(d.value));
        // Create new links
        selected_links.enter().append("line")
            .attr("stroke-width", (d) => weightScale(d.value) * 10) // TODO: other function for weight
            .attr("stroke", (d) => this.options.style.link_colour) // TODO: derive colour from value
            .style("opacity", (d) => Math.max(weightScale(d.value), 0.25));//(d) => weightScale(d.value));
        // Remove old links
        selected_links.exit().remove();
        // Select all nodes and update based on data
        var selected_nodes = this.nodes.selectAll("g")
            .data(this.transformed_data.nodes);
        // Update the circles
        selected_nodes.selectAll("circle")
            .attr("fill",  d => this.getCircleColor(d,null)) // TODO: change colour based on ID
            .attr("stroke", this.options.style.node_stroke_colour)
            .attr("stroke-width", this.options.style.node_stroke_width)
            .attr("r", this.options.node_radius);
        // Update the labels
        selected_nodes.selectAll("text")
            .style("color", "black")
            .text(function(d) { return d.id });
        // Append a new group for each node and define drag behaviour
        var new_nodes = selected_nodes.enter().append("g");
        new_nodes.call(d3.drag()
            .on("start", this.nodeDragStarted.bind(this))
            .on("drag", this.nodeDragMoved.bind(this))
            .on("end", this.nodeDragEnded.bind(this)));
        // Append a circle for node visualisation and define mouse behaviour and data
        var radius = this.options.node_radius;
        var hover_colour = this.options.style.node_colour_hover;
        new_nodes.append("circle")
            .on("mouseover", (item) => {
                var el = this.nodes.selectAll("circle").filter(d => d.id === item.id);
                el.transition()
                .attr("fill", hover_colour)
                .attr("r", 2 * radius);
            })
            .on("mouseout", (item) => {
                var el = this.nodes.selectAll("circle").filter(d => d.id === item.id);
                el.transition()
                    .attr("fill", d => this.getCircleColor(d, null))
                    .attr("r", radius)
            })
            .on("click", (item) => {
                var el = this.nodes.selectAll("circle").filter(d => d.id === item.id);
                var tags = this.selection.selectedTags;
                var index = tags.indexOf(item.id);
                if(index >= 0) {
                    tags.splice(index, 1);
                } else {
                    tags.push(item.id);
                }
                el.attr("fill", d => this.getCircleColor(d,null));
                this.filterChanged(this);
            })
            .attr("fill",  d => this.getCircleColor(d,null)) // TODO: change colour based on ID
            .attr("stroke", this.options.style.node_stroke_colour)
            .attr("stroke-width", this.options.style.node_stroke_width)
            .attr("r", this.options.node_radius);
        // Append label based on data
        new_nodes.append("text")
            .attr("dx", this.options.node_radius + 5)
            .attr("dy", ".35em")
            .style("color", "black")
            .text(function(d) { return d.id })
        // Remove the old nodes
        selected_nodes.exit().remove();
        // Restart the simulation
        this.simulation
            .nodes(this.transformed_data.nodes)
            .on("tick", this.ticked.bind(this));
        this.simulation
            .force("link").strength(d => weightScale(d.value))
            .links(this.transformed_data.links);
        this.simulation.alphaTarget(0.25).restart();
    }

    getCircleColor(d, selectedTags = null) {
        if(!selectedTags && this.selection) {
            selectedTags = this.selection.selectedTags
        }
        var defaultColor = this.options.style.node_colour;
        var selectedColor = this.options.style.node_colour_selected;
        if(selectedTags) {
            return selectedTags.indexOf(d.id) >= 0 ? selectedColor : defaultColor;
        }
        return defaultColor;
    }

    filter(data) {
        var filtered = data;
        if(this.selection.selectedTags.length > 0 ) {
            filtered =  data.filter(d => this.selection.selectedTags.indexOf(d.TagName) >= 0);
        }
        return filtered;
    }

    /**
     * Callback called by the simulation when a tick is performed to 
     * update the position of nodes and links.
     */
    ticked() {
        // Update link positions
        this.links.selectAll("line")
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
        // Update node group positions
        this.nodes.selectAll("g")
            .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    }

    /**
     * Callback function for a node when a drag is started on it.
     * @param {Object} node - The node which is dragged
     */
    nodeDragStarted(node) {
        // Determince alpha target
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    }

    /**
     * Callback function for a node when a drag is moved.
     * @param {Object} node - The node which is dragged
     */
    nodeDragMoved(node) {
        node.fx = d3.event.x;
        node.fy = d3.event.y;
    }

    /**
     * Callback function for a node when the dragging has stopped for this node.
     * @param {Object} node - The node which is dragged
     */
    nodeDragEnded(node) {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        node.fx = null;
        node.fy = null;
    }

    /**
     * Transforms all the data to a format suitable for the tag graph. Creates an object 
     * with a list of nodes and list of links between the nodes with a corresponding value.
     * @param {Object[]} data - The array of data objects
     */
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
        // Compute the totals for each tag
        var tags_nested = d3.nest()
            .key(d => d.TagName)
            .rollup(v => v.length)
            .entries(data);        
        var totals = {};
        tags_nested.forEach(element => totals[element.key] = element.value);
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
                        value: this.options.use_percentage ? connection_matrix[tagNameI][tagNameJ] / (totals[tagNameI] + totals[tagNameJ] - connection_matrix[tagNameI][tagNameJ]) : connection_matrix[tagNameI][tagNameJ]
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
        this.simulation.tick(); // Fix the simulation being stopped and having changed all the coordinates of the nodes
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
            .each(d => {
                if (this.isInsideSelection(d)) {
                    this.selection.selectedTags.push(d.id);
                }
            });
        this.nodes.selectAll("circle")
            .transition()
            .attr("fill", d => this.getCircleColor(d,this.selection.selectedTags));
        this.filterChanged(this);
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