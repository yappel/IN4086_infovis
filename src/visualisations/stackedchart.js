import BaseVisualisation from './basevisualisation.js';

class StackedChart extends BaseVisualisation {

    constructor(root, filterCallback, data, options) {
        super(root, filterCallback);
        this.svg = root.append("svg");

        var domnode = root.node();
        var containerSize = domnode.getBoundingClientRect();

        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = containerSize.width - margin.left - margin.right,
            height = containerSize.height - margin.top - margin.bottom;

        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var x = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            z = d3.scaleOrdinal(d3.schemeCategory10);

        this.stack = d3.stack();

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        this.dataArea = this.g.append("g");

        this.xaxis = this.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")");
        this.yaxis = this.g.append("g")
            .attr("class", "axis axis--y");

        var radiobutton = 0;
        //BUG if I don't load the application in full 
        //screen this does not work
        this.svg.style("pointer-events", "visible")
            .on('click', function () {
                radiobutton = (radiobutton + 1) % 3;
            });

        this.radiobutton = radiobutton;
        this.totalCount = 1;
        this.scaleFactor = 1;
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.tags = [];

        var count = 0;
    }

    update(rawdata, filtered_data, data_has_changed = false, tags = []) {
        super.update(rawdata, filtered_data, data_has_changed);

        var yMax = 1;
        var yTicks = [10, "%"];

        //I need to implement a radiobutton about what to show:
        var radiobutton = 2;

        this.tags = tags.length < 1 ? this.standardKeys(filtered_data, 25) : tags;

        // if (!this.options.zoomed_percentage) this.tags.unshift("rest");

        var data = this.transformData(filtered_data);
        yMax = this.maxCount(data);
        yTicks = [10, "d"];

        // switch (radiobutton) {
        //     //Percentages, show 100%
        //     case 0:
        //         this.tags.push("rest");
        //         data = this.scaleData(data);
        //         yMax = this.maxCount(data);
        //         this.tags.pop();
        //         break;
        //     //Percentages, show zoomed
        //     case 1:
        //         data = this.scaleData(data);
        //         yMax = this.maxCount(data);
        //         break;
        //     //Number of posts
        //     case 2:
        //         this.tags.push("rest");
        //         yMax = this.maxCount(data);
        //         yTicks = [10, "d"];

        //         break;
        // }

        // if (tags.length < 1) this.tags = this.standardKeys(data, 5);


        // data = this.scaleData(data);

        // console.log(this.maxCount(data));

        var keys = this.tags;

        var x = this.x,
            y = this.y,
            z = this.z,
            g = this.g,
            width = this.width,
            height = this.height,
            stack = this.stack;

        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([0, yMax]);
        z.domain(keys);
        stack.keys(keys);
        var area = d3.area()
            .x(function (d, i) {return x(d.data.date); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); });

        var stackedData = stack(data);

        var layer = this.dataArea.selectAll("path")
            .data(stackedData);
        layer.exit()
            .transition()
            .style("opacity",0)
            .remove();

        var layerEnter = layer.enter().append("path")
            .attr("class", "area");
        layerEnter.merge(layer)
            .transition()
            .style("fill", function (d) { return z(d.key); })
            .attr("d", area)

        // layerEnter.append("text")
        // .style("font", "10px sans-serif")
        // .attr("dy", ".35em")
        // .attr("x",  6);
        // layerEnter.merge(layer).filter(function (d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.1; })
        //     // .attr("x", width - 6)
        //     // .style("text-anchor", "end")
        //     .attr("y", function (d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
        //     .text(function (d) { return d.key; });

        
        this.xaxis.call(d3.axisBottom(x));

        this.yaxis.call(d3.axisLeft(y).ticks(yTicks[0], yTicks[1]));
    }


    /**
     * Returns array of posts per tag per month 
     * (without last month or first month, 
     * because the months might not be complete).
     * @param {*} data 
     * @return {Array} posts per tag per month
     */
    transformData(data) {
        var countsPerMonth = {};
        var tags = this.tags;

        //Initialize countsPerMonth with all tags
        var minDate = data.reduce((min, curr) => min > curr.CreationDate ? curr.CreationDate : min, data[0].CreationDate);
        var maxDate = data.reduce((max, curr) => max < curr.CreationDate ? curr.CreationDate : max, data[0].CreationDate);
        var minYear = parseInt(minDate.slice(0, 4));
        var maxYear = parseInt(maxDate.slice(0, 4));
        var minMonth = parseInt(minDate.slice(5, 7));
        var maxMonth = parseInt(maxDate.slice(5, 7));

        for (var m = minMonth; m < 12; m++) {
            var tempDate = minYear + "-" + (m < 10 ? "0" + m : m);
            countsPerMonth[tempDate] = {
                "date": d3.timeParse("%Y-%m")(tempDate),
                "rest": 0
            };
            tags.forEach(t => countsPerMonth[tempDate][t] = 0);
        }
        for (var y = minYear + 1; y <= maxYear - 1; y++) {
            for (var m = 1; m <= 12; m++) {
                var tempDate = y + "-" + (m < 10 ? "0" + m : m);
                countsPerMonth[tempDate] = {
                    "date": d3.timeParse("%Y-%m")(tempDate),
                    "rest": 0
                };
                tags.forEach(t => countsPerMonth[tempDate][t] = 0);
            }
        }
        for (var m = 1; m < maxMonth; m++) {
            var tempDate = maxYear + "-" + (m < 10 ? "0" + m : m);
            countsPerMonth[tempDate] = {
                "date": d3.timeParse("%Y-%m")(tempDate),
                "rest": 0
            };
            tags.forEach(t => countsPerMonth[tempDate][t] = 0);
        }

        //count number of views per tag per month
        data.forEach(function (d, i) {
            var month = d.CreationDate.slice(0, 7);
            // if (i < 5) { console.log(countsPerMonth[month]) };
            if (!countsPerMonth[month]) return;
            if (tags.includes(d.TagName)) {
                countsPerMonth[month][d.TagName] += 1;
            } else {
                countsPerMonth[month]["rest"] += 1;
            }
        });

        return Object.values(countsPerMonth);;
    }

    /**
     * Scale data to percentages
     * @param {array} data 
     * @return {array} Array with all entries between 0 and 1, with the sum being 1
     */
    scaleData(data) {

        var getCountableKeys = function (countObject) {
            return Object.keys(countObject).filter(k => k !== "date");
        }
        var getSum = function (countObject) {
            return getCountableKeys(countObject).map(k => countObject[k]).reduce((sum, curr) => sum + parseInt(curr), 0);
        }

        var scaledData = [];
        data.forEach(d => scaledData.push(d));

        console.log(scaledData);
        var sums = {};
        scaledData.forEach(countObject => sums[countObject.date] = getSum(countObject));
        scaledData.forEach(
            countObject => getCountableKeys(countObject).forEach(
                (k) => countObject[k] = parseInt(countObject[k]) / sums[countObject.date]
            )
        );

        return scaledData;
    }

    maxCount(data) {
        var tags = this.tags;
        return data.reduce(function (max, curr) {
            var sum = 0;
            tags.forEach(t => sum += curr[t]);
            return sum > max ? sum : max;
        }, 0);

        // return data.reduce(function (max, curr) {
        //     var currMax = Object.values(curr).filter(v => !(v instanceof Date)).reduce(function (sum, curr) {
        //         return sum + curr;
        //     }, 0);
        //     return currMax > max ? currMax : max;
        // }, 0);
    }

    /**
     * When no options are chosen, choose the n tags with the most overall count
     * 
     * @param {Array} unsorted_data 
     * @param {int} n 
     * @return {Array} Array of n most popular keys
     */
    standardKeys(data, n) {
        var counts = {};
        data.forEach(function (d, i) {
            if (!counts[d.TagName]) {
                counts[d.TagName] = 1;
            } else {
                counts[d.TagName] += 1;
            }
        });
        var sorter = [];
        for (var tag in counts) {
            sorter.push([tag, counts[tag]]);
        }
        sorter.sort((a, b) => b[1] - a[1]);
        var sorted = [];
        sorter.forEach((d, i) => { if (i < n) sorted.push(d[0]) });

        return sorted;
    }


}

export default StackedChart;