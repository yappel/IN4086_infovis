import * as d3 from "d3";
import BaseVisualisation from "./visualisations/basevisualisation.js";

var root = {};
var bv = new BaseVisualisation(root, []);

d3.csv("../data/data.csv", function(error, data) {
    
    data.forEach(function(d) {
        d.date = d3.timeParse("%Y-%m").parse;
        d.value = +d.value;
    });

    console.log("Data processed");

});

console.log("all done");