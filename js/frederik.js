$(document).ready(function() {
    $('#fullpage').fullpage({
        // Navigation
        menu: '#menu',
        lockAnchors: false,
        anchors: ['first', 'second', 'third', 'fourth'],
        navigation: true,
        navigationPosition: 'right',
        navigationTooltip: ['first', 'second', 'third', 'fourth'],
        showActiveTooltip: false,
        slidesNavigation: true,
        slidesNavPosition: 'bottom',
    });

    frederik();


    $('#level-menu li').click(function() {
        // remove classes from all
        $('#level-menu li').removeClass('active');
        // add class to the one we clicked
        $(this).addClass('active');
    });
});


function frederik() {
    var w = 700;
    var h = 700;
    //Define path generator, using the Albers USA projection
    var Mercator = d3.geoMercator()
                       .translate([w / 2, h / 2])
                       .scale(6000)
                       .center([10.21076, 56.2]);  //Århus

    var path = d3.geoPath()
                   .projection(Mercator);
    //Create SVG element
    var svg = d3.select('#region-map')
                  .append('svg')
                  .attr('width', w)
                  .attr('height', h);

    d3.json('regioner.geojson', function(error, data) {

        if (error) throw error;
        var selectedLevel = '';
        var regionColors = {
            1081: 'red',
            1082: 'green',
            1083: 'blue',
            1084: 'orange',
            1085: 'magenta',
        };

        d3.select('#level-menu li').on('click', function(e) {
            console.log(e);
        });

        svg.append('g')
            .selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .style('fill', function(d) {
                return regionColors[d.properties.REGIONKODE];
            })
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .attr('d', path);
    })
}
