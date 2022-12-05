// append the svg2 object to the body of the page
var height2 = 400
var width2 = 400
var svg2 = d3.select("#bubble_size_legend")
  .append("svg")
    .attr("width", width2)
    .attr("height", height2)

// The scale you use for bubble size
var size = d3.scaleSqrt()
  .domain([1, 100])  // What's in the data, let's say it is percentage
  .range([1, 100])  // Size in pixel

// Add legend: circles
var valuesToShow = [10, 50, 100]
var xCircle = 230
var xLabel = 380
var yCircle = 330


svg2
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function(d){ return yCircle - size(d) } )
    .attr("r", function(d){ return size(d) })
    .style("fill", "none")
    .attr("stroke", "white")

// Add legend: segments
svg2
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("line")
    .attr('x1', function(d){ return xCircle + size(d) } )
    .attr('x2', xLabel)
    .attr('y1', function(d){ return yCircle - size(d) } )
    .attr('y2', function(d){ return yCircle - size(d) } )
    .attr('stroke', 'white')
    .style('stroke-dasharray', ('2,2'))

// Add legend: labels
svg2
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("text")
    .attr('x', xLabel)
    .attr('y', function(d){ return yCircle - size(d) } )
    .text( function(d){ return d } )
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle')