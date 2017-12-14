import * as d3 from "d3";
import TagGraph from './visualisations/taggraph.js';
import BarChart from './visualisations/barchart.js';
import data_url from '../data/QueryResults.csv';
import StackedChart from './visualisations/stackedchart.js';


var data = [];
var visualisations = [];
var barchart;

var numeric_value_properties = ["Count", "Score", "ViewCount", "AnswerCount", "CommentCount", "FavoriteCount"];

var filterCallback = function() {
    var filtered_data = data;
    visualisations.forEach(vis => {
        filtered_data = vis.filter(filtered_data);
    });
    visualisations.forEach(vis => {
        vis.update(data, filtered_data, false);
    });
}

d3.csv(data_url, (d) => {
    data = d;
    data.forEach(data_element => {
        numeric_value_properties.forEach(id => {
            if(data_element[id]) {
            data_element[id] = parseInt(data_element[id]);
            }
        });
    });
    var graph = new TagGraph(d3.select("#taggraph"), filterCallback, {});
    // barchart = new BarChart(d3.select("#barchart"), filterCallback, data, {})
    // visualisations.push(graph);
    // visualisations.push(barchart);
    console.log(data);
    visualisations.push(
        new StackedChart(d3.select("#stackedchart"), 
                        filterCallback, 
                        data, 
                        {})
    );

    window.barchart = barchart;
    window.visualisations = visualisations;
    window.data = data;

    
    visualisations.forEach(vis => {
        vis.update(data, data, true);
    });
});
var countsToDisplay = ["CommentCount", "OwnerUserIdCount", "AnswerCount", "FavoriteCount"];
window.updateBarChart = (val, checked) => {
    if(checked) {
        barchart.enable(val);
    }
    else {
        barchart.disable(val);
    }
    barchart.update(data,data,true);
}

