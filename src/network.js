
export { Network }

var height = 700;
var width = 900;
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
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))


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

    // show or hide node labels
    //this.text_opacity = 0;
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
                  //.on("click",function(d) { self.getMatchData(d.source.name,d.target.name); })

    this.link.append("title").text(function(d) {
        var ret="";
        var count = 0;
        var data = self.getMatchData(d.source.name,d.target.name);
        data.forEach(x=>{
          ret+="\n";
          ret+=x.Tournament+"\n";
          x.values.forEach(y=>{
            ret+="-"+y.Year+"-"+"\n";
            ret+="Winner: "+y.Winner+"   Runnerup: "+y.Runnerup+"\n";
            ret+="Score: "+y.Score+"\n";
            count+=1;
          })
        });
        ret = "Total games played: " + count + "\n"+ret
        return ret;
      });

    this.link.exit().remove();
    this.node = this.svg.selectAll(".nodes")
                  .selectAll(".node")
                  .data(this.nodes)
                  .enter().append("g")
					        .attr("class", "node");
    this.node.exit().remove();

    this.text = this.node.append("text")
                    .attr("class","textNode")
                    .text(function(d) { return d.name })
                    .attr("dx", function(d) { return d.value + 5 })
                    .attr("dy", ".35em")
                    .attr("opacity", this.text_opacity)

    // execute force simulation
    this.simulation.nodes(this.nodes).on("tick", () => this.tick(true));
    this.simulation.force("link")
              .links(this.edges);

    // find neighbours of each node
    let linkedByIndex = {};
    this.edges.forEach((d) => {
      linkedByIndex[`${d.source.index},${d.target.index}`] = true;
    });
    this.neighbours = linkedByIndex;

    this.nodeElements = this.node.append("circle")
      .attr("class", "circle_network")
      .attr("r", function(d) { return Math.max(d.value, 8) })
      .on("mouseover", function(i){
        self.text.attr('opacity', function (d) {
          if (self.isConnectedAsTarget(i, d) || self.isConnectedAsSource(i, d) || i.index === d.index) {
            return 1
          } else { return self.text_opacity }
        }).style('fill',  function (d) { return i.index === d.index ? 'black' : 'grey';})
        self.link.style('stroke', function (d) { return d.source.index === i.index || d.target.index === i.index ? 'red' : 'grey';
      })})
      // highlight neighbours on hover
      .on('mouseout', function (d) {
        self.link.style("stroke", "grey")
        self.text.attr('opacity', self.text_opacity)
                 .style('fill', 'grey')
      });


  }

  isConnectedAsSource(a, b) {
    return this.neighbours[`${a.index},${b.index}`];
  }

  isConnectedAsTarget(a, b) {
    return this.neighbours[`${b.index},${a.index}`];
  }

  tick(drag) {
    this.node = this.svg.select(".nodes").selectAll(".node");
    this.link = this.svg.select(".links").selectAll(".link");

    this.node.attr("cx", function(d) { return d.x = Math.max(8, Math.min(width - 8, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(8, Math.min(height - 8, d.y)); });

    this.link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    this.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    // execute drag simulation if dragging allowed
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
    // loads data according to the user-specified time range and gender
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
          value: groupped[nodes.indexOf(n)].value // number of matches of a player (for node weights)
        }
      });
      var edges = l.groupBy(['source','target']); // count the number of face-offs per player pair
      var matchStats = data.groupBy(['Winner','Runnerup']);
      //console.log(matchStats)
      self.updateData(nodes, edges, matchStats)
    });
  }

  getMatchData(player1, player2) {
    var res = this.matchStats.filter(x => (x['Winner'] == player1 && x['Runnerup'] == player2)||(x['Winner'] == player2 && x['Runnerup'] == player1))
                                .flatMap(x=> x.values).groupBy(['Tournament']);
    res = res.map(x=>{x.values = x.values.sort(predicateBy("Year"));return x});
    return res;
  }

  updateData(nodes, edges, matchStats) {
    this.matchStats = matchStats;
    this.nodes = nodes;
    this.edges = edges;
    this.players = nodes.map(x => x.name);

    d3.selectAll(".link").remove();
    d3.selectAll(".node").remove();

    this.magnify_off();
    this.rebuildNetwork();
    this.simulation.alpha(1.5).restart()

    // autocomplete & event listener for search box
    $("#search").autocomplete({
      source: this.players,
      position: {  collision: "flip"  }
    });

    var self = this;
    $("#search").keyup(function (e) {
      if (e.keyCode == 13) {
        self.find_player();
      }
    });
  }

  magnifier_on_off() {
    if(this.magnifier == "on") {
      this.magnify_off();

   } else {
    this.magnify(); // fisheye zoom


   }
  }

  magnify() {
    this.magnifier = "on";

    // stop force simulation and turn off dragging
    this.simulation.stop()
    this.simulation.nodes(this.nodes).on("tick", () => this.tick(false));;
    this.node.on(".drag", null)

    this.text.attr('opacity', 1) // shows all player names in graph
    this.text_opacity = 1;

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
        //.attr("r", function(d) { return d.fisheye.z * 4.5; }); // doesn't keep the proportionality of nodes (obviously)

      self.text.attr("dx", function(d) { return d.fisheye.x - 0.96*d.x; })
        .attr("dy", function(d) { return d.fisheye.y - d.y ; })
        //.attr("font-size", function(d) { return d.fisheye.z * 11; }) // this is painfully slow :(

      self.link.attr("x1", function(d) { return d.source.fisheye.x; })
        .attr("y1", function(d) { return d.source.fisheye.y; })
        .attr("x2", function(d) { return d.target.fisheye.x; })
        .attr("y2", function(d) { return d.target.fisheye.y; });
    });
  }

  magnify_off() {
    this.magnifier = "off";

    // turn on dragging
    this.simulation.nodes(this.nodes).on("tick", () => this.tick(true));;
    this.simulation.force("link")
              .links(this.edges);
    this.svg.on("mousemove", null) // turn off zooming
    this.simulation.restart();

    //this.text_opacity = 0; // hide node labels
  }

  displayNode(i,d){
    if (self.isConnectedAsTarget(i, d) || self.isConnectedAsSource(i, d) || i.index === d.index ) {
      return "block"
    } else {
      return "none";
    }

    //this.link.attr('display', function (d) { return d.source.index === i.index || d.target.index === i.index ? 'block' : 'none';});  })
  }

  find_player(){
    // get the searched player
    var searched_player = $('#search').val();
    var neighbors = [];
    this.edges.forEach((d) => {
      if(d.source.name == searched_player){
        neighbors.push(d.target.index);
      }else if(d.target.name == searched_player){
        neighbors.push(d.source.index);
      }
    });
    if (this.players.indexOf(searched_player) != -1){
      // highlight player and don't display other nodes that are not ralted to the selected

      this.node
        .filter(function(d) {
          return (d.name != searched_player && !neighbors.includes(d.index) );
        })
        .attr("visibility","hidden");

        d3.selectAll(".node")
          .filter(function(d) {
            return (d.name === searched_player);
          })
          .attr("stroke", "red")
          .attr("fill", "red");

      this.link.attr("visibility",function (d) { return d.source.name === searched_player || d.target.name === searched_player
        || (neighbors.includes(d.target.index)&&neighbors.includes(d.source.index)) ? 'visible' : 'hidden';})
    }
  }

  exitSearch(){
    //console.log("clicks")
    $('#search').val("");
    d3.selectAll(".node")
      .attr("stroke", "none")
      .attr("fill", "black");

    this.node.attr("visibility","visible");
    this.link.attr("visibility", "visible");
  }
}


// groupping on multiple preoperties of an object
// from https://stackoverflow.com/questions/43973917/group-by-with-multiple-fields-using-d3-js
Array.prototype.groupBy = function (props) {
  var arr = this;
  var partialResult = {};
  arr.forEach(el=>{
      var grpObj = {};

      props.forEach(prop=>{
            grpObj[prop] = el[prop];
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

function predicateBy(prop){
   return function(a,b){
      if (a[prop] > b[prop]){
          return -1;
      } else if(a[prop] < b[prop]){
          return 1;
      }
      return 0;
   }
}
