d3.select(window).on('load', init);

function init() {
    // settings for the selector map
    var mapsvg = d3.select('#mapsvg');
    var mapW = +mapsvg.node().getBoundingClientRect().width;
    var mapH = +mapsvg.node().getBoundingClientRect().height;
    var Mercator = d3.geoMercator()
                       .translate([mapW / 2, mapH / 2])
                       //.scale(150000)
                       .scale(1400)
                       //.center([  10.21076, 56.15674 ]); //Århus
                       .center([10.21076, 56.2]);  //Århus
    //create path variable
    var path = d3.geoPath()
                   .projection(Mercator);
    var offsetMercator = Mercator.translate();


    // settings for the stacked area map
    var areasvg = d3.select('#areasvg');
    var areaW = +areasvg.node().getBoundingClientRect().width;
    var areaH = +areasvg.node().getBoundingClientRect().height;

    var xScale = d3.scaleBand()
                     .range([0 + 40, areaW - 40])
                     .paddingInner(0.05);

    var yScale = d3.scaleLinear()
                     .range([areaH - 40, 40])
                     .nice();

    var yAxis = d3.axisLeft()
        .ticks(5);



    var areaToPlot = d3.area()
                         .x(function(d, i) { return xScale(i); })
                         .y0(function(d) { return yScale(d[0]); })
                         .y1(function(d) { return yScale(d[1]); });

    var keys = ['H10', 'H20', 'H30', 'H35', 'H40', 'H50', 'H60', 'H70', 'H80', 'H90'];
    var stack = d3.stack().keys(keys);

    var yAxisSVG = d3.select('#areasvg')
        .attr('class', 'axis')
        .attr('transform', 'translate(40,0)')
        .attr('stroke-width', 0);

    d3.queue()
        .defer(d3.json, 'regioner.geojson')
        //.defer(d3.tsv, 'HFUDD20.txt')
        //.defer(d3.tsv, 'HFUDD20area3.txt')
        .defer(d3.tsv, 'data/HFUDD20area4.txt')
        .await(ready);

    function ready(error, regions, area1) {
        if (error) {
            throw error;
        }
        console.log('test ny');
        console.log(area1);
        //console.log(regions);

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
                console.log(d.properties.REGIONNAVN);
                Action(d, 'orange');
            })
            .on('mouseout', function(d) {
                Action(d, 'lightgrey');
            })
            .on('click', function(d) {
                UptateVisuals(area1, d.properties.REGIONNAVN);
                console.log('klik');
            });

        var Action = function(d, c) {
            allpathsKW
                .filter(function(v) { return v.properties.REGIONKODE == d.properties.REGIONKODE; })
                .style('fill', c);
        }
        // d er regionsnavn
        var UptateVisuals = function(area1, regnavn) {
            var selection = area1.filter(function(v) {
                return v.region == regnavn;
            })
                .filter(function(v) {
                    return v.sex == 'Total';})
            ;

            var series = stack(selection);

            yScale.domain([0, d3.max(selection, function(d) {
                return d.H10 + d.H20 + d.H30 + d.H35 + d.H40 + d.H50 + d.H60 + d.H70 + d.H80 + d.H90;
            })]);

            yAxis.scale(yScale);

            yAxisSVG.call(yAxis);


            var areapaths = d3.select('#areasvg')
                                .selectAll('path')
                                .data(series)
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
            //d["land area"] = +d["land area"]; // if there are spaces in the property names
        });


        //Data, stackedareas



        var selectedData = area1.filter(function(v) {
            //console.log(v.region == "All Denmark");
            return v.region == 'All Denmark';})
            .filter(function(v) {
                return v.sex == 'Total';});

        console.log(selectedData);

        var series = stack(selectedData);
        console.log(selectedData);
        console.log('series');
        console.log(series);

        //Set up scales
        xScale.domain(d3.range(selectedData.length));
        yScale.domain([0, d3.max(selectedData, function(d) {
                           return d.H10 + d.H20 + d.H30 + d.H35 + d.H40 + d.H50 + d.H60 + d.H70 + d.H80 + d.H90;
                       })]);

        //color scale
        var colors = d3.scaleOrdinal(d3.schemeCategory10);

        //Define area generator
        var areapaths = d3.select('#areasvg')
                            .selectAll('path')
                            .data(series)
                            .enter()
                            .append('path')
                            .attr('class', 'areaKW')
                            .attr('d', areaToPlot)
                            .style('fill', function(d, i) { return colors(i); });

        //Define axes
        xAxis = d3.axisBottom()
                    .scale(xScale)
                    .tickFormat(function(d) {
                        //console.log("tjek_d" + d);
                        //console.log("tjek_area1" + area1[d].age);
                        return area1[d].age;
                    });
        xAxis2 = d3.axisBottom()
                     .scale(xScale)
                     .tickFormat(function(d) {
                         //console.log("tjek_d" + d);
                         //console.log("tjek_area1" + area1[d].time);
                         return area1[d].time;
                     });

        yAxis.scale(yScale);

        //Create axes
        d3.select('#areasvg')
            .append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + -xScale(0) / 2 + ',460)')
            .call(xAxis)
            .attr('stroke-width', 0);

        d3.select('#areasvg')
            .append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + -xScale(0) / 2 + ',480)')
            .call(xAxis2)
            .attr('stroke-width', 0);

        yAxisSVG.append('g')
            .call(yAxis);

    }
}
