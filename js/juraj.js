//highest fulfilled education dimensions
var highestEdSvg = d3.select('#ongoing-education');
margin = {top: 20, right: 20, bottom: 30, left: 50};
var highestEdW = +highestEdSvg.node().getBoundingClientRect().width - margin.left - margin.right;
var highestEdH = +highestEdSvg.node().getBoundingClientRect().height - margin.top - margin.bottom;

selectedRegion = getPrettyString("All Denmark");
selectedGender = "Total";

//highest fulfilled education scales
var x = d3.scaleLinear().range([0, highestEdW]),
    y = d3.scaleLinear().range([highestEdH, 0]),
    z = d3.scaleOrdinal(d3.schemeSet3);

var stack = d3.stack();

var area = d3.area()
    .curve(d3.curveNatural)
    .x(function(d, i) { return x(d.data.age); })
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
    .defer(d3.tsv, 'data/juraj.txt')
    .await(ready);

function update(data) {
    g.selectAll(".area")
        .data(data)
        .transition()
        .attr("d", area);
}

function ready(error, regions, data, edu) {
    if (error) {
        throw error;
    }

    //    highest education chart
    var keys = edu.columns.slice(4);
    var years = d3.range(18, 30);

    x.domain(d3.extent(edu, function(d) { return d.age; }));
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
        .data(stack(edu.filter(function (d) { return d.sex === selectedGender
            && getPrettyString(d.region) === selectedRegion})))
        .enter().append("g")
        .attr("class", "layer");

    layer.append("path")
        .attr("class", "area")
        .style("fill", function(d, i) { return z(i); })
        .attr("d", area)
        .on("mousemove", function(d, i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            var t = d3.select('.axis--x');
            gWidth = +t.node().getBoundingClientRect().width;
            //30 = 5 regions * 6 values
            yearWidth = gWidth / (edu.length/18-1);
            year = Math.floor((d3.event.pageX - yearWidth / 2) / yearWidth);
            tooltip.html("Education level: " + d.key + "<br/>" +
                "Age: " + years[year] + "<br/>" +
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
    createMap(regions, edu, selector);

    d3.select("#male-avatar")
        .on("click", function (d) {
            selectedGender = "Men";
            update(stack(edu.filter(function (d) { return d.sex === selectedGender
                && getPrettyString(d.region) === selectedRegion})));
            d3.select(this).style("border-color", "#FFEB3B");
            d3.select("#female-avatar").style("border-color", "transparent");
        });


    d3.select("#female-avatar")
        .on("click", function (d) {
            selectedGender = "Women";
            update(stack(edu.filter(function (d) { return d.sex === selectedGender
                && getPrettyString(d.region) === selectedRegion})));
            d3.select(this).style("border-color", "#FFEB3B");
            d3.select("#male-avatar").style("border-color", "transparent");
        });

    d3.select("#reset-ongoing-edu-plot")
        .on("click", function (d) {
            var className = "." + selectedRegion;
            d3.selectAll(className).style("fill", "lightgrey");

            selectedGender = "Total";
            selectedRegion = getPrettyString("All Denmark");
            update(stack(edu.filter(function (d) { return d.sex === selectedGender
                && getPrettyString(d.region) === selectedRegion})));
            d3.select("#female-avatar").style("border-color", "transparent");
            d3.select("#male-avatar").style("border-color", "transparent");
        });

    var svgLegend = d3.select("#ongoing-education-legend").append("svg")
        .attr("width", highestEdW)
        .attr("height", 50);

    var dataL = 20;
    var offset = highestEdW / keys.length;

    var legend = svgLegend.selectAll('#ongoing-education-legend')
        .data(keys)
        .enter().append('g')
        .attr("transform", function (d, i) {
            if (i === 0) {
                return "translate(30,0)"
            } else {
                dataL += offset;
                return "translate(" + (dataL) + ",0)"
            }
        });

    legend.append('circle')
        .attr("cx", 0)
        .attr("cy", 8)
        .attr("r", 8)
        .style("fill", function (d, i) {
            return z(i)
        })
        .append("svg:title")
            .text(function (d) {
                return d;
            });

    legend.append('text')
        .attr("x", 20)
        .attr("y", 12)
        .text(function (d, i) {
            return d.substr(0, 3)
        })
        .style("text-anchor", "start")
        .style("font-size", 15)
        .append("svg:title")
        .text(function (d) {
            return d;
        });
}

//try to find a better solution without replicating code
function createMap(regions, data, selector) {
    var mapsvg = selector;
    var mapW = +mapsvg.node().getBoundingClientRect().width;
    var mapH = +mapsvg.node().getBoundingClientRect().height;

    var Mercator = d3.geoMercator()
        .translate([ mapW / 3, mapH / 2 ])
        .scale(3000)
        .center([  10.21076, 56.2 ]);

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
            return getPrettyRegionName(d)
        })
        .style("fill", "lightgrey")
        .style("stroke", "grey")
        .style("stroke-width", 0.5);

    allpaths
        .data(regions.features)
        .on("mouseover", function (d) {
            var className = "." + getPrettyRegionName(d);
            d3.selectAll(className).style("fill", "#FFAB40");
        })
        //check selected region before setting fill back to default
        .on("mouseout", function (d) {
            if(getPrettyRegionName(d) !== selectedRegion) {
                var className = "." + getPrettyRegionName(d);
                d3.selectAll(className).style("fill", "lightgrey");
            }
        })
        .on("click", function (d) {
            var className = "." + selectedRegion;
            d3.selectAll(className).style("fill", "lightgrey");

            selectedRegion = getPrettyRegionName(d);

            update(stack(data.filter(function (d) { return d.sex === selectedGender
                && getPrettyString(d.region) === selectedRegion})));

            className = "." + getPrettyRegionName(d);
            d3.selectAll(className).style("fill", "#FFAB40");
        });

    var Action = function (d, c) {
        allpaths
            .filter(function (v) {
                return v.properties.REGIONKODE === d.properties.REGIONKODE;
            })
            .style("fill", c);
    };

}

function getPrettyRegionName(d) {
    return d.properties.REGIONNAVN.toLowerCase().replace(/ /g, '').replace('æ','ae');
}

function getPrettyString(string) {
    return string.toLowerCase().replace(/ /g, '').replace('æ','ae');
}