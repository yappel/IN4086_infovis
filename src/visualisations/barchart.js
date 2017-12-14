import BaseVisualisation from "./basevisualisation.js";

class BarChart extends BaseVisualisation {

    enable(metricName) {
        var i= this.countsToDisplay.indexOf(metricName);
        if(i === -1) {
            this.countsToDisplay.push(metricName);
        }
    }

    disable(metricName) {
        var i= this.countsToDisplay.indexOf(metricName);
        if(i > -1) {
            this.countsToDisplay.splice(i,1);
        }
    }

    constructor(root, filterChangedCallback, data, options) {
        super(root, filterChangedCallback);

        var domnode = root.node();
        var containerSize = domnode.getBoundingClientRect();

        this.countsToDisplay = options.countsToDisplay ? options.countsToDisplay : [];
        var margin = {
                top: 20,
                right: 20,
                bottom: 70,
                left: 80
            },
            width = containerSize.width - margin.left - margin.right,
            height = containerSize.height - margin.top - margin.bottom;
       
        this.height = height;

        this.innerScaleBand = d3.scaleBand().padding(0.05);
        var metrics = this.tag().Metrics;
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

        this.svg = d3.select("#barchart").append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
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
            
    }

    update(data, filtered_data, data_has_changed = false) {
        /**
         * Updates the domain of the y axis.
         */
        var updateYAxis = function (tags) {
            var allcounts = Object.keys(tags).map(tag => countsToDisplay.map(m => tags[tag][m]));
            var maxy = d3.max([].concat(...allcounts), i=>i);
            yScaleBand.domain( [0, maxy] );
            chart.select(".yAxis").call(yAxis);
        };

        /**
         * Updates the domain of the x axis.
         */
        var updateXAxis = function (tags) {
            xScaleBand.domain(Object.keys(tags).sort());
            chart.select(".xAxis")
                .call(xAxis)
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
         * Updates the amount of bars that should be shown per tag.
         */
        var updateCountsToDisplay = function (countsToDisplay, xScaleBand) {
            innerScaleBand.domain(countsToDisplay).rangeRound([0, xScaleBand.bandwidth()]);
        }
        
        /**
         * Update the bars of the bar chart.
         */
        var updateBars = function () {
            dataGroup.selectAll("g")
                .data(Object.values(filteredTags))
                .enter().append("g")
                    .attr("transform", (d) => `translate(${xScaleBand(d.TagName)},0)`);
            
            var bars = dataGroup.selectAll("g").selectAll("rect")
                .data((d) => {return countsToDisplay.map(m => ({measure:m, count :d[m]}))})
            
            bars.transition()
                .attr("width", innerScaleBand.bandwidth())
                .attr("height", (d) => height - yScaleBand(d.count))
                .attr("fill", (d) => colorScheme(d.measure))
                .attr("y", (d) => yScaleBand(d.count))
                .attr("x", (d) =>innerScaleBand(d.measure));
            bars.enter().append("rect")
                    .style("opacity", "0")
                    .attr("fill", (d) => colorScheme(d.measure))
                    .attr("x", (d) =>innerScaleBand(d.measure))
                    .attr("y", (d) => height)
                    .attr("height", (d) => 0)
                    .transition()
                    .style("opacity", "1")
                    .attr("y", (d) => yScaleBand(d.count))
                    .attr("width", innerScaleBand.bandwidth())
                    .attr("height", (d) => height - yScaleBand(d.count))
                bars.merge(bars)
                    

            bars.exit().transition()
                .style("opacity", "0")
                .attr("height", (d) => 0)
                .attr("y", (d) => height)
                .remove();
        }
       


        super.update(data, filtered_data, data_has_changed);
        console.log("Updating data for barchart...");
        var tags = this.transformData(data);
        var filteredTags = this.transformData(filtered_data);

        var countsToDisplay = this.countsToDisplay;
        var height = this.height;
        var yAxis = this.yAxis;
        var xAxis = this.xAxis;
        var chart = this.svg;
        var yScaleBand  = this.yScaleBand   ;
        var xScaleBand = this.xScaleBand;
        var innerScaleBand = this.innerScaleBand;
        var colorScheme = this.colorScheme;
        var dataGroup = this.dataGroup;

        updateYAxis(filteredTags);
        updateXAxis(filteredTags);
        updateCountsToDisplay(countsToDisplay, xScaleBand);
        updateBars();
        
        console.log("Data for barChart updated!");
    }

    filter(data) {
        // TODO: filtering
        return data;
    }


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