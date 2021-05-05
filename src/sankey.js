export { updateSankey }

/// copied from https://bl.ocks.org/d3noob/5028304
d3.sankey = function() {
  var sankey = {},
	  nodeWidth = 24,
	  nodePadding = 8,
	  size = [1, 1],
	  nodes = [],
	  links = [];
 
  sankey.nodeWidth = function(_) {
	if (!arguments.length) return nodeWidth;
	nodeWidth = +_;
	return sankey;
  };
 
  sankey.nodePadding = function(_) {
	if (!arguments.length) return nodePadding;
	nodePadding = +_;
	return sankey;
  };
 
  sankey.nodes = function(_) {
	if (!arguments.length) return nodes;
	nodes = _;
	return sankey;
  };
 
  sankey.links = function(_) {
	if (!arguments.length) return links;
	links = _;
	return sankey;
  };
 
  sankey.size = function(_) {
	if (!arguments.length) return size;
	size = _;
	return sankey;
  };
 
  sankey.layout = function(iterations) {
	computeNodeLinks();
	computeNodeValues();
	computeNodeBreadths();
	computeNodeDepths(iterations);
	computeLinkDepths();
	return sankey;
  };
 
  sankey.relayout = function() {
	computeLinkDepths();
	return sankey;
  };
 
  sankey.link = function() {
	var curvature = .5;
 
	function link(d) {
	  var x0 = d.source.x + d.source.dx,
		  x1 = d.target.x,
		  xi = d3.interpolateNumber(x0, x1),
		  x2 = xi(curvature),
		  x3 = xi(1 - curvature),
		  y0 = d.source.y + d.sy + d.dy / 2,
		  y1 = d.target.y + d.ty + d.dy / 2;
	  return "M" + x0 + "," + y0
		   + "C" + x2 + "," + y0
		   + " " + x3 + "," + y1
		   + " " + x1 + "," + y1;
	}
 
	link.curvature = function(_) {
	  if (!arguments.length) return curvature;
	  curvature = +_;
	  return link;
	};
 
	return link;
  };
 
  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
	nodes.forEach(function(node) {
	  node.sourceLinks = [];
	  node.targetLinks = [];
	});
	links.forEach(function(link) {
	  var source = link.source,
		  target = link.target;
	  if (typeof source === "number") source = link.source = nodes[link.source];
	  if (typeof target === "number") target = link.target = nodes[link.target];
	  source.sourceLinks.push(link);
	  target.targetLinks.push(link);
	});
  }
 
  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
	nodes.forEach(function(node) {
	  node.value = Math.max(
		d3.sum(node.sourceLinks, value),
		d3.sum(node.targetLinks, value)
	  );
	});
  }
 
  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
	var remainingNodes = nodes,
		nextNodes,
		x = 0;
 
	while (remainingNodes.length) {
	  nextNodes = [];
	  remainingNodes.forEach(function(node) {
		node.x = x;
		node.dx = nodeWidth;
		node.sourceLinks.forEach(function(link) {
		  nextNodes.push(link.target);
		});
	  });
	  remainingNodes = nextNodes;
	  ++x;
	}
 
	//
	moveSinksRight(x);
	scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }
 
  function moveSourcesRight() {
	nodes.forEach(function(node) {
	  if (!node.targetLinks.length) {
		node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
	  }
	});
  }
 
  function moveSinksRight(x) {
	nodes.forEach(function(node) {
	  if (!node.sourceLinks.length) {
		node.x = x - 1;
	  }
	});
  }
 
  function scaleNodeBreadths(kx) {
	nodes.forEach(function(node) {
	  node.x *= kx;
	});
  }
 
  function computeNodeDepths(iterations) {
	var nodesByBreadth = d3.nest()
		.key(function(d) { return d.x; })
		.sortKeys(d3.ascending)
		.entries(nodes)
		.map(function(d) { return d.values; });
 
	//
	initializeNodeDepth();
	resolveCollisions();
	for (var alpha = 1; iterations > 0; --iterations) {
	  relaxRightToLeft(alpha *= .99);
	  resolveCollisions();
	  relaxLeftToRight(alpha);
	  resolveCollisions();
	}
 
	function initializeNodeDepth() {
	  var ky = d3.min(nodesByBreadth, function(nodes) {
		return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
	  });
 
	  nodesByBreadth.forEach(function(nodes) {
		nodes.forEach(function(node, i) {
		  node.y = i;
		  node.dy = node.value * ky;
		});
	  });
 
	  links.forEach(function(link) {
		link.dy = link.value * ky;
	  });
	}
 
	function relaxLeftToRight(alpha) {
	  nodesByBreadth.forEach(function(nodes, breadth) {
		nodes.forEach(function(node) {
		  if (node.targetLinks.length) {
			var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
			node.y += (y - center(node)) * alpha;
		  }
		});
	  });
 
	  function weightedSource(link) {
		return center(link.source) * link.value;
	  }
	}
 
	function relaxRightToLeft(alpha) {
	  nodesByBreadth.slice().reverse().forEach(function(nodes) {
		nodes.forEach(function(node) {
		  if (node.sourceLinks.length) {
			var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
			node.y += (y - center(node)) * alpha;
		  }
		});
	  });
 
	  function weightedTarget(link) {
		return center(link.target) * link.value;
	  }
	}
 
	function resolveCollisions() {
	  nodesByBreadth.forEach(function(nodes) {
		var node,
			dy,
			y0 = 0,
			n = nodes.length,
			i;
 
		// Push any overlapping nodes down.
		nodes.sort(ascendingDepth);
		for (i = 0; i < n; ++i) {
		  node = nodes[i];
		  dy = y0 - node.y;
		  if (dy > 0) node.y += dy;
		  y0 = node.y + node.dy + nodePadding;
		}
 
		// If the bottommost node goes outside the bounds, push it back up.
		dy = y0 - nodePadding - size[1];
		if (dy > 0) {
		  y0 = node.y -= dy;
 
		  // Push any overlapping nodes back up.
		  for (i = n - 2; i >= 0; --i) {
			node = nodes[i];
			dy = node.y + node.dy + nodePadding - y0;
			if (dy > 0) node.y -= dy;
			y0 = node.y;
		  }
		}
	  });
	}
 
	function ascendingDepth(a, b) {
	  return a.y - b.y;
	}
  }
 
  function computeLinkDepths() {
	nodes.forEach(function(node) {
	  node.sourceLinks.sort(ascendingTargetDepth);
	  node.targetLinks.sort(ascendingSourceDepth);
	});
	nodes.forEach(function(node) {
	  var sy = 0, ty = 0;
	  node.sourceLinks.forEach(function(link) {
		link.sy = sy;
		sy += link.dy;
	  });
	  node.targetLinks.forEach(function(link) {
		link.ty = ty;
		ty += link.dy;
	  });
	});
 
	function ascendingSourceDepth(a, b) {
	  return a.source.y - b.source.y;
	}
 
	function ascendingTargetDepth(a, b) {
	  return a.target.y - b.target.y;
	}
  }
 
  function center(node) {
	return node.y + node.dy / 2;
  }
 
  function value(link) {
	return link.value;
  }
 
  return sankey;
};

function makeSankey(URL, range = [2015, 2021], gender = "M") {
	d3.csv(URL, function(data) {
		var minYear = range[0], maxYear = range[1];
		var data = data.filter(tournamentData => {
			if (tournamentData['Year'] < minYear) return false;
			if (tournamentData['Year'] > maxYear) return false;
			if (tournamentData['gender'] != gender) return false;
			return true;
		});

		// xxTODOxx make tournaments names consistent in finals csvs
		// we can just match them here by the 1st letter, but it's very ugly
		const sankeyData = getSankeyData(data);
		function getSankeyData(data) {
			var winners = Array.from(new Set(data.map(tournamentData => tournamentData.Winner)));
			var runnerups = Array.from(new Set(data.map(tournamentData => tournamentData.Runnerup)));
			var grandSlams = ['Australian Open', 'French Open', 'Wimbledon', 'US Open'];

			var winners = winners.map((player, idx) => [player, idx]);
			var grandSlams = grandSlams.map((gs, idx) => [gs, idx + winners.length]);
			var runnerups = runnerups.map((player, idx) => [player, idx + winners.length + grandSlams.length]);

			const nodes = winners.concat(grandSlams).concat(runnerups).map(player => {
				return {
					'name': player[0],
					'node': player[1]
				};
			});

			function getLinkData(type, players) {
				return grandSlams.flatMap(gs => {
				const gsName = gs[0], gsIdx = gs[1];
				const gsData = data.filter(tournamentData => tournamentData['Tournament'] == gsName);
				return players.flatMap(player => {
					const playerName = player[0], playerIdx = player[1];
					const finals = gsData.filter(tournamentData => tournamentData[type] == playerName);
					// xxTODOxx it's very ugly, idk how to make dictionary in 1 line
					// ctrl + f      ret = {}      to fix all of them
					if (finals.length == 0) return [];
					return [{
						'player': playerName,
						'tournament': gsName,
						'source': type == 'Winner' ? playerIdx : gsIdx,
						'target': type == 'Winner' ? gsIdx : playerIdx,
						'value': finals.length,
						'type': type == 'Winner' ? (finals.length > 1 ? 'Wins' : 'Win') : (finals.length > 1 ? 'Losses' : 'Loss'),
						'years': finals.map(tournamentData => tournamentData['Year'])
						}];
					});
				});
			}

			const winnerLinks = getLinkData('Winner', winners);
			const runnerupLinks = getLinkData('Runnerup', runnerups);
			const links = winnerLinks.concat(runnerupLinks);

			var ret = {};
			ret['nodes'] = nodes;
			ret['links'] = links;
			return ret;
		}

		var margin = {top: 10, right: 10, bottom: 10, left: 10},
		width = 1500 - margin.left - margin.right,
		height = 740 - margin.top - margin.bottom;

		var edgeDescription = function(d) {
			var ret = "";
			if (d.type == 'Wins') ret += d.source.name + " @ " + d.target.name;
			else ret += d.target.name + " @ " + d.source.name; // →
			ret += "\n";
			ret += d.value + ' Final ' + d.type;
			ret += "\n";
			ret += "Year" + (d.years.length > 1 ? "s" : "") + ": " + d.years.reverse().join(', ');
			return ret;
		},  color = d3.scaleOrdinal(d3.schemeCategory10);

		// append the svg canvas to the page
		var svg = d3.select("#sankey").append("svg")
					.attr("id", "sankey")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", 
						  "translate(" + margin.left + "," + margin.top + ")");

		// Set the sankey diagram properties
		var sankey = d3.sankey()
						.nodeWidth(36)
						.nodePadding(10)
						.size([width, height]);

		var path = sankey.link();
		sankey
			.nodes(sankeyData.nodes)
			.links(sankeyData.links)
			.layout(32);

		// add in the links
		var link = svg.append("g").selectAll(".link")
						.data(sankeyData.links)
						.enter().append("path")
						.attr("class", "link")
						.attr("d", path)
						.style("fill", "none")
						.style("stroke", "tan")
						.style("stroke-opacity", ".33")
						.on("mouseover", function() { d3.select(this).style("stroke-opacity", ".5") } )
						.on("mouseout", function() { d3.select(this).style("stroke-opacity", ".2") } )
						.style("stroke-width", function(d) { return Math.max(1, d.dy); })
						.sort(function(a, b) { return b.dy - a.dy; });

		// add the link titles
		link.append("title")
			.text(edgeDescription);

		// add in the nodes
		var node = svg.append("g").selectAll(".node")
						.data(sankeyData.nodes)
						.enter().append("g")
						.attr("class", "node")
						.attr("transform", function(d) { 
							return "translate(" + d.x + "," + d.y + ")";
						})
						.call(d3.drag()
								.subject(subject)
								.on("start", function () {
									d3.event.sourceEvent.stopPropagation(); // silence other listeners
									// idk what ^^ does
									if (d3.event.sourceEvent.which == 1)
										dragInitiated = true;
									this.parentNode.appendChild(this);
								})
								.on("drag", dragmove));
		function subject(d) {return { x: d3.event.x, y: d3.event.y }};
								// xxTODOxx double click resets the position
								// 0 -> d3.event.x to keep the old position

		// add the rectangles for the nodes
		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", sankey.nodeWidth())
			.style("fill", function(d) { 
				return d.color = color(d.name.replace(/ .*/, "")); })
			.style("stroke", function(d) { 
				return d3.rgb(d.color).darker(2); })
			.append("title")
			.text(function(d) { 
				return d.name + "\n" + "Total " + d.value + " Grand Slam Finals"; });

		// add in the title for the nodes
		node.append("text")
			.attr("x", -6)
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("transform", null)
			.text(function(d) { return d.name; })
			.filter(function(d) { return d.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");

		// the function for moving the nodes
		function dragmove(d) {
			d3.select(this).attr("transform", 
				"translate(" + (
					   d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
					) + "," + (
						   d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
					) + ")");
			sankey.relayout();
			link.attr("d", path);
		}

	});
};

function updateSankey(URL, range, gender) {
	d3.select('#sankey').selectAll('svg').remove();
	makeSankey(URL, range, gender);
}
