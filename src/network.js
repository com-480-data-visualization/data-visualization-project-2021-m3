export { Network }

var height = 800;
var width = 1200;
var margin = {
  top: 50,
  right: 40,
  bottom: 150,
  left: 60
  }

class Network {
  constructor(element) {

    this.svg = d3.select(element).append("svg")
      .attr("class","graph")
      .attr("width", width)
      .attr("height", height);
    this.svg.append("g")
      .attr("class", "links")
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.svg.append("g")
      .attr("class", "nodes")
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // graph simulation
    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(50))
      .force("charge", d3.forceManyBody().strength(-69))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(10))

    // scale for calculating weight of edges
    this.linkScale = d3.scaleLinear()
                      .range([0.1, 3]); // maybe choose something better

    // magnifier settings
    this.fisheye = d3.fisheye.circular()
      .radius(150)
      .distortion(5);
    this.lens = this.svg.append("circle")
      .attr("class","lens")
      .attr("r", this.fisheye.radius());

  }

  rebuildNetwork() {
    var self = this;
    this.link = this.svg.selectAll(".links")
                  .selectAll(".link")
                  .data(this.edges)
                  .enter().append("line")
                  .attr("class", "link")
                  .style("stroke-width", function(d) { 
                    return self.linkScale(d.values.length); // weighted edges
                  })
                  .attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; })
    this.link.exit().remove();

    this.node = this.svg.selectAll(".nodes")
                  .selectAll(".node")
                  .data(this.nodes)
                  .enter().append("g")
					        .attr("class", "node");
    this.node.exit().remove();

    this.nodeElements = this.node.append("circle")
                            .attr("class", "circle")
                            .attr("r", function(d) { return Math.max(d.value, 8) });

    this.text = this.node.append("text")
                    .attr("class","textNode")
                    .text(function(d) { return d.name })
                    .attr("dx", 5)
                    .attr("dy", ".35em");

    // nodeElements.on("mouseover", function(n){
    //   nodeElements.attr("opacity", f => { return f.name === n.name? 1 : 0.5; });
    //   nodeOnMouseOver(n);
    // });

    // nodeElements.on("mouseout", function(n){
    //   nodeElements.attr("opacity",1);
    //   d3.select("#network").style("display", "none");
    // });

    // execute force simulation
    this.simulation.nodes(this.nodes).on("tick", () => this.tick(true));;
    this.simulation.force("link")
              .links(this.edges);
    //this.simulation.restart();
    }

  tick(drag) {
    this.node = this.svg.select(".nodes").selectAll(".node");
    this.link = this.svg.select(".links").selectAll(".link");
  
    this.node.attr("cx", function(d) { return d.x = Math.max(5, Math.min(width - 5, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(5, Math.min(height - 5, d.y)); });
  
    this.link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    this.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  
    if (drag) {
      var self = this;
      this.node.call(d3.drag()
      .on("start", (d) => self.dragstarted(d)) 
      .on("drag", (d) => self.dragged(d))
      .on("end", (d) => self.dragended(d)));
    }
  }
  
  dragstarted(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  dragended(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  updateNetwork(data, range, gender) {
    var nodes = [];
    var l = []; // array of links

    var self = this;
  
    d3.csv(data, function(json) {
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
        if (nodes.indexOf(d.Winner.trim()) < 0){
          //sorce node not there so add
          nodes.push(d.Winner.trim())
        }
        //console.log(d);
        if (nodes.indexOf(d.Runnerup.trim()) < 0){
          //target node not there so add
          nodes.push(d.Runnerup.trim())
        }
        // emit all pair combinations to count edge weights
        l.push({source:nodes.indexOf(d.Winner.trim()), target:nodes.indexOf(d.Runnerup.trim())})
        l.push({source:nodes.indexOf(d.Runnerup.trim()), target:nodes.indexOf(d.Winner.trim())})
      });
  
      // for nodes proportional to number of appearances
      var groupped = d3.nest()
          .key(function(d) { return d.source; })
          .rollup(function(d) { return d.length; })
          .entries(l);
  
      nodes = nodes.map(function(n){
        return { 
          name: n,
          value: groupped[nodes.indexOf(n)].value
        }
      });
      var edges = l.groupBy(['source','target']); // count the number of face-offs per player pair

      self.updateData(nodes, edges)
    });
  }

  updateData(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.players = nodes.map(x => x.name);
    d3.selectAll(".link").remove();
    d3.selectAll(".node").remove();
    this.magnify_off();
    this.rebuildNetwork();
    this.simulation.alpha(0.8).restart()
  }

  magnify() {
    this.simulation.nodes(this.nodes).on("tick", () => this.tick(false));;
    this.simulation.force("link")
              .links(this.edges);
    this.lens.style("stroke-opacity", "0");

    var self = this;
    this.svg.on("mousemove", function() {
      self.fisheye.focus(d3.mouse(this));

      var mouseX = d3.mouse(this)[0];
      var mouseY = d3.mouse(this)[1];
      var r = self.fisheye.radius();

      self.lens.attr("cx", mouseX)
          .attr("cy", mouseY);

      self.nodeElements.each(function(d) { 
        d.fisheye = self.fisheye(d); 
      })
        .attr("cx", function(d) { return d.fisheye.x - d.x; })
        .attr("cy", function(d) { return d.fisheye.y - d.y; })
        //.attr("r", function(d) { return d.fisheye.z * 4.5; });

      self.text.attr("dx", function(d) { return d.fisheye.x - d.x; })
        .attr("dy", function(d) { return d.fisheye.y - d.y ; });

      self.link.attr("x1", function(d) { return d.source.fisheye.x; })
        .attr("y1", function(d) { return d.source.fisheye.y; })
        .attr("x2", function(d) { return d.target.fisheye.x; })
        .attr("y2", function(d) { return d.target.fisheye.y; });
    });
  }

  magnify_off() {
    this.simulation.nodes(this.nodes).on("tick", () => this.tick(true));;
    this.simulation.force("link")
              .links(this.edges);
    this.svg.on("mousemove", null)
  }
}
//     $("#search").autocomplete({
//       source: players
//     });

//     $("#search").keyup(function (e) {
//       if (e.keyCode == 13) {
//         find_player(players);
//       }
//     });

// function find_player(players){
//   // get the searched player
//   var searched_player = $('#search').val();

//   if (players.indexOf(searched_player) != -1){
//     // zoom and highlight player 
//     d3.selectAll(".node")
//       .filter(function(d) {
//         return (d.name === searched_player);
//       })
//       .attr("stroke", "red") // TO DO: do something better
//       .attr("fill", "red")
//   }
// }

// function nodeOnMouseOver(d) {
//   var newContent = "<p>" + d.name + "</p>";
//   //console.log(d.name);
//   //newContent += "<img src=data/player_images/"+d.name+".jpg alt=\""+d.name+"\">";
//   d3.select("#network").style("display", "block")
//                     .style('top', d3.event.y - 12 + 'px')
//                     .style('left', d3.event.x + 25 + 'px')
//                     .html(newContent);
// }

// groupping on multiple preprties of an object
// from https://stackoverflow.com/questions/43973917/group-by-with-multiple-fields-using-d3-js
Array.prototype.groupBy = function (props) {
  var arr = this;
  var partialResult = {};
  
  arr.forEach(el=>{
      var grpObj = {};

      props.forEach(prop=>{
            grpObj[prop] = el[prop]
      });
      
      var key = JSON.stringify(grpObj);
  
      if(!partialResult[key]) partialResult[key] = [];
      partialResult[key].push(el);
  });

  var finalResult = Object.keys(partialResult).map(key=>{
     var keyObj = JSON.parse(key);
     keyObj.values = partialResult[key];
     return keyObj;
  })
  return finalResult;
}

