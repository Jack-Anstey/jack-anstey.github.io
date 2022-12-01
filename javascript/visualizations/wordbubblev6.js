// set the dimensions and margins of the graph
let area = document.querySelector('#contentWordBubble');
let width; //width of the svg
let height; //height of the svg
let svg; //the svg
let maxYear = localStorage.getItem('maxYear'); //min and the max year for live data pruning
let minYear = localStorage.getItem('minYear');
let interval = 500; //time interval for updates, milliseconds
let change = false; //start by not updating multiple times
let slideAdjusted = false;

//when the window first loads, make the vis!
window.addEventListener('load', function(){
    width = area.offsetWidth;
    height = area.offsetHeight;

    // append the svg object to the body of the page
    svg = d3.select("#contentWordBubble")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    makeVis();
});

//set the base interval in which we check for screen updates. Start with the default value
window.setInterval(update, interval);

function update(){
    //updates the values of the year range as adjusted by the user
    if (maxYear != localStorage.getItem('maxYear')){
        slideAdjusted = true;
        //console.log("Changed max year");
    }

    if (minYear != localStorage.getItem('minYear')){
        slideAdjusted = true;
        //console.log("Changed min year");
    }
        
    //if the width changed, also signal that we should update the vis
    if (width != area.offsetWidth && height != area.offsetHeight){
        width = area.offsetWidth;
        height = area.offsetHeight;
        change = true;
        //console.log("Changed width or height");
    }
    
    if (localStorage.getItem('completed') == "true"){
        //if this is true, that means that the user adjusted the slider, ergo change
        if (slideAdjusted && (maxYear != localStorage.getItem('maxYear') || minYear != localStorage.getItem('minYear'))){
            maxYear = localStorage.getItem('maxYear');
            minYear = localStorage.getItem('minYear');
            change = true;
        } else { //otherwise they clicked and did nothing or put it back at the original date
            localStorage.setItem('completed', "false");
        }
    }

    //if the user did request a change in some way, do it!
    if (change){
        localStorage.setItem('completed', "false");
        slideAdjusted = false;
        change = false;
        removeAndReplace();
        makeVis();
    }

    //after the first interval passes, make all future ones shorter
    if (interval == 500){
        interval = 200;
        window.setInterval(update, interval);
    }
}

//remove the current svg so that it can then be replaced
function removeAndReplace(){
    d3.select("g").remove()
    d3.select("svg").remove();
    d3.select("tooltip").remove();

    svg = d3.select("#contentWordBubble")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
}

function makeVis(){
    // Read data
    d3.csv("assets/data/test_word.csv").then(function (data) {
    // Color palette
    const color = d3.scaleLinear().domain([0, 1]).range(["blue", "red"])

    // Size scale
    const size = d3.scaleLinear()
        .domain([0, 1000])
        .range([20, 120])  // circle will be between 20 and 120 px wide

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
                .style("stroke-width", 5)
            ;
        }
        const mousemove = function (event, d) {
            Tooltip
                .html('<u>' + d.word + '</u>' + "<br>" + "frequency: " + d.frequency + "<br>" + "sentiment score: " + d.sentiment)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 40) + "px")
        }
        var mouseleave = function (event, d) {
            Tooltip
                .style("opacity", 0)
            d3.select(this).style("opacity", 1)
                .style("stroke", "black")
                .style("stroke-width", 1)
            ;
        }

        // Initialize the circle: all located at the center of the svg area
        var node = svg.append("g")
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("class", "node")
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

    // Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
        .force("boundary", forceBoundary(0, 0, width, height))
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.1).radius(function (d) {
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
            });

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

//From https://www.sitepoint.com/delay-sleep-pause-wait/#:~:text=Bringing%20Sleep%20to%20Native%20JavaScript&text=Here%27s%20how%20you%20might%20do,%3C%20milliseconds)%3B%20%7D%20console.
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }