
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

        console.log(data);

        var genders = {
            'M': 'Men',
            'W': 'Women',
            'A': 'Men and women'
        };

        var preparedData = data.map(function(d) {
            return {
                levels: {
                    'H10': d[Object.keys(d)[15]],
                    'H20': d[Object.keys(d)[16]],
                    'H30': d[Object.keys(d)[17]],
                    'H35': d[Object.keys(d)[18]],
                    'H40': d[Object.keys(d)[19]],
                    'H50': d[Object.keys(d)[20]],
                    'H60': d[Object.keys(d)[21]],
                    'H70': d[Object.keys(d)[22]],
                    'H80': d[Object.keys(d)[23]],
                    'H90': d[Object.keys(d)[24]],
                },
                    region: d.region,
                    gender: d.sex,
            }
        });


        function filterByLevelAndGender(level, gender) {
            var filteredByGender = preparedData.filter(function(d) {
                return d.gender === genders[gender];
            });

            var obj = {};
            for (var i = 0; i < filteredByGender.length; i++) {
                obj[filteredByGender[i].region] = filteredByGender[i].levels[level];
            }

            return obj;
        }
        function chooseColor(value) {
            if (value <= 900) {
                return 1
            } else if (value > 900 && value < 1000) {
                return 2;
            } else if (value > 1000 && value <= 2000) {
                return 3;
            } else {
                return 4;
            }
        }
        var color = d3.scaleThreshold()
                        .domain(d3.range(0, 10))
                        .range(d3.schemeReds[9]);
        var selectedLevel = 'H10';
        var selectedGender = 'A';

        $('#level-menu li').click(function() {
            $('#level-menu li').removeClass('active');
            $(this).addClass('active');
            selectedLevel = $(this).find('a').data('value');
            var regionToValue = filterByLevelAndGender(selectedLevel, selectedGender);
            console.log(regionToValue);
            svg.selectAll('path')
                .transition()
                .style('fill', function(d) {
                    return color(regionToValue[d.properties.REGIONNAVN] / 700);
                });
        });

        $('#gender-menu li').click(function() {
            $('#gender-menu li').removeClass('active');
            $(this).addClass('active');
            selectedGender = $(this).find('a').data('value');
            var regionToValue = filterByLevelAndGender(selectedLevel, selectedGender);
            console.log(regionToValue);
            svg.selectAll('path')
                .transition()
                .style('fill', function(d) {
                    return color(regionToValue[d.properties.REGIONNAVN] / 700);
                });
        });

        var regionToValue = filterByLevelAndGender('H10', 'A');

        console.log('obj', filterByLevelAndGender('H20', 'W'));
        svg.append('g')
            .selectAll('path')
            .data(geodata.features)
            .enter()
            .append('path')
            .style('fill', function(d) {
                return color(regionToValue[d.properties.REGIONNAVN] / 700);
            })
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .attr('d', path);
    }
}
