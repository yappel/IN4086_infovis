import BaseVisualisation from "./basevisualisation.js";
import * as d3 from 'd3';

class BarChart extends BaseVisualisation {

    /**
     * Enable a certain metric (like ScoreCount) so it is visualized in the bar chart.
     * @param {*string} metricName the name of the metric to enable
     */
    enable(metricName) {
        var i= this.countsToDisplay.indexOf(metricName);
        if(i === -1) {
            this.countsToDisplay.push(metricName);
        }
        this.updateCountsDisplayed();
    }

    /**
     * Disable a certain metric (like ScoreCount) so it is no longer visualized in the bar chart.
     * @param {*string} metricName the name of the metric to disable
     */
    disable(metricName) {
        var i= this.countsToDisplay.indexOf(metricName);
        if(i > -1) {
            this.countsToDisplay.splice(i,1);
        }
        this.updateCountsDisplayed();
    }

    /**
     * Base constructor
     * @param {*} root - The root html element the visualisation can use
     * @param {*} filterChangedCallback - The function to call when the visualisations filter has changed
     * @param {Object} options - Holds different options avialable for the bar chart (optional)
     */
    constructor(root, filterChangedCallback, options) {
        super(root, filterChangedCallback);

        //Determine the size of the container the bar chart will be visualized in
        // so that the svg will span exactly the container.
        var domnode = root.node();
        var containerSize = domnode.getBoundingClientRect();

        this.countsToDisplay = options.countsToDisplay ? options.countsToDisplay : [];
        var margin = {
                top: 20,
                right: 20,
                bottom: 135,
                left: 80
            },
            width = containerSize.width - margin.left - margin.right,
            height = containerSize.height - margin.top - margin.bottom;
       
        this.height = height;
        this.totalwidth = containerSize.width;
        this.totalheight = containerSize.height;

        this.innerScaleBand = d3.scaleBand().padding(0.05);
        var metrics = this.tag().Metrics;

        //The color scheme for the metrics copied from http://colorbrewer2.org/
        var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];
        this.colorScheme = function(metricName) {
            var index = metrics.indexOf(metricName);
            return index < 0 || index > colors.length - 1 ? 'black' : colors[index]; 
        }

        var xScaleBand = d3.scaleBand()
            .range([0, width])
            .paddingInner(0.05);
        this.xScaleBand = xScaleBand;
            
        var yScaleBand = d3.scaleLinear().range([height, 0]).domain([0,100]);
        this.yScaleBand = yScaleBand;

        var xAxis = d3.axisBottom(xScaleBand);
        var yAxis = d3.axisLeft(yScaleBand);
        this.yAxis = yAxis;
        this.xAxis = xAxis;

        this.outersvg =  d3.select("#barchart").append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        this.svg = this.outersvg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.legendArea = this.outersvg.append("g");

        var metrics = this.tag().Metrics;
        var y = this.totalheight - 30;
        var legendScaleBand = d3.scaleBand()
            .range([0, this.totalwidth])
            .domain(metrics);
        var selection = this.legendArea
            .selectAll(".legendEntry").data(metrics);
        var enter = selection.enter().append("g").attr('class', 'legendEntry')
        var paddingLeft = 30;
        var rects = enter.append("rect")
               .attr("x", d => paddingLeft + legendScaleBand(d))
               .attr("y", y)
               .attr("width", 10)
               .attr("height", 10)
               .attr("fill", d => this.colorScheme(d));
        var texts = enter.append("text")
                .text(d=>d)
                .attr("x", d => paddingLeft + legendScaleBand(d) + 10 + 5)
                .style("font-size", "0.8em")
                .attr("y", y + 8);

        this.legend = this.legendArea
            .selectAll(".legendEntry");

        this.svg.append("g")
            .attr("class", "yAxis")
            .call(yAxis)
            
        this.svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "1.5em")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d){
                    return "rotate(-65)";
                });
        
        this.dataGroup = this.svg.append("g");

        this.legend - this.svg.append("g")
            
    }

    /**
     * Update function, updates the bar chart with the given data.
     * @param {Object[]} data - The collection of data
     * @param {Object[]} filtered_data - The collection of filtered data
     * @param {boolean} data_has_changed - Boolean indicating if the data has been changed from last time
     */
    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        console.log(`[ data.length : ${data.length}, filtered_data.length : ${filtered_data.length} ] ` + "Updating data for barchart...");
        this.tags = this.transformData(filtered_data);
        // var filteredTags = this.transformData(filtered_data);

        var self = this;

        this.updateXAxis();
        this.updateCountsDisplayed();
        
        console.log("Data for barChart updated!");
    }

    /**
     * Update the legend to be consistend with the currently shown data. 
     */
    updateLegend() {
        var selection = this.legend;
        selection
            .style("font-weight", d => this.countsToDisplay.indexOf(d) >= 0 ? "bold" : 'normal')
            .style("cursor", "pointer")
            .attr("class", d => this.countsToDisplay.indexOf(d) >= 0 ? "barchart-legend opacity1" : "barchart-legend opacity0-2")
            .on("click", (d) => this.countsToDisplay.indexOf(d) >= 0 ? this.disable(d) : this.enable(d))
    }

    /**
     * Update the bar to be up to date with the data to be shown. 
     */
    updateBars() {
        var self = this;
        var tags = this.tags;
        var groups = self.dataGroup.selectAll("g").data(Object.values(tags));
        
        groups.exit().remove();
        var merged = groups.enter().append("g").merge(groups);
        merged.attr("transform", (d) => `translate(${self.xScaleBand(d.TagName)},0)`);
        var bars = merged.selectAll("rect")
        .data((d) => {return self.countsToDisplay.map(m => ({measure:m, count :d[m]}))});
    
        bars.transition()
            .attr("width", self.innerScaleBand.bandwidth())
            .attr("height", (d) => self.height - self.yScaleBand(d.count))
            .attr("fill", (d) => self.colorScheme(d.measure))
            .attr("y", (d) => self.yScaleBand(d.count))
            .attr("x", (d) => self.innerScaleBand(d.measure));
        bars.enter().append("rect")
                .style("opacity", "0")
                .attr("fill", (d) => self.colorScheme(d.measure))
                .attr("x", (d) => self.innerScaleBand(d.measure))
                .attr("y", (d) => self.height)
                .attr("height", (d) => 0)
                .transition()
                .style("opacity", "1")
                .attr("y", (d) => self.yScaleBand(d.count))
                .attr("width", self.innerScaleBand.bandwidth())
                .attr("height", (d) => self.height - self.yScaleBand(d.count));
        bars.exit().transition()
                .style("opacity", "0")
                .attr("height", (d) => 0)
                .attr("y", (d) => self.height)
                .remove();
        
    }

    /**
     * Update the bottom axis to be up to date with the data to be shown. 
     */
    updateXAxis() {
        var self = this;
        var tags = this.tags;
        self.xScaleBand.domain(Object.keys(tags).sort());
        self.svg.select(".xAxis")
            .call(self.xAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "1.5em")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d){
                    return "rotate(-65)";
                });;
    };

    /**
     * Update the left axis to be up to date with the data to be shown. 
     */
    updateYAxis() {
        var self = this;
        var tags = this.tags;
        var allcounts = Object.keys(tags).map(tag => self.countsToDisplay.map(m => tags[tag][m]));
        var maxy = d3.max([].concat(...allcounts), i=>i);
        self.yScaleBand.domain( [0, maxy] );
        self.svg.select(".yAxis").call(self.yAxis);
    };

    /**
     * Callback for when the data or countsToDisplay have been changed.
     * This method updates the barchart elements.
     */
    updateCountsDisplayed() {
        this.innerScaleBand.domain(this.countsToDisplay).rangeRound([0, this.xScaleBand.bandwidth()]);
        this.updateYAxis();
        this.updateBars();
        this.updateLegend();
    }

    /**
     * Represents a tag object as used by bar chart.
     * Holds the name of the tag and the different metrics calculated for that tag.
     * @param {*Object} dataEntry An anitial raw data entry to initialize the metrics with (optional)
     */
    tag(dataEntry) {
        var self = {};
        var userIds = {}
        self.Metrics = ["AnswerCount","CommentCount","FavoriteCount","ViewCount","OwnerUserIdCount","ScoreCount"]
        if(!dataEntry) return self;

        self.TagName = dataEntry.TagName;
        self.AddDataEntry = function (dataEntry) {
            if (dataEntry["AnswerCount"])
                self.AnswerCount += parseInt(dataEntry.AnswerCount);
            if (dataEntry["CommentCount"])
                self.CommentCount += parseInt(dataEntry.CommentCount);
            if (dataEntry["FavoriteCount"])
                self.FavoriteCount += parseInt(dataEntry.FavoriteCount);
            if (dataEntry["ViewCount"])
                self.ViewCount += parseInt(dataEntry.ViewCount);
            if (dataEntry["OwnerUserId"] && !userIds[dataEntry.OwnerUserId]) {
                userIds[dataEntry.OwnerUserId] = true;
                self.OwnerUserIdCount += 1;
            }
            if (dataEntry["Score"])
                self.ScoreCount += parseInt(dataEntry.Score);
        }
        self.AnswerCount = 0;
        self.CommentCount = 0;
        self.FavoriteCount = 0;
        self.ViewCount = 0;
        self.OwnerUserIdCount = 0;
        self.ScoreCount = 0;
        self.AddDataEntry(dataEntry);
        return self;
    };

    /**
     * Transform the raw data to tag objects that can be used
     * to create the bar chart.
     * @param {*Object[]} data 
     */
    transformData(data) {
        var tags = {};
        var tag = this.tag;
        data.forEach(function (d) {
            if (tags[d.TagName]) {
                tags[d.TagName].AddDataEntry(d);
            } else {
                tags[d.TagName] = tag(d);
            }
        });
        return tags;
    }
}

export default BarChart;