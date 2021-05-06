export { updateNetwork }

var height = 560;
var width = 800;
var margin = {
  top: 50,
  right: 40,
  bottom: 150,
  left: 60
  }

var svg = d3.select("body").append("svg")
    .attr("class","graph")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
  .attr("class", "links")
  .attr('transform', `translate(${margin.left}, ${margin.top})`);
svg.append("g")
  .attr("class", "nodes")
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(50))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(10))
      .on("tick", tick);


function __updateNetwork(data, range, gender){
  d3.csv(data, function(json) {
    //load the csv as json
    //array of nodes
    var nodes = [];
    //array of links
    var links = [];
    var minYear = range[0], maxYear = range[1];
    // keep only data in selected range
    var data = json.filter(d => {
      if (d['Year'] < minYear) return false;
      if (d['Year'] > maxYear) return false;
      if (d['gender'] != gender) return false;
      return true;
    });

    data.forEach(function(d){
    //check if node is present if not add that in the array to get unique nodes.
    if (nodes.indexOf(d.Winner.trim()) <0){
      //sorce node not there so add
      nodes.push(d.Winner.trim())
    }
    //console.log(d);
    if (nodes.indexOf(d.Runnerup.trim()) <0){
      //target node not there so add
      nodes.push(d.Runnerup.trim())
    }
    //link to map the nodes with its index.
    links.push({source:nodes.indexOf(d.Winner.trim()), target:nodes.indexOf(d.Runnerup.trim())})
});

nodes = nodes.map(function(n){
    return {name:n}
});
//console.log(nodes);

var link = svg.selectAll(".links")
              .selectAll(".link")
              .data(links)

link.enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function(d) { 5 });

link.exit().remove();

var node = svg.selectAll(".nodes")
              .selectAll(".node")
              .data(nodes)
node.exit().remove();
var nodeElements = node.enter().append("g")
                        .attr("class", "node");


var circles = nodeElements.append("circle")
                          .attr("r","8");

var text = nodeElements.append("text")
                .attr("class","textNode")
                .text(function(d) { return d.name })
                .attr("dx", 5)
                .attr("dy", ".35em");

nodeElements.on("mouseover", function(n){
  nodeElements.attr("opacity",f=>{return f.name===n.name? 1 : 0.5;});
  nodeOnMouseOver(n);
});
nodeElements.on("mouseout", function(n){
  nodeElements.attr("opacity",1);
  d3.select("#network").style("display", "none");
});




simulation.nodes(nodes);

simulation.force("link")
          .links(links);

simulation.restart();


});
}


function nodeOnMouseOver(d) {
        var newContent = "<p>" + d.name + "</p>";
        //console.log(d.name);
        //newContent += "<img src=data/player_images/"+d.name+".jpg alt=\""+d.name+"\">";
        d3.select("#network").style("display", "block")
                          .style('top', d3.event.y - 12 + 'px')
                          .style('left', d3.event.x + 25 + 'px')
                          .html(newContent);
}

function tick() {
    var node = svg.select(".nodes").selectAll(".node");
    var link = svg.select(".links").selectAll(".link");

    node.attr("cx", function(d) { return d.x = Math.max(5, Math.min(width - 5, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(5, Math.min(height - 5, d.y)); });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended));


};

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  }

function updateNetwork(data, range = [2015, 2021], gender = "M") {
  d3.selectAll(".link").remove();
  d3.selectAll(".node").remove();
  __updateNetwork(data, range, gender);
  simulation.alpha(0.8).restart()
}

