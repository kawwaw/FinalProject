
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

d3.queue()
  .defer(d3.json, 'regioner.geojson')
  .defer(d3.tsv, 'HFUDD20.txt')
  .await(ready);

function ready(error, regions, data) {
    if (error) {
        throw error;
    }
    // console.log("test ny");
    // console.log(data[0]);
    // console.log(regions);

    allpaths = mapsvg.selectAll("path")
        .data(regions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", function (d) {
            return d.properties.REGIONKODE
        })
        .style("fill", "lightgrey")
        .style("stroke", "grey")
        .style("stroke-width", 0.5);

    // console.log(allpaths);

    allpaths
        .data(regions.features)
        .on("mouseover", function (d) {
            // console.log(d.properties.REGIONKODE);
            Action(d, "orange");
        })
        .on("mouseout", function (d) {
            Action(d, "lightgrey");
        });

    var Action = function (d, c) {
        allpaths
            .filter(function (v) {
                // console.log(v.properties.REGIONKODE);
                return v.properties.REGIONKODE == d.properties.REGIONKODE;
            })
            .style("fill", c);
    };

}


