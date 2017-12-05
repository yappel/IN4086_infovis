import * as d3 from "d3";
import BaseVisualisation from "./visualisations/basevisualisation.js";
import TagGraph from './visualisations/taggraph.js';

var root = {};
var data = [];
var visualisations = [];

var graph = new TagGraph(d3.select("#taggraph"), data, {});
visualisations.push(graph);