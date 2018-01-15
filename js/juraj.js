//highest fulfilled education dimensions
var highestEdSvg = d3.select('#highest-education');
margin = {top: 20, right: 20, bottom: 30, left: 50};
var highestEdW = +highestEdSvg.node().getBoundingClientRect().width - margin.left - margin.right;
var highestEdH = +highestEdSvg.node().getBoundingClientRect().height - margin.top - margin.bottom;

//highest fulfilled education scales
var x = d3.scaleLinear().range([0, highestEdW]),
    y = d3.scaleLinear().range([highestEdH, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var stack = d3.stack();

var area = d3.area()
    .curve(d3.curveNatural)
    .x(function(d, i) { return x(d.data.Age); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

var g = highestEdSvg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.queue()
    .defer(d3.json, 'regioner.geojson')
    .defer(d3.tsv, 'HFUDD20raw1.txt')
    .defer(d3.tsv, 'edu-relative.txt')
    .await(ready);

function ready(error, regions, data, edu) {
    if (error) {
        throw error;
    }

    //    highest education chart
    var keys = edu.columns.slice(1);

    x.domain(d3.extent(edu, function(d) { return d.Age; }));
    z.domain(keys);
    stack.keys(keys);

    var layer = g.selectAll(".layer")
        .data(stack(edu))
        .enter().append("g")
        .attr("class", "layer");

    layer.append("path")
        .attr("class", "area")
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area)
        .on("mouseover", function(d, i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            yearWidth = highestEdW / (edu.length-1);
            console.log(highestEdW);
            console.log(edu.length-1);
            console.log(yearWidth);
            year =  Math.floor(d3.event.pageX / yearWidth);
            tooltip.html("Education level: " + d.key + "<br/>" +
                "Age: " + edu[year].Age + "<br/>" +
                +( (d[year][1] - d[year][0]) * 100).toFixed(2) + "%")
                .style("left", (d3.event.pageX - 60) + "px")
                .style("top", (d3.event.pageY - 60) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }).transition();

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + highestEdH + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"));

}
