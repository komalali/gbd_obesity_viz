// graph dimensions
var padding = 10,
    margin = {top: 150, right:0, bottom: 30, left: 50},
    width = 1100 - margin.left -  margin.right,
    height =  700 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear().nice().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the x axis
var xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));

// define the y axis
var yAxis = d3.axisLeft(y);

// define the line
var valueline = d3.line()
                  .x(function(d) { return x(d.year); })
                  .y(function(d) { return y(d.mean); })
                  .curve(d3.curveNatural);

// tooltip div
var div = d3.select('.svg-container').append('div')
                            .attr('class', 'tooltip container')
                            .attr('width', width + margin.left + margin.right)
                            .style('opacity', 0.9);

// add information about global obesity
   div.append('h5')
       .text('Global');

   div.append('p')
        .text('High BMI is associated with a huge variety of health problems, ranging from heart disease to diabetes to cancers.');

   div.append('p')
       .text('Between 1990 and 2013, the prevalence of obesity (defined as the percentage of the population with a BMI > 30) has risen from 9.3% to 12.0% globally, a relative increase of 29%.');

// create the svg object inside the body
var svg = d3.select('.svg-container').append('svg')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', padding + height + margin.top + margin.bottom)
                           .append('g')
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
            mean_1990 = d.values[0].mean,
            mean_2013 = d.values[5].mean,
            global_rank = +d.values[5].global_rank,
            super_region_rank = +d.values[5].super_region_rank;

        svg.append('g')
            .attr('class', 'trendline')
            .append('path')
            .attr('class', 'line')
            .attr('d', valueline(d.values))
            .on("mouseover", function() {
                div.transition()
                    .duration(200)
                    .style('opacity', 0.9);

                div.html('')
                    .append('h5')
                    .text(function() { return d.key; })
                    .append('p')
                    .text('In 1990, ' + mean_1990 + '% of the population of ' + location + ' was obese. ' +
                        'By 2013, this number had changed to ' + mean_2013 + '%, a relative change of ' +
                        ((mean_2013 - mean_1990) * 100 /mean_1990).toFixed(1) + '%.');

                div.append('p')
                    .text('In 2013, ' + location + ' had a prevalence of ' + (mean_2013 - 12).toFixed(1) +
                          '% higher than the global average of 12%. ');

                div.append('p')
                    .text(location + ' ranks in at #' + global_rank +
                          ' most obese country globally, and #' + super_region_rank + ' in the super region.');
            });

    });

    // x-axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // y-axis
    svg.append('g')
        .call(yAxis);

    // axis titles
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(' + (-padding * 3) + ',' + (height/2) +')rotate(-90)')
        .text('Percent of Population that is Obese (BMI > 30)');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(' + (width/2) + ',' + (height + padding * 3.5) + ')')
        .text('Year');

    // nest the data by super region
    var dataNestSuper = d3.nest()
        .key(function(d) { return d.super_region_name; })
        .entries(data);

    // loop through each super_region

    dataNestSuper.forEach(function(d) {
        var super_region = d.key;

        d3.select('.buttonHolder')
            .append('button')
            .attr('class', 'btn btn-primary btn-sm')
            .text(function() { return super_region; })
    });


});

