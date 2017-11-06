// graph dimensions
var padding = 10,
    margin = {top: 20, right:20, bottom: 30, left: 50},
    width = padding + 980 - margin.left -  margin.right,
    height =  padding + 600 - margin.top - margin.bottom;

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
                  .curve(d3.curveCardinal);

// tooltip div
var div = d3.select('body').append('div')
                            .attr('class', 'tooltip')
                            .style('opacity', 0);

// create the svg object inside the body
var svg = d3.select('body').append('svg')
                            .attr('width', padding + width + margin.left + margin.right)
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
        svg.append('g')
            .attr('class', 'trendline')
            .attr('location', function() { return d.key; })
            .attr('mean_2013', function() { return d.values[5].mean; })
            .attr('mean_1990', function() { return d.values[0].mean;})
            .on("mouseover", function() {
                console.log(this)
                div.transition()
                    .duration(200)
                    .style('opacity', 0.9);

                var location = d.key,
                    mean_1990 = d.values[0].mean,
                    mean_2013 = d.values[5].mean;

                div.html(d.key)
                    .style('top', (d3.event.pageY - 40) + 'px')
                    .append('p')
                    .text('In 1990, ' + mean_1990 + '% of the population of ' + location + ' was obese.')
                    .append('p')
                    .text('By 2013, this number had changed to ' + mean_2013 + '%.')
                    .append('p')
                    .text('Relative change between 1990 and 2013: ' + ((mean_2013 - mean_1990) * 100 /mean_1990).toFixed(1) + '%');
            })
            .append('path')
            .attr('class', 'line')
            .attr('d', valueline(d.values));

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


});