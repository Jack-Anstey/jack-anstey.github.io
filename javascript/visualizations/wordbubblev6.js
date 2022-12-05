// set the dimensions and margins of the graph
let area = document.querySelector('#contentWordBubble');
let area2 = document.querySelector('#bubble_size_legend');
let width; //width of the bubbles
let height; //height of the bubbles
let svg; //the bubbles
let svg2; //the legend
let height2;
let width2;
let maxYear = localStorage.getItem('maxYear'); //min and the max year for live data pruning
let minYear = localStorage.getItem('minYear');
let interval = 500; //time interval for updates, milliseconds
let change = false; //start by not updating multiple times
let slideAdjusted = false;
let file = "assets/data/final_lists/good_words_frequency_list.json"


// Add legend: circles
let valuesToShow = [10, 50, 100];
const xCircle = 100;
const xLabel = 200;
const yCircle = 200;

//when the window first loads, make the vis!
window.addEventListener('load', function () {
    width = area.offsetWidth;
    height = area.offsetHeight;

    width2 = area2.offsetWidth;
    height2 = area2.offsetHeight;

    // append the svg object to the body of the page
    svg = d3.select("#contentWordBubble")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    svg2 = d3.select("#bubble_size_legend")
        .append("svg")
        .attr("width", width2)
        .attr("height", height2)
    makeVis(file);
});


//set the base interval in which we check for screen updates. Start with the default value
window.setInterval(update, interval);

//when dropdown menu is being selected
$('.dropdown-menu li').click(function () {
    var input = $(this).parents('.dropdown').find('input').val();
    console.log(input)
    if (input === 'vanilla') {
        file = "assets/data/final_lists/good_words_frequency_list.json";
    } else if (input === 'profanity') {
        file = "assets/data/final_lists/bad_words_frequency_list.json";
    } else if (input === 'color') {
        file = "assets/data/final_lists/color_words_frequency_list.json";
    } else if (input === 'name') {
        file = "assets/data/final_lists/name_words_frequency_list.json";
    } else if (input === 'food') {
        file = "assets/data/final_lists/food_words_frequency_list.json";
    }
    removeAndReplace();
    makeVis(file);
});

top_number_words = 50;

$('.dropdown-menu li').click(function () {
    var input = $(this).parents('.dropdown').find('input').val();
    console.log(input)
    if (input === '10') {
        top_number_words = 10;
    } else if (input === '20') {
        top_number_words = 20;
    } else if (input === '50') {
        top_number_words = 50;
    } else if (input === '100') {
        top_number_words = 100;
    }
    removeAndReplace();
    makeVis(file);
});

function update() {
    //updates the values of the year range as adjusted by the user
    if (maxYear != localStorage.getItem('maxYear')) {
        slideAdjusted = true;
        //console.log("Changed max year");
    }

    if (minYear != localStorage.getItem('minYear')) {
        slideAdjusted = true;
        //console.log("Changed min year");
    }

    //if the width changed, also signal that we should update the vis
    if (width != area.offsetWidth && height != area.offsetHeight) {
        width = area.offsetWidth;
        height = area.offsetHeight;
        width2 = area2.offsetWidth;
        height2 = area2.offsetHeight;
        change = true;
        //console.log("Changed width or height");
    }

    if (localStorage.getItem('completed') == "true") {
        //if this is true, that means that the user adjusted the slider, ergo change
        if (slideAdjusted && (maxYear != localStorage.getItem('maxYear') || minYear != localStorage.getItem('minYear'))) {
            maxYear = localStorage.getItem('maxYear');
            minYear = localStorage.getItem('minYear');
            width2 = area2.offsetWidth;
            height2 = area2.offsetHeight;
            change = true;
        } else { //otherwise they clicked and did nothing or put it back at the original date
            localStorage.setItem('completed', "false");
        }
    }

    //if the user did request a change in some way, do it!
    if (change) {
        localStorage.setItem('completed', "false");
        slideAdjusted = false;
        change = false;
        removeAndReplace();
        makeVis(file);
    }

    //after the first interval passes, make all future ones shorter
    if (interval == 500) {
        interval = 200;
        window.setInterval(update, interval);
    }
}


//remove the current svg so that it can then be replaced
function removeAndReplace() {
    d3.selectAll("g").remove()
    d3.selectAll("svg").remove();
    d3.selectAll("svg2").remove()
    d3.selectAll("tooltip").remove();

    svg = d3.select("#contentWordBubble")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    svg2 = d3.select("#bubble_size_legend")
        .append("svg")
        .attr("width", width2)
        .attr("height", height2)
}

function makeVis(file) {
    // Read data
    d3.json(file)
        .then(function (data) {
            // Store aggregated data
            var result = {}
            // Store the number of years present
            var counter = {}

            // for each year in range
            for (let i = minYear; i <= maxYear; i++) {
                // sum frequency and sentiment score
                for (var key in data[i]) {
                    if (result.hasOwnProperty(key)) {
                        result[key]["frequency"] += +data[i][key]["frequency"]
                        result[key]["sentiment"] += +data[i][key]["sentiment_score"]
                        counter[key] += 1
                    } else {
                        var word = {}
                        word["word"] = key
                        word["frequency"] = +data[i][key]["frequency"]
                        word["sentiment"] = +data[i][key]["sentiment_score"]
                        result[key] = word

                        counter[key] = 1
                    }
                }
            }

            // average sentiment score
            for (key in result) {
                result[key]["sentiment"] /= counter[key]
            }

            var collection = []

            // set frequency threshold
            for (key in result) {
                collection.push(result[key])
            }

            // sort and get top 50 words
            collection.sort((a, b) => b.frequency - a.frequency);

            collection = collection.slice(0, top_number_words)

            data = collection

            // Color palette
            //theoretically sentiment score are from -1 to 1
            const color = d3.scaleSequential(d3.interpolatePlasma).domain([-1, 1])
            // find max frequency
            const max = Math.max.apply(Math, data.map(function (o) {
                return o.frequency;
            }))
            console.log(max)

            // Size scale
            const size = d3.scaleLinear()
                .domain([0, max])
                .range([15, 60])  // circle will be between 20 and 55 px wide

            // create a tooltip
            const Tooltip = d3.select("#contentWordBubble")
                .append("tooltip")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")

            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function (event, d) {
                Tooltip
                    .style("opacity", 1)
                d3.select(this).style("opacity", 0.75)
                    .style("stroke", "white")
                    .style("stroke-width", 5);
            }
            const mousemove = function (event, d) {
                Tooltip
                    .html("\"" + '<u>' + d.word[0].toUpperCase() + d.word.substring(1) + '</u>' + "\"" + "<br>" + "Frequency: " + d.frequency + "<br>" + "Sentiment Score: " + Number.parseFloat(d.sentiment).toFixed(2))
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 40) + "px")
            }
            var mouseleave = function (event, d) {
                Tooltip
                    .style("opacity", 0)
                d3.select(this).style("opacity", 1)
                    .style("stroke", "black")
                    .style("stroke-width", 1);
            }

            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover_text = function (event, d) {
                Tooltip
                    .style("opacity", 1)
                d3.select("#" + d.word + "-circle").style("opacity", 0.75)
                    .style("stroke", "white")
                    .style("stroke-width", 5);
            }

            var mouseleave_text = function (event, d) {
                Tooltip
                    .style("opacity", 0)
                d3.select("#" + d.word + "-circle").style("opacity", 1)
                    .style("stroke", "black")
                    .style("stroke-width", 1);
            }

            // Initialize the circle: all located at the center of the svg area
            var node = svg.append("g")
                .selectAll("circle")
                .data(data)
                .join("circle")
                .attr("class", "node")
                .attr("id", d => d.word + "-circle")
                .attr("r", d => size(d.frequency))
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .style("fill", d => color(d.sentiment))
                .style("fill-opacity", 0.8)
                .attr("stroke", "black")
                .style("stroke-width", 1)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .call(d3.drag() // call specific function when circle is dragged
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            const texts = svg.selectAll("node")
                .data(data)
                .enter()
                .append('text')
                .text(d => d.word[0].toUpperCase() + d.word.substring(1))
                .attr('fill', 'white')
                .style("font-size", function (d) {
                    return Math.min(1 * size(d.frequency), (2 * size(d.frequency) - 8) / this.getComputedTextLength() * 14) + "px";
                })
                .attr("dy", ".3em")
                .attr("text-anchor", "middle")
                .on("mouseover", mouseover_text)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave_text)
                .call(d3.drag() // call specific function when circle is dragged
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));
            ;

            // Features of the forces applied to the nodes:
            const simulation = d3.forceSimulation()
                .force("boundary", forceBoundary(0, 0, width, height))
                .force('y', d3.forceY().y(0))
                .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
                .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
                .force("collide", d3.forceCollide().strength(.3).radius(function (d) {
                    return (size(d.frequency) + 3)
                }).iterations(1)) // Force that avoids circle overlapping

            // Apply these forces to the nodes and update their positions.
            // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
            simulation
                .nodes(data)
                .on("tick", function (d) {
                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y)
                    texts.attr('x', (d) => {
                        return d.x
                    })
                        .attr('y', (d) => {
                            return d.y
                        });
                });
            const size2 = d3.scaleLinear()
                .domain([0, max])  // What's in the data, let's say it is percentage
                .range([15, 60]);  // Size in pixel
            valuesToShow = [Math.round(max / 10), Math.round(max / 2), max]
            svg2
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("circle")
                .attr("cx", xCircle)
                .attr("cy", function (d) {
                    return yCircle - size2(d)
                })
                .attr("r", function (d) {
                    return size2(d)
                })
                .style("fill", "green")
                .attr("stroke-width", 3)
                .style("opacity","0.5")
                .attr("stroke", "white");

// Add legend: segments
            svg2
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("line")
                .attr('x1', function (d) {
                    return xCircle + size2(d)
                })
                .attr('x2', xLabel)
                .attr('y1', function (d) {
                    return yCircle - size2(d)
                })
                .attr('y2', function (d) {
                    return yCircle - size2(d)
                })
                .attr('stroke', 'white')
                .style('stroke-dasharray', ('2,2'));

// Add legend: labels
            valuesToShow
            svg2
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .attr('x', xLabel)
                .attr('y', function (d) {
                    return yCircle - size2(d)
                })
                .text(function (d) {
                    return d
                })
                .style("font-size", 15)
                .style("fill", "white")
                .attr('alignment-baseline', 'middle');

            function adaptLabelFontSize(d) {
                var xPadding, diameter, labelAvailableWidth, labelWidth;

                xPadding = 8;
                diameter = 2 * d.frequency;
                labelAvailableWidth = diameter - xPadding;

                labelWidth = this.getComputedTextLength();

                // There is enough space for the label so leave it as is.
                if (labelWidth < labelAvailableWidth) {
                    return null;
                }
            }

            // What happens when a circle is dragged?
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(.03).restart();
                d.fx = d.x;
                d.fy = d.y;
                Tooltip
                    .style("opacity", 0)
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
                Tooltip
                    .style("opacity", 0)
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(.03);
                d.fx = null;
                d.fy = null;
            }
        })
}


