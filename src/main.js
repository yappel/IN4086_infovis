import * as d3 from "d3";
import BaseVisualisation from "./visualisations/basevisualisation.js";
import TagGraph from './visualisations/taggraph.js';
import data_url from '../data/data.csv';

var data = [];
var visualisations = [];

var numeric_value_properties = ["Count", "Score", "ViewCount", "AnswerCount", "CommentCount", "FavoriteCount"];

d3.csv(data_url, (d) => {
    data = d;
    data.forEach(data_element => {
        numeric_value_properties.forEach(id => {
            data_element[id] = parseInt(data_element[id]);
        });
    });
    var graph = new TagGraph(d3.select("#taggraph"), data, {});
    visualisations.push(graph);
    console.log(data);
});

