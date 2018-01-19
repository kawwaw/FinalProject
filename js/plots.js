d3.select(window).on('load', init);

function init() {
    // settings for the selector map
    var mapsvg = d3.select('#mapsvg');
    var mapW = +mapsvg.node().getBoundingClientRect().width;
    var mapH = +mapsvg.node().getBoundingClientRect().height;
    var Mercator = d3.geoMercator()
                       .translate([mapW / 3, mapH / 2])
                       .scale(3000)
                       .center([10.21076, 56.2]);
    //create path variable
    var path = d3.geoPath()
                   .projection(Mercator);

    var selectedRegion = "All Denmark";
    selectedGender = "Total";

    // settings for the stacked area map
    var areasvg = d3.select('#areasvg');
    margin = {top: 20, right: 20, bottom: 40, left: 50};
    var areaW = +areasvg.node().getBoundingClientRect().width - margin.left - margin.right;
    var areaH = +areasvg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    var xScale = d3.scaleLinear().range([0, areaW]);

    yScale = d3.scaleLinear().range([areaH, 0]);

    var yAxis = d3.axisLeft()
        .ticks(5);

    var areaToPlot = d3.area()
        .curve(d3.curveNatural)
        .x(function(d, i) { return xScale(d.data.age); })
         .y0(function(d) { return yScale(d[0]); })
         .y1(function(d) { return yScale(d[1]); });

    var keys = ['H10', 'H20', 'H30', 'H35', 'H40', 'H50', 'H60', 'H70', 'H80', 'H90'];
    var longKeys = [
        "H10 Primary education",
        "H20 Upper secondary education",
        "H30 Vocational Education and Training (VET)",
        "H35 Qualifying educational programmes",
        "H40 Short cycle higher education",
        "H50 Vocational bachelors educations",
        "H60 Bachelors programmes",
        "H70 Masters programmes",
        "H80 PhD programmes",
        "H90 Not stated"
    ];
    var stack = d3.stack().keys(keys);

    d3.queue()
        .defer(d3.json, 'regioner.geojson')
        .defer(d3.tsv, 'data/HFUDD20area4.txt')
        .await(ready);

    function ready(error, regions, area1) {
        if (error) {
            throw error;
        }
        console.log('test ny');
        console.log(area1);
        // create selector map of Denmark
        allpathsKW = mapsvg.selectAll('path')
                         .data(regions.features)
                         .enter()
                         .append('path')
                         .attr('d', path)
                         .attr('class', function(d) { return d.properties.REGIONKODE })
                         .style('fill', 'lightgrey')
                         .style('stroke', 'grey')
                         .style('stroke-width', 0.5);

        allpathsKW
            .data(regions.features)
            .on('mouseover', function(d) {
                Action(d, 'orange');
            })
            .on('mouseout', function(d) {
                Action(d, 'lightgrey');
            })
            .on('click', function(d) {
                UpdateVisuals(area1, d.properties.REGIONNAVN, "Total");
            });


        d3.select("#male-avatarKW")
            .on("click", function (d) {
                selectedGender = "Men";
                UpdateVisuals(area1, selectedRegion, selectedGender)
                d3.select(this).style("border-color", "#FFEB3B");
                d3.select("#female-avatarKW").style("border-color", "transparent");
            });


        d3.select("#female-avatarKW")
            .on("click", function (d) {
                selectedGender = "Women";
                UpdateVisuals(area1, selectedRegion, selectedGender);
                d3.select(this).style("border-color", "#FFEB3B");
                d3.select("#male-avatarKW").style("border-color", "transparent");
            });

        d3.select("#reset-ongoing-plot")
            .on("click", function (d) {
                var className = "." + selectedRegion;
                d3.selectAll(className).style("fill", "lightgrey");

                selectedGender = "Total";
                selectedRegion = "All Denmark";
                UpdateVisuals(area1, selectedRegion, selectedGender);
                d3.select("#female-avatarKW").style("border-color", "transparent");
                d3.select("#male-avatarKW").style("border-color", "transparent");
            });

        var Action = function(d, c) {
            allpathsKW
                .filter(function(v) { return v.properties.REGIONKODE == d.properties.REGIONKODE; })
                .style('fill', c);
        };
        // d er regionsnavn
        var UpdateVisuals = function(area1, regnavn, gender) {
            var selection = area1.filter(function(v) {
                return v.region == regnavn;
            })
                .filter(function(v) {
                    return v.sex == gender;});

            var series = stack(selection);

            yScale.domain([0, d3.max(selection, function(d) {
                return d.H10 + d.H20 + d.H30 + d.H35 + d.H40 + d.H50 + d.H60 + d.H70 + d.H80 + d.H90;
            })]);

            yAxis.scale(yScale);

            d3.select('#yaxis')
                .call(yAxis);

            var areapaths = d3.select('#areasvg')
                .selectAll('path')
                .data(series)
                .transition()
                .attr('d', areaToPlot);

        };
        makeAreaPlot(area1);
    }


    var makeAreaPlot = function(area1) {
        area1.forEach(function(d) {
            d.H10 = +d.H10;
            d.H20 = +d.H20;
            d.H30 = +d.H30;
            d.H35 = +d.H35;
            d.H40 = +d.H40;
            d.H50 = +d.H50;
            d.H60 = +d.H60;
            d.H70 = +d.H70;
            d.H80 = +d.H80;
            d.H90 = +d.H90;
        });


        var selectedData = area1.filter(function(v) {
            return v.region == 'All Denmark';})
            .filter(function(v) {
                return v.sex == 'Total';});

        var series = stack(selectedData);

        //Set up scales
        xScale.domain([18,29]);

        yScale.domain([0, d3.max(selectedData, function(d) {
                           return d.H10 + d.H20 + d.H30 + d.H35 + d.H40 + d.H50 + d.H60 + d.H70 + d.H80 + d.H90;
                       })]);

        //color scale
        var colors = d3.scaleOrdinal(d3.schemeSet3);

        var g = d3.select("#areasvg")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Define area generator
        var areapaths = g.selectAll('path')
            .data(series)
            .enter()
            .append('path')
            .attr('class', 'areaKW')
            .attr('d', areaToPlot)
            .style('fill', function(d, i) { return colors(i); });

        //Define axes
        xAxis = d3.axisBottom(xScale);
        xAxis2 = d3.axisBottom()
            .scale(xScale)
            .tickFormat(function(d,i) {
                return selectedData[i].time;
            });

        yAxis.scale(yScale);

        //Create axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + areaH + ')')
            .call(xAxis)
            .attr('stroke-width', 1);

        g.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (areaH + 20) + ')')
            .call(xAxis2)
            .attr('stroke-width', 0);

        g.append('g')
            .attr("id", "yaxis")
            .call(yAxis);

        var svgLegend = d3.select("#area-education-legend").append("svg")
            .attr("width", areaW)
            .attr("height", 50);

        var dataL = 20;
        var offset = areaW / keys.length;

        var legend = svgLegend.selectAll('#area-education-legend')
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
            .text(function (d,i) {
                return longKeys[i];
            });

        legend.append('text')
            .attr("x", 20)
            .attr("y", 12)
            .text(function (d, i) {
                return d.substr(0, 3)
            })
            .style("text-anchor", "start")
            .style("dx", "0.35em")
            .style("font-size", 15)
            .append("svg:title")
            .text(function (d,i) {
                return longKeys[i];
            });
    }
}
