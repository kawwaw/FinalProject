d3.select(window).on('load', init);

function init() {
    // settings for the selector map
    var mapsvg = d3.select('#mapsvg');
    var mapW = +mapsvg.node().getBoundingClientRect().width;
    var mapH = +mapsvg.node().getBoundingClientRect().height;
    var Mercator = d3.geoMercator()
        .translate([ mapW / 2, mapH / 2 ])
        //.scale(150000)
        .scale(1400)
        //.center([  10.21076, 56.15674 ]); //Århus
        .center([  10.21076, 56.2 ]); //Århus
    //create path variable
    var path = d3.geoPath()
        .projection(Mercator);
    var offsetMercator = Mercator.translate();

    // settings for the stacked area map
    var areasvg = d3.select('#areasvg');
    var areaW = +areasvg.node().getBoundingClientRect().width;
    var areaH = +areasvg.node().getBoundingClientRect().height;
    //Set up stack method
    var stack = d3.stack()
        .keys([ "H10 Primary education",
            "H20 Upper secondary education",
            "H30 Vocational Education and Training (VET)",
            "H35 Qualifying educational programmes",
            "H40 Short cycle higher education",
            "H50 Vocational bachelors educations",
            "H60 Bachelors programmes",
            "H70 Masters programmes",
            "H80 PhD programmes",
            "H90 Not stated"
        ]);
    //Data, stacked


    d3.queue()
        .defer(d3.json, 'regioner.geojson')
        //.defer(d3.tsv, 'HFUDD20.txt')
        .defer(d3.tsv, 'HFUDD20area2.txt')
        .await(ready);

    function ready(error, regions, area1) {
        if (error) {
            throw error;
        }
        console.log("test ny");
        console.log(area1);
        //console.log(regions);


        allpaths = mapsvg.selectAll("path")
            .data(regions.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", function(d){return d.properties.REGIONKODE})
            .style("fill", "lightgrey")
            .style("stroke", "grey")
            .style("stroke-width", 0.5);

        //console.log(allpaths);

        allpaths
            .data(regions.features)
            .on("mouseover", function(d){
                //console.log(d.properties.REGIONKODE);
                Action(d,"orange");
            })
            .on("mouseout", function(d) {
                Action(d,"lightgrey");
                });

        var Action = function(d,c){
            allpaths
                .filter(function(v) {
                    //console.log(v.properties.REGIONKODE);
                    return v.properties.REGIONKODE == d.properties.REGIONKODE; })
                .style("fill",c);
        }

        makeAreaPlot(area1);
    }


    var makeAreaPlot = function(area1){
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
            //d["land area"] = +d["land area"]; // if there are spaces in the property names
        });

        var stack = d3.stack()
            .keys([ "H10", "H20", "H30","H35",  "H40", "H50", "H60","H70","H80","H90" ]);

        //Data, stacked
        var series = stack(area1);
        console.log(area1);
        console.log("series");
        console.log(series);

        //Set up scales
        var xScale = d3.scaleBand()
            .domain(d3.range(area1.length))
            .range([0, areaW])
            .paddingInner(0.05)
            ;

        var yScale = d3.scaleLinear()
            .domain([0,
                d3.max(area1, function(d) {
                    return d.H10+d.H20+d.H30+d.H35+d.H40+d.H50+d.H60+d.H70+d.H80+d.H90;
                })
            ])
            .range([areaH,0])
            .nice()
        ;
        //Easy colors accessible via a 10-step ordinal scale
        var colors = d3.scaleOrdinal(d3.schemeCategory10);

        //Create SVG element
        var groups = d3.select("#barsvg")
            .selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .style("fill", function(d, i) {
                return colors(i);})
        ;

        // Add a rect for each data value
        var rects = groups.selectAll("rect")
            .data(function(d) {
                //console.log(d);
                return d; })
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return xScale(i);

            })
            .attr("y", function(d) {
                return yScale(d[1]);
            })
            .attr("height", function(d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr("width", xScale.bandwidth());


        //Define area generator
        areaToPlot = d3.area()
            .x(function(d,i) {
               // console.log("d");
               // console.log(d);
                return xScale(i); })
            .y0(function(d) { return yScale(d[0]); })
            .y1(function(d) { return yScale(d[1]); });

        var areapaths = d3.select("#areasvg")
            .selectAll("path")
            .data(series)
            .enter()
            .append("path")
            .attr("class", "areaKW")
            .attr("d", areaToPlot)
            .style("fill", function(d, i) {
                return colors(i);})
        ;

        //Define Y axis
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        d3.select("#areasvg")
            .append("g")
            .attr("class", "axis")
            //.attr("transform", "translate(" + (areaW) + ",0)")
            .call(yAxis);

    }

}



