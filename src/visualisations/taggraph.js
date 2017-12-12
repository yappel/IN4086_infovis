import * as d3 from "d3";
import BaseVisualisation from "./basevisualisation.js";
/**
 * Graph visualising the connection between different tags. Each node is a tag and the edges between tags is the 
 * count of posts which have been tagged by both tags making up the edge.
 * Used as explanation of force simulation: https://bl.ocks.org/mbostock/4062045
 */
class TagGraph extends BaseVisualisation {

    initSelectionStuff() {
        var svg = d3.select("svg");
        var dragstart = this.dragstart;
        var dragend = this.dragend;
        var nodes = this.nodes;
        var self = this;
        
        function dragStart() {
            var p = d3.mouse(this);
            self.dragstart = p;
            self.selectionRect = self.svg.append("rect")
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
            
            self.selectionRect
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
            var res =  x > minx && x < maxx
                && y > miny && y < maxy;
            return res;
        }
        
        
        function dragEnd() {
            var p = d3.mouse(this);
            self.dragend = p;
            self.selectionRect.remove();
            nodes.selectAll("circle")
                .attr("fill", (d) => isInsideSelection(d) ? "green" : "red");
        }
        
        var dragBehavior = d3.drag()
            .on("drag", dragMove)
            .on("start", dragStart)
            .on("end", dragEnd);
        
        svg.call(dragBehavior);
    }


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
        this.initSelectionStuff();
    }

    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        // TODO: visualisation

        var data_subset = data;
        //data.slice(0,21);
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
        // var posts = {};
        // var nodes = {};
        // data.forEach(d => {
        //     var tagid = parseInt(d.TagId);
        //     if(!posts[d.PostId]) {
        //         posts[d.PostId] = [tagid];
        //     } else {
        //         posts[d.PostId].push(tagid);
        //     }
        //     if(!nodes[tagid]) {
        //         nodes[tagid] = true;
        //     }
        // });
        // var links = {};
        // Object.keys(nodes).forEach(postId => {
        //     var tags = posts[postId];
        //     Object.keys(tags).forEach(tag1 => {
        //         tags.forEach(tag2 => {
        //             if(tag1 === tag2) return;
        //             if(links[tag1]) {
        //                 if(links[tag1][tag2]) {
        //                     links[tag1][tag2] += 1;
        //                 } else {
        //                     links[tag1][tag2] = 1;
        //                 }
        //             } else  if(links[tag2]) {
        //                 if(links[tag2][tag1]) {
        //                     links[tag2][tag1] += 1;
        //                 } else {
        //                     links[tag2][tag1] = 1;
        //                 }
        //             } else {
        //                 links[tag1] = {};
        //                 links[tag1][tag2] = 1;
        //             }
        //         });
        //     });
        // })
        // var res = {
        //     nodes: Object.keys(nodes).map(n => ({id:parseInt(n.id)})),
        //     links: Object.keys(links).map(t1 => t1.map(t2 => ({source:parseInt(t1),target:parseInt(t2), value:links[t1][t2]}) ))
        // }
        // return res;
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