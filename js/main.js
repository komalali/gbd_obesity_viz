// graph dimensions
var margin = {top: 30, right:90, bottom: 50, left: 30},
    height = parseInt(d3.select('.svg-container').style('height')),
    width = parseInt(d3.select('.svg-container').style('width'));

var colors = ['rgba(27,158,119,0.9)', 'rgba(217,95,2,0.9)',
              'rgba(117,112,179,0.9)', 'rgba(231,41,138,0.9)',
              'rgba(70,130,180,0.9)', 'rgba(230,171,2,0.9)', 'rgba(166,118,29,0.9)'];

var colors_dull = ['rgba(27,158,119,0.5)', 'rgba(217,95,2,0.5)',
                   'rgba(117,112,179,0.5)', 'rgba(231,41,138,0.5)',
                   'rgba(70,130,180,0.5)', 'rgba(230,171,2,0.5)', 'rgba(166,118,29,0.5)']

    height = height - margin.top - margin.bottom;
    width = width - margin.left -  margin.right;

// formatting for axes
var year = d3.format('d'),
    percent = d3.format('.0%');

// set the ranges
var x = d3.scaleLinear().nice().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define color scale for super regions
var color = d3.scaleOrdinal()
  .range(colors);

var color_dull = d3.scaleOrdinal()
  .range(colors_dull);

// define the x axis
var xAxis = d3.axisBottom(x).tickFormat(year);

// define the y axis
var yAxisLeft = d3.axisLeft(y).tickFormat(percent);
var yAxisRight = d3.axisRight(y).tickFormat(percent);

// define the line
var valueLine = d3.line()
  .x(function(d) { return x(d.year); })
  .y(function(d) { return y(d.mean); })
  .curve(d3.curveNatural);

// functions for the tooltip text
var relative_change_text = function(location) {
  if (location.mean_2013 > location.mean_1990) {
    return ('In 1990, ' + location.mean_1990.toFixed(1) + '% of the population of ' + location.name + ' was obese. ' +
      'By 2013, this number had increased to ' + location.mean_2013.toFixed(1) + '%, a relative change of ' +
      ((location.mean_2013 - location.mean_1990) * 100 /location.mean_1990).toFixed(1) + '%.');
  } else if (location.mean_2013 < location.mean_1990) {
    return ('In 1990, ' + location.mean_1990.toFixed(1) + '% of the population of ' + location.name + ' was obese. ' +
      'By 2013, this number had decreased to ' + location.mean_2013.toFixed(1) + '%, a relative change of ' +
      ((location.mean_2013 - location.mean_1990) * 100 / location.mean_1990).toFixed(1) + '%.');
  }
};

var diff_from_global = function(location) {
  if (location.percent_difference_to_global > 0) {
    return ('In 2013, ' + location.name + ' had a prevalence of ' + location.percent_difference_to_global +
      '% higher than the global average of 12%.');
  } else if (location.percent_difference_to_global < 0) {
    return ('In 2013, ' + location.name + ' had a prevalence of ' + Math.abs(location.percent_difference_to_global) +
      '% lower than the global average of 12%.');
  }
};

var change_in_ranking_text = function(rank_1990, rank_2013) {
  if (rank_2013 > rank_1990) {
    return '(down from #' + rank_1990 +' in 1990)'
  } else if (rank_2013 < rank_1990) {
    return '(up from #' + rank_1990 + ' in 1990)'
  } else if (rank_2013 === rank_1990) {
    return '(same rank as in 1990)'
  }
};

var rank_change_blurb = function(location) {
  return 'In 2013, ' + location.name + ' ranked in at #' + location.global_rank_2013 +
    ' most obese country globally ' + change_in_ranking_text(location.global_rank_1990, location.global_rank_2013) + ', and #'
    + location.super_region_rank_2013 + ' in the ' + location.super_region_name
    + ' super region ' + change_in_ranking_text(location.super_region_rank_1990, location.super_region_rank_2013) + '.'
};

// tooltip div
var div = d3.select('.tooltip-container').append('div')
  .attr('class', 'tooltip container-fluid')
  .attr('width', width + margin.left + margin.right)
  .style('opacity', 0.9);

// add information about global obesity
div.append('h3')
  .text('Obesity is on the rise globally.');

div.append('p')
  .text('Between 1990 and 2013, the global prevalence of obesity (defined as the percentage of the population with a BMI > 30)' +
    ' rose from 9.3% to 12.0%, a relative increase of 29%.');

div.append('p')
  .text('High BMI is associated with a huge variety of health problems, ranging from heart disease to diabetes to various forms of cancer.');

div.append('p')
  .text('To highlight all countries in a super region, click the buttons below and for country-specific information, hover over the lines in the graph or use the dropdown list.');

// create the svg object inside the svg container div
var svg = d3.select('.svg-container')
  .append('svg')
  .attr('class', 'svg-content')
  .style('width', (width + margin.left + margin.right) + 'px')
  .style('height', (height + margin.top + margin.bottom) + 'px')
  .append('g')
  .attr('transform', 'translate(' + margin.left * 1.5 + ',' + margin.top + ')');

// country selection dropdown
var drop_down = d3.select('.dropdownHolder')
  .append('select')
  .attr('class', 'custom-select')
  .attr('id', 'country-list');

var dataset;

// load in the data
d3.csv('data/data.csv', function(error, data) {
    if (error) throw error;

    // change data types
    data.forEach(function (d) {
        d.year = +d.year;
        d.mean = +d.mean ;
    });

    // to be able to reference data outside this function
    dataset = data;

    // scale the data
    x.domain(d3.extent(data, function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.mean; })]);


    // nest the data by location
    var dataNest = d3.nest()
        .key(function(d) { return d.location_name; })
        .entries(data);

    dataNest.sort(function (a, b) { return d3.ascending(a.key, b.key); });

    drop_down.append('option')
      .text('Select a country')
      .attr('value', null)
      .attr('selected', '');

    drop_down.selectAll('#country-option')
      .data(dataNest)
      .enter()
      .append('option')
      .attr('id', 'country-option')
      .text(function(d) { return d.key; })
      .attr('value', function(d) { return d.key; });

    var background_layer = svg.append('g')
      .attr('class', 'background_layer');

    // loop through each location
    dataNest.forEach(function(d) {

      background_layer.append('path')
        .attr('class', 'line')
        .attr('d', valueLine(d.values))

    });

    // nest the data by super region
    var dataNestSuper = d3.nest()
        .key(function(d) { return d.super_region_name; })
        .key(function(d) { return d.location_name; })
        .entries(data);

    dataNestSuper.sort(function (a, b) { return d3.ascending(a.key, b.key); });

    color.domain(dataNestSuper.map(function(d) { return d.key }));
    color_dull.domain(dataNestSuper.map(function(d) { return d.key }));

    // loop through each super region
    dataNestSuper.forEach(function(d) {
      var super_region = d.key;

      // TOGGLE BUTTON
      var toggleButton = (function() {
        var currentButtonColor = 'white';
        var currentOutlineColor = color(super_region);
        var currentOpacity = 0;
        var currentActive = false;

        return function(){
          var super_region = d3.select(this).attr('super_region');

          currentButtonColor = currentButtonColor === 'white' ? color(super_region) : 'white';
          currentOutlineColor = currentOutlineColor === color(super_region) ? 'whitesmoke' : color(super_region);
          currentOpacity = currentOpacity === 0 ? 0.7 : 0;
          currentActive = !currentActive;

          // change the button's styling when it's clicked
          d3.select(this).style('background-color', currentButtonColor);
          d3.select(this).style('color', currentOutlineColor);
          d3.select(this).style('border', '1px solid ' + currentOutlineColor);
          d3.select(this).classed('active', currentActive);

          // give the lines an active class when active
          var super_region_trendlines = d3.selectAll('.sr_line[super_region="' + super_region + '"]');
          super_region_trendlines.style('opacity', currentOpacity)
            .classed('active', currentActive);

          div.html('')
            .append('h3')
            .text(function() { return super_region })

          d3.select('.tooltip-container')
            .style('background', color_dull(super_region));

          super_region_trendlines.on('mouseout', function() {
            d3.select(this)
              .style('opacity', currentOpacity);
          })

          drop_down.on('change', function () {

            var selected = this.value;

            d3.selectAll('.sr_line')
              .style('opacity', 0);

            d3.selectAll('.sr_line.active')
              .style('opacity', 0.7);

            d3.selectAll('.sr_line[location="' + selected + '"]')
              .style('opacity', 0.7)
              .style('stroke-width', '2px');

            var country = dataset.filter(function(d) { return d.location_name === selected });

            var location = {
              name: country[0].location_name,
              super_region_name: country[0].super_region_name,
              mean_1990: country[0].mean * 100,
              mean_2013: country[5].mean * 100,
              global_rank_1990: Math.floor(+country[0].global_rank),
              global_rank_2013: Math.floor(+country[5].global_rank),
              super_region_rank_1990: Math.floor(+country[0].super_region_rank),
              super_region_rank_2013: Math.floor(+country[5].super_region_rank),
              percent_difference_to_global: ((country[5].mean * 100) - 12).toFixed(1)
            };

            div.transition()
              .duration(200)
              .style('opacity', 0.9);

            div.html('')
              .append('h3')
              .text(function () {
                return location.name;
              });

            div.append('p')
              .text(relative_change_text(location));

            div.append('p')
              .text(diff_from_global(location));

            div.append('p')
              .text(rank_change_blurb(location));

            d3.select('.tooltip-container')
              .style('background', color_dull(location.super_region_name));
          })
        }
      })();

      // create a button for each super region
      d3.select('.buttonHolder')
        .append('button')
        .style('background-color', 'white')
        .style('border', '1px solid ' + color(super_region))
        .style('color', color(super_region))
        .attr('class', 'btn btn-sm')
        .attr('super_region', function() { return super_region; })
        .text(function() { return super_region; })
        .on('click', toggleButton);

      var sr_layer = svg.append('g')
        .attr('class', 'sr_layer')
        .attr('id', super_region);

      // for each country in the super region
      d.values.forEach(function (d) {

        var location = {
          name: d.key,
          super_region_name: d.values[0].super_region_name,
          mean_1990: d.values[0].mean * 100,
          mean_2013: d.values[5].mean * 100,
          global_rank_1990: Math.floor(+d.values[0].global_rank),
          global_rank_2013: Math.floor(+d.values[5].global_rank),
          super_region_rank_1990: Math.floor(+d.values[0].super_region_rank),
          super_region_rank_2013: Math.floor(+d.values[5].super_region_rank),
          percent_difference_to_global: ((d.values[5].mean * 100) - 12).toFixed(1)
        };

        sr_layer.append('path')
          .attr('class', 'sr_line')
          .attr('super_region', function() { return super_region; })
          .attr('location', function() { return location.name })
          .attr('d', valueLine(d.values))
          .attr('stroke', color(super_region))
          .on('mouseover', function() {

            div.transition()
              .duration(200)
              .style('opacity', 0.9);

            div.html('')
              .append('h3')
              .text(function () {
                return location.name;
              });

            div.append('p')
              .text(relative_change_text(location));

            div.append('p')
              .text(diff_from_global(location));

            div.append('p')
              .text(rank_change_blurb(location));

            d3.select('.tooltip-container')
              .style('background', color_dull(super_region));

          })
          .on('mouseenter', function() {
            d3.select(this)
              .attr('d', valueLine(d.values))
              .style('opacity', 0.7)
          })
          .on('mouseout', function() {
              d3.select(this)
                .style('opacity', 0);
          });

        drop_down.on('change', function () {

          var selected = this.value;

          d3.selectAll('.sr_line')
            .style('opacity', 0);

          d3.selectAll('.sr_line[location="' + selected + '"]')
            .style('opacity', 0.7)
            .style('stroke-width', '2px');

          var country = dataset.filter(function(d) { return d.location_name === selected });

          var location = {
            name: country[0].location_name,
            super_region_name: country[0].super_region_name,
            mean_1990: country[0].mean * 100,
            mean_2013: country[5].mean * 100,
            global_rank_1990: Math.floor(+country[0].global_rank),
            global_rank_2013: Math.floor(+country[5].global_rank),
            super_region_rank_1990: Math.floor(+country[0].super_region_rank),
            super_region_rank_2013: Math.floor(+country[5].super_region_rank),
            percent_difference_to_global: ((country[5].mean * 100) - 12).toFixed(1)
          };

          div.transition()
            .duration(200)
            .style('opacity', 0.9);

          div.html('')
            .append('h3')
            .text(function () {
              return location.name;
            });

          div.append('p')
            .text(relative_change_text(location));

          div.append('p')
            .text(diff_from_global(location));

          div.append('p')
            .text(rank_change_blurb(location));

          d3.select('.tooltip-container')
            .style('background', color_dull(location.super_region_name));
        })

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
        .call(yAxisRight);

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

