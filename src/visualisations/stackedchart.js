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

        this.area = d3.area()
            .x(function (d, i) { return x(d.data.date); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); });

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.totalCount = 1;
        this.scaleFactor = 1;
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
    }

    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);

        data = this.transformData(filtered_data);

        var getCountableKeys = function (countsObject) {
            return Object.keys(countsObject).filter(k => k !== "date");
        }

        var getSum = function (countsObject) {
            return getCountableKeys(countsObject).map(k => countsObject[k]).reduce((sum, curr) => sum + parseInt(curr), 0);
        }
        
        var sums = {};
        data.forEach(countObject => sums[countObject.date] = getSum(countObject));
        data.forEach(
            countObject => getCountableKeys(countObject).forEach(
                (k) => countObject[k] = parseInt(countObject[k]) / sums[countObject.date]
            )
        );

        var keys = [];
        data.forEach(
            countObject => {
                keys = getCountableKeys(countObject);
                keys.forEach(
                    (k) => {
                        if (keys.indexOf(k) === -1) keys.push(k);
                    }
                )
            }
        );

        // console.log(keys);

        var x = this.x,
            y = this.y,
            z = this.z,
            g = this.g,
            width = this.width,
            height = this.height,
            area = this.area,
            stack = this.stack;


        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([0, this.scaleFactor]);
        z.domain(keys);
        stack.keys(keys);

        var layer = g.selectAll(".layer")
            .data(stack(data))
            .enter().append("g")
            .attr("class", "layer");

        layer.append("path")
            .attr("class", "area")
            .style("fill", function (d) { return z(d.key); })
            .attr("d", area);

        layer.filter(function (d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
            .append("text")
            .attr("x", width - 6)
            .attr("y", function (d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
            .attr("dy", ".35em")
            .style("font", "10px sans-serif")
            .style("text-anchor", "end")
            .text(function (d) { return d.key; });

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "%"));

    }

    transformData(data) {
        var countsPerMonth = {};
        data.forEach(function (d, i) {
            var month = d.CreationDate.slice(0, 7);
            if (!countsPerMonth[month]) {
                // countsPerMonth.push(month);
                // if (i < 5) sconsole.log(countsPerMonth[month]);
                countsPerMonth[month] = { date: d3.timeParse("%Y-%m")(month) };
            }
            if (isNaN(countsPerMonth[month][d.TagName])) {
                countsPerMonth[month][d.TagName] = 1;
                // console.log(i + ", [" + month + "][" + d.TagName + "] = " + countsPerMonth[month][d.TagName]);
            } else {
                countsPerMonth[month][d.TagName] += 1;
                // console.log(i + ", [" + month + "][" + d.TagName + "] = " + countsPerMonth[month][d.TagName]);
            }
        });


        return Object.values(countsPerMonth);;
    }

}

export default StackedChart;