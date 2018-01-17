//highest fulfilled education dimensions
var highestEdSvg = d3.select('#ongoing-education');
margin = {top: 20, right: 20, bottom: 30, left: 50};
var highestEdW = +highestEdSvg.node().getBoundingClientRect().width - margin.left - margin.right;
var highestEdH = +highestEdSvg.node().getBoundingClientRect().height - margin.top - margin.bottom;

selectedRegion = "All Denmark";
selectedGender = "All";

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
    .attr("id", "test-g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.queue()
    .defer(d3.json, 'regioner.geojson')
    .defer(d3.tsv, 'HFUDD20raw1.txt')
    .defer(d3.tsv, 'edu-relative.txt')
    .defer(d3.tsv, 'data/edu-relative-demo.txt')
    .await(ready);

function update(data) {
    g.selectAll(".area")
        .data(data)
        .transition()
        .attr("d", area);
}

function ready(error, regions, data, edu, edu_demo) {
    if (error) {
        throw error;
    }

    //    highest education chart
    var keys = edu.columns.slice(1);

    x.domain(d3.extent(edu_demo, function(d) { return d.Age; }));
    z.domain(keys);
    stack.keys(keys);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + highestEdH + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"));

    var layer = g.selectAll(".layer")
        .data(stack(edu_demo.filter(function (d) { return d.Gender === selectedGender && d.Region === selectedRegion; })))
        .enter().append("g")
        .attr("class", "layer");

    layer.append("path")
        .attr("class", "area")
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area)
        .on("mousemove", function(d, i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            var t = d3.select('.axis--x');
            gWidth = +t.node().getBoundingClientRect().width;
            yearWidth = gWidth / (edu_demo.length/6-1);
            year = Math.floor((d3.event.pageX - yearWidth / 2) / yearWidth);
            tooltip.html("Education level: " + d.key + "<br/>" +
                "Age: " + edu_demo[year*6].Age + "<br/>" +
                +( (d[year][1] - d[year][0]) * 100).toFixed(2) + "%")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 90) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }).transition();


    var selector = d3.select('#ongoing-education-map');
    createMap(regions, edu_demo, selector);

    d3.select("#male-avatar")
        .on("click", function (d) {
            selectedGender = "Men";
            update(stack(edu_demo.filter(function (d) { return d.Gender === selectedGender && d.Region === selectedRegion; })));
            d3.select(this).style("border-color", "#FFEB3B");
            d3.select("#female-avatar").style("border-color", "transparent");
        });


    d3.select("#female-avatar")
        .on("click", function (d) {
            selectedGender = "Women";
            update(stack(edu_demo.filter(function (d) { return d.Gender === selectedGender && d.Region === selectedRegion; })));
            d3.select(this).style("border-color", "#FFEB3B");
            d3.select("#male-avatar").style("border-color", "transparent");
        });

    d3.select("#reset-ongoing-plot")
        .on("click", function (d) {
            selectedGender = "All";
            selectedRegion = "All Denmark";
            update(stack(edu_demo.filter(function (d) { return d.Gender === selectedGender && d.Region === selectedRegion; })));
            d3.select("#female-avatar").style("border-color", "transparent");
            d3.select("#male-avatar").style("border-color", "transparent");
        });
}

//try to find a better solution without replicating code
function createMap(regions, data, selector) {
    var mapsvg = selector;
    var mapW = +mapsvg.node().getBoundingClientRect().width;
    var mapH = +mapsvg.node().getBoundingClientRect().height;

    var Mercator = d3.geoMercator()
        .translate([ mapW / 3, mapH / 2 ])
        //.scale(150000)
        .scale(3000)
        //.center([  10.21076, 56.15674 ]); //Århus
        .center([  10.21076, 56.2 ]); //Århus

    //create path variable
    var path = d3.geoPath()
        .projection(Mercator);

    var offsetMercator = Mercator.translate();

    allpaths = mapsvg.selectAll("path")
        .data(regions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", function (d) {
            return "region" + d.properties.REGIONKODE
        })
        .style("fill", "lightgrey")
        .style("stroke", "grey")
        .style("stroke-width", 0.5);

    allpaths
        .data(regions.features)
        .on("mouseover", function (d) {
            var className = ".region" + d.properties.REGIONKODE;
            d3.selectAll(className).style("fill", "orange");
        })
        //check selected region before setting fill back to default
        .on("mouseout", function (d) {
            var className = ".region" + d.properties.REGIONKODE;
            d3.selectAll(className).style("fill", "lightgrey");
        })
        .on("click", function (d) {
            selectedRegion = d.properties.REGIONNAVN;
            update(stack(data.filter(function (d) { return d.Gender === selectedGender && d.Region === selectedRegion; })));

            var className = ".region" + d.properties.REGIONKODE;
            d3.selectAll(className).style("fill", "orange");
        });

    var Action = function (d, c) {
        allpaths
            .filter(function (v) {
                return v.properties.REGIONKODE === d.properties.REGIONKODE;
            })
            .style("fill", c);
    };

}