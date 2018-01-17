
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

    d3.queue()
        .defer(d3.json, 'data/regioner.geojson')
        .defer(d3.tsv, 'data/HFUDD20years29time2017highestEDaggregated.txt')
        .await(ready);

    function ready(error, geodata, data) {
        if (error) throw error;
        var regionColors = {
            1081: 'red',
            1082: 'green',
            1083: 'blue',
            1084: 'orange',
            1085: 'magenta',
        };

        console.log(data);


        var preparedData = data.map(function(d) {
            return {
                levels: {
                    'H10': d[Object.keys(d)[15]],
                    'H20': d[Object.keys(d)[16]],
                    'H30': d[Object.keys(d)[17]],
                    'H40': d[Object.keys(d)[18]],
                    'H50': d[Object.keys(d)[19]],
                    'H60': d[Object.keys(d)[20]],
                    'H70': d[Object.keys(d)[21]],
                    'H80': d[Object.keys(d)[22]],
                    'H90': d[Object.keys(d)[23]],
                },
                    region: d.region,
                    gender: d.sex,
            }
        });



        // set the selected menu item to selectedLevel
        var selectedLevel = 'H10';
        var selectedGender = 'Men';
        $('#level-menu li').click(function() {
            // remove classes from all
            $('#level-menu li').removeClass('active');
            // add class to the one we clicked
            $(this).addClass('active');
            selectedLevel = $(this).find('a').data('value');
        });

        // transforming the data to be region->value
        var filteredByGender = preparedData.filter(function(d) {
                                            return d.gender === selectedGender;
                                        });

        var obj = {};
        for(var i = 0; i < filteredByGender.length; i++){
            obj[filteredByGender[i].region] = filteredByGender[i].levels[selectedLevel];
        }
        console.log(obj);

        svg.append('g')
            .selectAll('path')
            .data(geodata.features)
            .enter()
            .append('path')
            .style('fill', function(d) {
                return regionColors[d.properties.REGIONKODE];
            })
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .attr('d', path);
    }
}
