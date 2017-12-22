import * as d3 from "d3";
import data_url from '../data/QueryResults.csv';
import TagGraph from './visualisations/taggraph.js';
import BarChart from './visualisations/barchart.js';
import StackedChart from './visualisations/stackedchart.js';
import StatisticsView from './visualisations/statisticsview.js';

// Init variables
var data = [];
var filtered_data = [];
var visualisations = [];

// data fields which are numeric
var numeric_value_properties = ["Count", "Score", "ViewCount", "AnswerCount", "CommentCount", "FavoriteCount"];

// Callback function used by visualisations on filter changes
var filterCallback = function (initiator) {
    visualisations.forEach(vis1 => {
        var filtered_data = data;
        visualisations.forEach(vis2 => {
            // Don't filter own data
            if (vis1 !== vis2) {
                filtered_data = vis2.filter(filtered_data);
            } 
        });
        // Don't call update on initiator
        if (vis1 !== initiator) vis1.update(data, filtered_data, false);
    });
}
// Load in the data
d3.csv(data_url, (d) => {
    data = d;
    filtered_data = d;
    // Parse numeric data from string for each data entry
    data.forEach(data_element => {
        numeric_value_properties.forEach(id => {
            if (data_element[id]) {
                data_element[id] = parseInt(data_element[id]);
            }
        });
    });
    // Create and add the visualisations
    var barchart = new BarChart(d3.select("#barchart"), filterCallback, {})
    visualisations.push(barchart);
    var graph = new TagGraph(d3.select("#taggraph"), filterCallback, {});
    visualisations.push(graph);
    var stackedchart = new StackedChart(d3.select("#stackedchart"), filterCallback, data,{});
    visualisations.push(stackedchart);
    var statistics = new StatisticsView(d3.select("#statistics"), filterCallback);
    visualisations.push(statistics);
    // Call update on all visualisations
    visualisations.forEach(vis => {
        vis.update(data, filtered_data, true);
    });
});