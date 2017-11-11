// graph dimensions
var margin = {top: 30, right:90, bottom: 50, left: 30},
    height = parseInt(d3.select('.svg-container').style('height')),
    width = parseInt(d3.select('.svg-container').style('width'));

    height = height - margin.top - margin.bottom;
    width = width - margin.left -  margin.right;

// formatting for axes
var year = d3.format('d'),
    percent = d3.format('.0%');

// set the ranges
var x = d3.scaleLinear().nice().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the x axis
var xAxis = d3.axisBottom(x).tickFormat(year);

// define the y axis
var yAxisLeft = d3.axisLeft(y).tickFormat(percent);
var yAxisRight = d3.axisRight(y).tickFormat(percent);

// define the line
var valueline = d3.line()
                  .x(function(d) { return x(d.year); })
                  .y(function(d) { return y(d.mean); })
                  .curve(d3.curveNatural);

// tooltip div
var div = d3.select('.tooltip-container').append('div')
                            .attr('class', 'tooltip container')
                            .attr('width', width + margin.left + margin.right)
                            .style('opacity', 0.9);

// add information about global obesity
    div.append('h5')
        .text('Obesity is on the rise globally.');

    div.append('p')
        .text('Between 1990 and 2013, the global prevalence of obesity (defined as the percentage of the population with a BMI > 30)' +
             ' has risen from 9.3% to 12.0%, a relative increase of 29%.');

    div.append('p')
        .text('High BMI is associated with a huge variety of health problems, ranging from heart disease to diabetes to various forms of cancer.');

    div.append('p')
        .text('For country-specific information, hover over the graph below or pick a country from the drop-down list.');

// create the svg object inside the svg container div
var svg = d3.select('.svg-container')
            .append('svg')
            .attr('class', 'svg-content')
            .style('width', (width + margin.left + margin.right) + 'px')
            .style('height', (height + margin.top + margin.bottom) + 'px')
            .append('g')
            .attr('transform', 'translate(' + margin.left * 1.5 + ',' + margin.top + ')');

// load in the data
d3.csv('data/data.csv', function(error, data) {
    if (error) throw error;

    // change data types
    data.forEach(function (d) {
        d.year = +d.year;
        d.mean = +d.mean ;
    });

    // scale the data
    x.domain(d3.extent(data, function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.mean; })]);


    // nest the data by location
    var dataNest = d3.nest()
        .key(function(d) { return d.location_name; })
        .entries(data);

    // loop through each location
    dataNest.forEach(function(d) {

        var location = d.key,
            super_region = d.values[0].super_region_name,
            mean_1990 = d.values[0].mean * 100,
            mean_2013 = d.values[5].mean * 100,
            global_rank_2013 = Math.floor(+d.values[5].global_rank),
            super_region_rank_2013 = Math.floor(+d.values[5].super_region_rank),
            global_rank_1990 = Math.floor(+d.values[0].global_rank),
            super_region_rank_1990 = Math.floor(+d.values[0].super_region_rank),
            percent_difference_to_global = (mean_2013 - 12).toFixed(1);

        var change_text = function() {
            if (mean_2013 > mean_1990) {
                return ('In 1990, ' + mean_1990.toFixed(1) + '% of the population of ' + location + ' was obese. ' +
                    'By 2013, this number had increased to ' + mean_2013.toFixed(1) + '%, a relative change of ' +
                    ((mean_2013 - mean_1990) * 100 /mean_1990).toFixed(1) + '%.');
            } else if (mean_2013 < mean_1990) {
                return ('In 1990, ' + mean_1990 + '% of the population of ' + location + ' was obese. ' +
                    'By 2013, this number had decreased to ' + mean_2013 + '%, a relative change of ' +
                    ((mean_2013 - mean_1990) * 100 / mean_1990).toFixed(1) + '%.');
            }
        };

        var diff_from_global = function() {
            if (percent_difference_to_global > 0) {
                return ('In 2013, ' + location + ' had a prevalence of ' + percent_difference_to_global +
                    '% higher than the global average of 12%.');
            } else if (percent_difference_to_global < 0) {
                return ('In 2013, ' + location + ' had a prevalence of ' + Math.abs(percent_difference_to_global) +
                    '% lower than the global average of 12%.');
            }
        };

        var change_in_global_ranking_text = function() {
            if (global_rank_2013 > global_rank_1990) {
                return '(down from #' + global_rank_1990 +' in 1990)'
            } else if (global_rank_2013 < global_rank_1990) {
                return '(up from #' + global_rank_1990 + ' in 1990)'
            } else if (global_rank_2013 === global_rank_1990) {
                return '(same rank as in 1990)'
            }
        };

        var change_in_super_region_ranking_text = function() {
            if (super_region_rank_2013 > super_region_rank_1990) {
                return ('(down from #' + super_region_rank_1990 +' in 1990)')
            } else if (super_region_rank_2013 < super_region_rank_1990) {
                return ('(up from #' + super_region_rank_1990 +' in 1990)')
            } else if (super_region_rank_2013 === super_region_rank_1990) {
                return ('(same rank as in 1990)')
            }
        };

        svg.append('path')
            .attr('class', 'line')
            .attr('d', valueline(d.values))
            .on("mouseover", function() {


                div.transition()
                    .duration(200)
                    .style('opacity', 0.9);

                div.html('')
                    .append('h5')
                    .text(function() { return d.key; });

                div.append('p')
                    .text(change_text());

                div.append('p')
                    .text(diff_from_global());

                div.append('p')
                    .text('In 2013, ' + location + ' ranked in at #' + global_rank_2013 +
                        ' most obese country globally ' + change_in_global_ranking_text() + ', and #'
                        + super_region_rank_2013 + ' in the ' + super_region
                        + ' super region ' + change_in_super_region_ranking_text() + '.');
            });


    });

    // nest the data by super region
    var dataNestSuper = d3.nest()
        .key(function(d) { return d.super_region_name; })
        .key(function(d) { return d.location_name; })
        .entries(data);

    // loop through each super_region

    dataNestSuper.forEach(function(d) {
        var super_region = d.key;

        d3.select('.buttonHolder')
            .append('button')
            .attr('class', 'btn btn-outline-secondary btn-sm')
            .attr('super_region', function() { return super_region; })
            .text(function() { return super_region; })
            .on('click', function() {
                d3.select(this).classed('active', !d3.select(this).classed('active'));

                var super_region = d3.select(this).attr('super_region');
                var super_region_trendlines = d3.selectAll('.sr_line[super_region="' + super_region + '"]');
                super_region_trendlines.classed('active', !super_region_trendlines.classed('active'));
        });


        d.values.forEach(function (d) {

            var location = d.key,
                super_region = d.values[0].super_region_name,
                mean_1990 = d.values[0].mean * 100,
                mean_2013 = d.values[5].mean * 100,
                global_rank_2013 = Math.floor(+d.values[5].global_rank),
                super_region_rank_2013 = Math.floor(+d.values[5].super_region_rank),
                global_rank_1990 = Math.floor(+d.values[0].global_rank),
                super_region_rank_1990 = Math.floor(+d.values[0].super_region_rank),
                percent_difference_to_global = (mean_2013 - 12).toFixed(1);

            var change_text = function() {
                if (mean_2013 > mean_1990) {
                    return ('In 1990, ' + mean_1990.toFixed(1) + '% of the population of ' + location + ' was obese. ' +
                        'By 2013, this number had increased to ' + mean_2013.toFixed(1) + '%, a relative change of ' +
                        ((mean_2013 - mean_1990) * 100 /mean_1990).toFixed(1) + '%.');
                } else if (mean_2013 < mean_1990) {
                    return ('In 1990, ' + mean_1990 + '% of the population of ' + location + ' was obese. ' +
                        'By 2013, this number had decreased to ' + mean_2013 + '%, a relative change of ' +
                        ((mean_2013 - mean_1990) * 100 / mean_1990).toFixed(1) + '%.');
                }
            };

            var diff_from_global = function() {
                if (percent_difference_to_global > 0) {
                    return ('In 2013, ' + location + ' had a prevalence of ' + percent_difference_to_global +
                        '% higher than the global average of 12%.');
                } else if (percent_difference_to_global < 0) {
                    return ('In 2013, ' + location + ' had a prevalence of ' + Math.abs(percent_difference_to_global) +
                        '% lower than the global average of 12%.');
                }
            };

            var change_in_global_ranking_text = function() {
                if (global_rank_2013 > global_rank_1990) {
                    return '(down from #' + global_rank_1990 +' in 1990)'
                } else if (global_rank_2013 < global_rank_1990) {
                    return '(up from #' + global_rank_1990 + ' in 1990)'
                } else if (global_rank_2013 === global_rank_1990) {
                    return '(same rank as in 1990)'
                }
            };

            var change_in_super_region_ranking_text = function() {
                if (super_region_rank_2013 > super_region_rank_1990) {
                    return ('(down from #' + super_region_rank_1990 +' in 1990)')
                } else if (super_region_rank_2013 < super_region_rank_1990) {
                    return ('(up from #' + super_region_rank_1990 +' in 1990)')
                } else if (super_region_rank_2013 === super_region_rank_1990) {
                    return ('(same rank as in 1990)')
                }
            };

            svg.append('path')
                .attr('class', 'sr_line')
                .attr('super_region', function () { return super_region; })
                .attr('d', valueline(d.values))
                .on("mouseover", function() {


                    div.transition()
                        .duration(200)
                        .style('opacity', 0.9);

                    div.html('')
                        .append('h5')
                        .text(function() { return d.key; });

                    div.append('p')
                        .text(change_text());

                    div.append('p')
                        .text(diff_from_global());

                    div.append('p')
                        .text('In 2013, ' + location + ' ranked in at #' + global_rank_2013 +
                            ' most obese country globally ' + change_in_global_ranking_text() + ', and #'
                            + super_region_rank_2013 + ' in the ' + super_region
                            + ' super region ' + change_in_super_region_ranking_text() + '.');
                });
        });

    });

    // x-axis
    svg.append('g')
        .classed('x axis', true)
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // y-axis left
    svg.append('g')
        .classed('y axis left', true)
        .call(yAxisLeft);

    // y-axis right
    svg.append('g')
        .classed('y axis right', true)
        .attr('transform', 'translate(' + width + ',0)')
        .call(yAxisRight)

    // axis titles
    svg.append('text')
        .attr('class', 'axis-text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(' + -margin.left * 1.2 + ',' + height/2 + ')rotate(-90)')
        .text('% Population that is Obese (BMI > 30)');

    svg.append('text')
        .attr('class', 'axis-text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(' + width/2 + ',' + (height + margin.top) + ')')
        .text('Year');

});

