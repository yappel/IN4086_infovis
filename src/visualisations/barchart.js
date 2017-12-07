import BaseVisualisation from "./basevisualisation.js";

class BarChart extends BaseVisualisation {


    constructor(root, filterChangedCallback, data, options) {
        super(root, data);

        var countsToDisplay = ["CommentCount", "OwnerUserIdCount", "AnswerCount", "FavoriteCount"];
        this.countsToDisplay = countsToDisplay;
        var margin = {
                top: 20,
                right: 20,
                bottom: 70,
                left: 80
            },
            width = 1200 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
       
        this.height = height;

        var tags = this.transformData(data);

        var innerAxis = d3.scaleBand()
            .padding(0.05);
        this.innerAxis = innerAxis;
        //Todo fix color scheme
        var colorScheme = d3.scaleOrdinal().range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']);
        this.colorScheme = colorScheme;
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
            .style("font-size", "1.5em")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d){
                return "rotate(-65)";
            });
        
        this.dataGroup = this.svg.append("g");
            
    }

    tag(dataEntry) {
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


    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        console.log("Updating data for barchart...");
        var tags = this.transformData(data);
        var countsToDisplay = this.countsToDisplay;

        var allcounts = Object.keys(tags).map(tag => countsToDisplay.map(m => tags[tag][m]));
        var maxy = d3.max([].concat(...allcounts), i=>i);
        // var x = this.x;
        // var y = this.y;
        var countFunc = this.countFunc;
        var height = this.height;
        var yAxis = this.yAxis;
        var chart = this.svg;
        var yChart = this.yChart;
        var xChart = this.xChart;
        var innerAxis = this.innerAxis;
        var colorScheme = this.colorScheme;

        innerAxis.domain(countsToDisplay).rangeRound([0, xChart.bandwidth()]);
        //Update y axis
        this.yChart.domain( [0, maxy] );
        chart.select(".yAxis").call(yAxis);
        
 
        this.dataGroup.selectAll("g")
            .data(Object.values(tags))
            .enter().append("g")
                .attr("transform", (d) => `translate(${xChart(d.TagName)},0)`)
            .selectAll("rect")
            .data((d) => countsToDisplay.map(m => ({measure:m, count :d[m]})))
            .enter().append("rect")
                .attr("x", (d) => innerAxis(d.measure))
                .attr("y", (d) => yChart(d.count))
                .attr("width", innerAxis.bandwidth())
                .attr("height", (d) => height - yChart(d.count))
                .attr("fill", (d) => colorScheme(d.measure));
      
        
        console.log("Data for barChart updated!");
    }

    filter(data) {
        // TODO: filtering
        return data;
    }
}

export default BarChart;