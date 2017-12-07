import BaseVisualisation from "./basevisualisation.js";

class BarChart extends BaseVisualisation {


    constructor(root, filterChangedCallback, data, options) {
        super(root, data);
        if (options["countFunc"])
            this.countFunc = options.countFunc;
        else
            this.countFunc = (tag) => tag.FavoriteCount;

        var margin = {
                top: 20,
                right: 20,
                bottom: 70,
                left: 80
            },
            width = 1200 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
       
        this.height = height;

        var tags = {};
        data.forEach(function (d) {
            if (!tags[d.TagName]) {
                tags[d.TagName] = true;;
            }
        });

        var xChart = d3.scaleBand()
            .domain(Object.keys(tags).sort())
            .range([0, width])
            .paddingInner(0.05);
        this.xChart = xChart;
            
        this.barWidth = width / Object.keys(tags).length;

        var yChart = d3.scaleLinear().range([height, 0]).domain([0,100]);
        this.yChart = yChart;

        var xAxis = d3.axisBottom(xChart);
        var yAxis = d3.axisLeft(yChart);
        this.yAxis = yAxis;

        this.svg = d3.select("#barchart").append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        
        //set up axes
        // left axis
        this.svg.append("g")
            .attr("class", "yAxis")
            .call(yAxis)
            
        //bottom axis
        this.svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d){
                return "rotate(-65)";
            });

        this.tag = function (dataEntry) {
            var self = {};
            var userIds = {}

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
    }


    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        console.log("Updating data for barchart...");
        var tags = {};
        var tag = this.tag;
        data.forEach(function (d) {
            if (tags[d.TagName]) {
                tags[d.TagName].AddDataEntry(d);
            } else {
                tags[d.TagName] = tag(d);
            }
        });

        var maxy = d3.max(Object.values(tags), this.countFunc);
        // var x = this.x;
        // var y = this.y;
        var countFunc = this.countFunc;
        var height = this.height;
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;
        var chart = this.svg;
        var yChart = this.yChart;
        var xChart = this.xChart;
        var barWidth = this.barWidth;

        //Update y axis
        this.yChart.domain( [0, maxy] );
        chart.select(".yAxis").call(yAxis);
        
        //select all bars on the graph, take them out, and exit the previous data set. 
        //then you can add/enter the new data set
        var bars = chart.selectAll(".bar")
            .remove()
            .exit()
            .data(Object.values(tags))
        //now actually give each rectangle the corresponding data
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d, i) {
                return xChart(d.TagName)
            })
            .attr("y", function (d) {
                return yChart(countFunc(d));
            })
            .attr("height", function (d) {
                return height - yChart(countFunc(d));
            })
            .attr("width", xChart.bandwidth())
            .attr("fill", function (d) {
                    return "orange";
            });

        // this.svg.selectAll("bar")
        //     .data(Object.values(tags))
        //     .enter().append("rect")
        //     .style("fill", "steelblue")
        //     .attr("x", function (t) {
        //         return x(t.TagName);
        //     })
        //     .attr("width", x.rangeBand())
        //     .attr("y", function (t) {
        //         return y(countFunc(t));
        //     })
        //     .attr("height", function (t) {
        //         return height - y(countFunc(t));
        //     });
        
        console.log("Data for barChart updated!");
    }

    filter(data) {
        // TODO: filtering
        return data;
    }
}

export default BarChart;