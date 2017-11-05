// graph dimensions
var padding = 50,
    margin = {top: 20, right:20, bottom: 30, left: 50},
    width = 960 - margin.left -  margin.right,
    height =  500 - margin.top - margin.bottom;

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
                  .y(function(d) { return y(d.mean); });

// create the svg object inside the body
var svg = d3.select('body').append('svg')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', height + margin.top + margin.bottom)
                           .append('g')
                            .attr('transform', 'translate(' + (padding + margin.left) + ',' + margin.top + ')');

// load in the data
d3.csv('data/example.csv', function(error, data) {
    if (error) throw error;

    // change data types
    data.forEach(function (d) {
        d.year = +d.year;
        d.mean = +d.mean;
    });

    // scale the data
    x.domain(d3.extent(data, function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.mean; })]);

    // add the path
    svg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', valueline);

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
        .attr('transform', 'translate(' + ((margin.top + margin.bottom)/2) + ',' + (height/2) +')rotate(-90)')
        .text('Percent of Population that is Obese (%)');

     svg.append('text')
         .attr('text-anchor', 'middle')
         .attr('transform', 'translate(' + (width/2) + ',' + (height-((margin.top + margin.bottom)/2)))
         .text('Year');

});