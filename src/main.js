import * as d3 from "d3";
import TagGraph from './visualisations/taggraph.js';
import BarChart from './visualisations/barchart.js';
import data_url from '../data/QueryResults.csv';
import StackedChart from './visualisations/stackedchart.js';


var data = [];
var filtered_data = [];
var visualisations = [];
var barchart;

var numeric_value_properties = ["Count", "Score", "ViewCount", "AnswerCount", "CommentCount", "FavoriteCount"];

var filterCallback = function (initiator) {
    visualisations.forEach(vis1 => {
        var filtered_data = data;
        visualisations.forEach(vis2 => {
            // Don't filter own data
            if (vis1 !== vis2) {
                filtered_data = vis2.filter(filtered_data);
            } 
        });
        vis1.update(data, filtered_data, false);
    });
}
window.updateshit = () => {
    visualisations.forEach(vis => {
        vis.update(data, filtered_data, true);
    });
}

d3.csv(data_url, (d) => {
    data = d;
    filtered_data = d;
    data.forEach(data_element => {
        numeric_value_properties.forEach(id => {
            if (data_element[id]) {
                data_element[id] = parseInt(data_element[id]);
            }
        });
    });

    barchart = new BarChart(d3.select("#barchart"), filterCallback, data, {})
    visualisations.push(barchart);

    var graph = new TagGraph(d3.select("#taggraph"), filterCallback, {});
    visualisations.push(graph);
     
    var stackedchart = new StackedChart(d3.select("#stackedchart"), filterCallback, data,{});
    visualisations.push(stackedchart);

    window.barchart = barchart;
    window.taggraph = graph;
    window.stackedchart = stackedchart;
    window.visualisations = visualisations;
    window.data = data;
    window.updateshit();
});





window.updateBarChart = (val, checked) => {
    if (checked) {
        barchart.enable(val);
    }
    else {
        barchart.disable(val);
    }
}

