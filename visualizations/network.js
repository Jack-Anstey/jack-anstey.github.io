Promise.all([
    d3.csv('assets/data/metadata_2013.csv'),
    d3.csv('assets/data/Contact-diaries-network_data_2013.csv')
]).then(ready);

function ready(data) {
    const nodes = data[0];
    const links = data[1];
    // console.log(nodes,links);

    const rolledGender = d3.rollup(nodes, v => v.length, d => d["Gi"]);
    // console.log(rolledGender);

    let mapping = [];
        nodes.forEach((d,i) => {
        mapping[+d['i']] = i;
    });
    // console.log(mapping);
    // console.log(mapping[+nodes[0]["i"]]);

    let graph = {};
    links.forEach(d => {
        d['source'] = mapping[+d["i"]];
        let key = +d["i"];
        if(!(key in graph))
            graph[key] = [];
        let targets = graph[key];
        d['target'] = mapping[+d["j"]];
        targets.push(+d["j"]);
    })
    //console.log(links.slice(0,5));

    let dataset = {
        nodes: nodes,
        edges: links
    }

    let w = window.innerWidth/2;
    let h = 15*window.innerHeight/16;

    //Create SVG element
    let svg = d3.select("#contentNetwork")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    //zoom zoom
    //Also needs to be declared early on or it breaks dragging and tooltips
    const zoomRect = svg.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "none")
        .style("pointer-events", "all");
    
    const zoom = d3.zoom()
        .scaleExtent([1/4, 2])
        .on("zoom", zoomed);

        let transform = d3.zoomIdentity;

    zoomRect.call(zoom);

    function zoomed(event) {
        transform = event.transform;
        nodeMarks.attr("transform", transform);
        edgeMarks.attr("transform", transform);
    }

    //Initialize a simple force layout, using the nodes and edges in dataset
    var simulation  = d3.forceSimulation(dataset.nodes)
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(dataset.edges))
        .force("center", d3.forceCenter().x(w/2).y(h/2));

    //Create edges as lines
    let edgeMarks = svg.append("g");

    edgeMarks.selectAll("line")
            .data(dataset.edges)
            .enter()
            .append("line")
            .style("stroke", "grey")
            .style("stroke-width", 1);

    //Create nodes as circles
    let nodeMarks = svg.append("g");

    nodeMarks.selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr('id', d => {
            //console.log(d);
            return 'n'+d.i;
        })
        .style("stroke", "#000000")
        .style("stroke-width", 1)
        .style("fill", "rgb(0, 100, 0)")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", function(event, d){ //change color on click
            d3.select(this)
                .style("stroke-width", 3)
                .style("fill", "yellow")
            d3.select('#t'+d.i)
                .style("stroke-width", 3)
                .style("fill", "yellow")
        })
        .on("mouseout", function(event, d){ //back to normal
            d3.select(this)
                .style("stroke-width", 1)
                .style("fill", "rgb(0, 100, 0)")
            d3.select('#t'+d.i)
                .style("stroke-width", 1)
                .style("fill", d => d.children ? "rgb(0, 100, 0)" : "#999")
        });

    //Every time the simulation "ticks", this will be called
    simulation.on("tick", () => {
        edgeMarks.selectAll("line").attr("x1", d => { return d.source.x; })
            .attr("y1", d => { return d.source.y; })
            .attr("x2", d => { return d.target.x; })
            .attr("y2", d => { return d.target.y; });

        nodeMarks.selectAll("circle").attr("cx", d => { return d.x; })
            .attr("cy", d => { return d.y; });
    });

    //Add a simple tooltip
    nodeMarks.selectAll("circle").append("title")
            .text(d => {
            return d.fName + " " + d.lName;
            });

    function dragstarted(event, d) {
        if (!event.active)
            simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active)
            simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }


    //tree code
    let copies = copyNodes(nodes);
    let root = bfs(copies[0], copies);
    root = tree(root);
    console.log(root);
    function copyNodes(data){
    let copiedNodes = [];
    nodes.forEach((node,i) => {
        copiedNodes[i] = {
        name: node['fName'] + " " + node['lName'][0]
        ,
        i: +node['i']
        };
    });
    return copiedNodes;
    }

    function bfs(d, nodes){
    let visited = [];
    let root = d;
    let queue = [root];

    do {
        let curr = queue.shift();
        curr.children = [];
        visited.push(curr);
        let children = graph[curr['i']];
        if(children)
        children.forEach( child => {
            child = nodes[mapping[child]];
            if(!visited.includes(child) && !queue.includes(child)){
            queue.push(child);
            curr.children.push(child);
            }
        });

    } while (queue.length > 0);

    return d3.hierarchy(root);
    }

    function tree(root){
    root.dx = 10;
    root.dy = w / (root.height + 1);
    return d3.tree().nodeSize([root.dx, root.dy])(root);
    }

    let x0 = Infinity;
    let x1 = -x0;

    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    let svg2 = d3.select('#contentNetwork').append('svg')
        .attr("width", w)
        .attr("height", h)
        .attr("viewBox", [-50, 0, w*1.2, x1 - x0 + root.dx * 2]);
    
    const g = svg2.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);
    
    const link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));
    
    const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle")
            .attr("fill", d => d.children ? "rgb(0, 100, 0)" : "#999")
            .attr("r", 2.5)
            .attr('id', d => {
                //console.log(d);
                return 't'+d.data.i;
            })
            .on("mouseover", function(event, d){ //change color on click
                d3.select(this)
                    .style("fill", "yellow")
                d3.select('#n'+d.data.i)
                    .style("fill", "yellow")
            })
            .on("mouseout", function(event, d){ //back to normal
                d3.select(this)
                    .style("fill", d => d.children ? "rgb(0, 100, 0)" : "#999")
                d3.select('#n'+d.data.i)
                    .style("fill", "rgb(0, 100, 0)")
            });

        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -6 : 6)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");
}