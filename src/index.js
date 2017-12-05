var margin = {top: 20, right: 20, bottom: 70, left: 40},
width = 600 - margin.left - margin.right,
height = 800 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
.scale(x)
.orient("bottom");

var yAxis = d3.svg.axis()
.scale(y)
.orient("left")
.ticks(10);

var svg = d3.select("body").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", 
      "translate(" + margin.left + "," + margin.top + ")");

var tag = function(dataEntry) {
  var self = {};
  var userIds = {}

  self.TagName = dataEntry.TagName;
  self.AddDataEntry = function(dataEntry) {
    if(dataEntry["AnswerCount"])
      self.AnswerCount += parseInt(dataEntry.AnswerCount);
    if(dataEntry["CommentCount"])
      self.CommentCount += parseInt(dataEntry.CommentCount);
    if(dataEntry["FavoriteCount"])
      self.FavoriteCount += parseInt(dataEntry.FavoriteCount);
    if(dataEntry["ViewCount"])
      self.ViewCount += parseInt(dataEntry.ViewCount);
    if(dataEntry["OwnerUserId"] && !userIds[dataEntry.OwnerUserId]) {
      userIds[dataEntry.OwnerUserId] = true;
      self.OwnerUserIdCount += 1;
    }
    if(dataEntry["Score"])
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
}

d3.csv("../data/QueryResults.csv", function(error, data) {

// AnswerCount
// CommentCount
// FavoriteCount
// ViewCount
// OwnerUserId
// Score

var countFunc = (tag) => tag.FavoriteCount;

var tags = {};

data.forEach(function(d) {
  if(tags[d.TagName]) {
    tags[d.TagName].AddDataEntry(d);
  } else {
    tags[d.TagName] = tag(d);
  }
});

var maxy = d3.max(Object.values(tags), countFunc);
console.log(maxy);
x.domain(Object.keys(tags));
y.domain([0, maxy]);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
.selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", "-.55em")
  .attr("transform", "rotate(-90)" );

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Value ($)");

svg.selectAll("bar")
  .data(Object.values(tags))
.enter().append("rect")
  .style("fill", "steelblue")
  .attr("x", function(t) { return x(t.TagName); })
  .attr("width", x.rangeBand())
  .attr("y", function(t) { return y(countFunc(t)); })
  .attr("height", function(t) { return height - y(countFunc(t)); });

});
