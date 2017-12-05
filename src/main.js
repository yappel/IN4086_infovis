import * as d3 from "d3";
import BaseVisualisation from "./visualisations/basevisualisation.js";
import TagGraph from './visualisations/taggraph.js';
import data_url from '../data/data.csv';

var data = [];
var visualisations = [];

d3.csv(data_url, (d) => {
    data = d;
    var graph = new TagGraph(d3.select("#taggraph"), data, {});
    visualisations.push(graph);
});

