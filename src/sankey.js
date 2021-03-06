export { updateSankey }

const topK = 5;

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
	  var x0 = d.source.x + d.source.dx / 2,
		  x1 = d.target.x + d.target.dx / 2,
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
	
	/// order the nodes
	/// players: by decreasing value (of wins/finals)
	/// tournaments: magic numbers
	function ascendingDepth(a, b) {
		/// magic numbers
		const map = {
			'Australian Open': 7.2,
			'French Open': 17,
			'Wimbledon': 17.17,
			'US Open': 72
		}
		if (a.name in map)
			return map[a.name] >= map[b.name] ? +1 : -1;
		if (a.other) return +1;
		if (b.other) return -1;
		return b.value - a.value;
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


function makeSankey(URL, range = [1968, 2021], gender = "M") {
	const menDataURL = "https://raw.githubusercontent.com/com-480-data-visualization/data-visualization-project-2021-m3/master/data/combined_players_info.csv";
	d3.csv(URL, function(_, data) {
		const _data = data;
		d3.csv(menDataURL, function(_, playersData) {
			var data = _data;
			var minYear = range[0], maxYear = range[1];
			var data = data.filter(tournamentData => {
				if (tournamentData['Year'] < minYear) return false;
				if (tournamentData['Year'] > maxYear) return false;
				if (tournamentData['gender'] != gender) return false;
				return true;
			});

			const sankeyData = getSankeyData(data);
			
			/// get the sankey data: nodes and edges
			function getSankeyData(data) {
				var winners = Array.from(new Set(data.map(tournamentData => tournamentData.Winner)));
				var runnerups = Array.from(new Set(data.map(tournamentData => tournamentData.Runnerup)));
				var grandSlams = ['Australian Open', 'French Open', 'Wimbledon', 'US Open'];
				
				/// encode the nodes
				var winners = winners.map((player, idx) => [player, idx]);
				var grandSlams = grandSlams.map((gs, idx) => [gs, idx + winners.length]);
				var runnerups = runnerups.map((player, idx) => [player, idx + winners.length + grandSlams.length]);
				
				/// list of all (encoded) nodes
				var nodes = winners.map(player => {
					return {
						'name': player[0],
						'node': player[1],
						'type': 'winner',
						'other': false
					}
				}).concat(grandSlams.map(gs => {
					return {
						'name': gs[0],
						'node': gs[1],
						'type': 'tournament',
						'other': false

					}
				})).concat(runnerups.map(player => {
					return {
						'name': player[0],
						'node': player[1],
						'type': 'runnerup',
						'other': false
					}
				}));
				
				/// get all links: winners -> tournaments, or tournaments -> runnerups
				function getLinkData(type, players) {
					return grandSlams.flatMap(gs => {
						const gsName = gs[0], gsIdx = gs[1];
						const gsData = data.filter(tournamentData => tournamentData['Tournament'] == gsName);
						return players.flatMap(player => {
							const playerName = player[0], playerIdx = player[1];
							const finals = gsData.filter(tournamentData => tournamentData[type] == playerName);
							if (finals.length == 0) return [];
							return [{
								'player': playerName,
								'tournament': gsName,
								'source': type == 'Winner' ? playerIdx : gsIdx,
								'target': type == 'Winner' ? gsIdx : playerIdx,
								'value': finals.length,
								'type': type == 'Winner' ? (finals.length > 1 ? 'Wins' : 'Win') : (finals.length > 1 ? 'Losses' : 'Loss'),
								'years': finals.map(tournamentData => tournamentData['Year']),
								'other': false
							}];
						});
					});
				}

				const winnerLinks = getLinkData('Winner', winners);
				const runnerupLinks = getLinkData('Runnerup', runnerups);
				
				/// get the top K players (by wins/finals) in the input data
				function getTop(data) {
					return Object.entries(data.reduce((acc, cur) => {
								if (cur['player'] in acc)
									acc[cur['player']] += cur['value']
								else
									acc[cur['player']] = cur['value']
								return acc;
							}, {}))
								.sort((f, s) => (f[1] >= s[1] ? -1 : +1))
								.slice(0, topK)
								.map(x => x[0]);
				}
				
				/// a map to encode the other winners/runnerups if necessary
				var otherIdsMap = {};
				function getOtherId(type) {
					if (!(type in otherIdsMap)) {
						otherIdsMap[type] = nodes.length;
						nodes.push({
							'name': 'Other ',
							'node': nodes.length,
							'tournament': false,
							'other': true
						});
					}
					return otherIdsMap[type];
				}
				
				/// all topK unique winners/runnerups accross all tournaments
				var allWinners = new Set(grandSlams.map(x => x[0]).flatMap(tournamentName => {
					var tournamentWinnerLinks = winnerLinks.filter(x => x.tournament == tournamentName);
					var winnersTopK = getTop(tournamentWinnerLinks);
					return winnersTopK;
				}));
				var allRunnerup = new Set(grandSlams.map(x => x[0]).flatMap(tournamentName => {
					var tournamentRunnerupLinks = runnerupLinks.filter(x => x.tournament == tournamentName);
					var runnerupTopK = getTop(tournamentRunnerupLinks);
					return runnerupTopK;
				}));
				
				var links = [];
				grandSlams.map(x => x[0]).forEach(tournamentName => {
					var tournamentWinnerLinks = winnerLinks.filter(x => x.tournament == tournamentName);
					var tournamentNodeId = tournamentWinnerLinks[0].target;

					/// add the links from the winners to the tournaments
					var winnersData = [];
					tournamentWinnerLinks.forEach(x => {
						if (allWinners.has(x.player)) {
							links.push(x);
							return;
						}

						winnersData.push([x.player, x.years]);
					});
					/// add the remaining winners into the "Other" node
					if (winnersData.length > 0)
						links.push({
							'source': getOtherId('W'),
							'target': tournamentNodeId,
							'value': winnersData.map(x => x[1].length).reduce((x, y) => (x + y)),
							'data': winnersData,
							'other': true
						});

					var tournamentRunnerupLinks = runnerupLinks.filter(x => x.tournament == tournamentName);
					var tournamentNodeId = tournamentRunnerupLinks[0].source;
					
					/// add the links from the tournaments to the runnerups
					var runnerupsData = [];
					tournamentRunnerupLinks.forEach(x => {
						if (allRunnerup.has(x.player)) {
							links.push(x);
							return;
						}

						runnerupsData.push([x.player, x.years]);
					});
					/// add the remaining runnerups into the "Other" node
					if (runnerupsData.length > 0)
						links.push({
							'source': tournamentNodeId,
							'target': getOtherId('L'),
							'value': runnerupsData.map(x => x[1].length).reduce((x, y) => (x + y)),
							'data': runnerupsData,
							'other': true
						});
				});
				
				/// create a new mapping from [0, old_num_nodes - 1] -> [0, new_num_nodes] after creating the "Other" nodes
				var usedNodeIds = new Set(links.flatMap(x => [x.source, x.target]));
				var nodes = nodes.filter(x => usedNodeIds.has(x.node));
				var mapOldIdx = nodes.map(x => x['node']).map((oldIdx, idx) => [oldIdx, idx]).reduce((acc, cur) => {acc[cur[0]] = cur[1]; return acc;}, {});
				
				/// remap the whole data about the node IDs
				var nodes = nodes.map(x => {
					x['node'] = mapOldIdx[x['node']];
					return x;
				});
				var links = links.map(x => {
					x['source'] = mapOldIdx[x['source']];
					x['target'] = mapOldIdx[x['target']];
					return x;
				});

				return {'nodes': nodes, 'links': links};
			}

			var margin = {top: 10, right: 10, bottom: 10, left: 10},
			width = 950 - margin.left - margin.right,
			height = 740 - margin.top - margin.bottom;
			
			/// generate description of the edges
			var edgeDescription = function(d) {
				if (!d.other) {
					var ret = "";
					if (d.type == 'Wins') ret += d.source.name + " @ " + d.target.name;
					else ret += d.target.name + " @ " + d.source.name; // ???
					ret += "\n";
					ret += d.value + ' Final ' + d.type;
					ret += "\n";
					ret += "Year" + (d.years.length > 1 ? "s" : "") + ": " + d.years.reverse().join(', ');
					return ret;
				}

				var ret = "Other players\n";
				ret += d.data.sort((f, s) => {
					if (f[1].length < s[1].length) return +1;
					if (f[1].length > s[1].length) return -1;
					if (f[1][0] < s[1][0]) return +1;
					return -1;
				}).map(x => [x[0], x[1].reverse()]).map(x => '' + x[0] + ': ' + x[1].join(', ')).join('\n');
				return ret;
			},  color = d3.interpolateGreens;

			// append the svg canvas to the page
			var svg = d3.select("#sankey_div").append("svg")
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
							.style("stroke", "gray")
							.style("stroke-opacity", ".33")
							.on("mouseover", function() { d3.select(this).style("stroke-opacity", ".5") } )
							.on("mouseout", function() { d3.select(this).style("stroke-opacity", ".2") } )
							.style("stroke-width", function(d) { return Math.max(1, d.dy); })
							.sort(function(a, b) { return b.dy - a.dy; });

			// add the link titles
			link.append("title")
				.text(edgeDescription);
				
			const winnerMaxValue = sankeyData.nodes.filter(x => x.type == "winner").map(x => x.value * 1).sort((a, b) => b - a)[0];
			const runnerupMaxValue = sankeyData.nodes.filter(x => x.type == "runnerup").map(x => x.value * 1).sort((a, b) => b - a)[0];

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
										/// 	d3.event.sourceEvent.stopPropagation(); // silence other listeners
										/// if (d3.event.sourceEvent.which == 1)
										/// 	dragInitiated = true;
										this.parentNode.appendChild(this);
									})
									.on("drag", dragmove))
									.on("mouseover", showPlayerInfo)
									.on("mouseout", showPlayerInfo);
			function subject(d) {return { x: d.x, y: d.y }};

			// add the rectangles for the nodes
			node.filter(function(d) { return d.type != 'tournament' })
				.append("rect")
				.attr("height", function(d) { return d.dy; })
				.attr("width", sankey.nodeWidth())
				.style("fill", function(d) {
					if (d.other) return d.color = color(0);
					if (d.type == "winner") return d.color = color(d.value / winnerMaxValue);
					return d.color = color(d.value / runnerupMaxValue);
				})
				.style("stroke", function(d) {
					return d3.rgb(d.color).darker(2); })
				.append("title")
				.text(function(d) { return "";
					return d.name + "\n" + "Total " + d.value + " Grand Slam Finals"; });

			var tournament_nodes = node.filter(function(d) { return d.type == 'tournament' })
			tournament_nodes
				.append("pattern")
					.attr("id", d => d.name.replace(/\s/g, '').toLowerCase())
					.attr('patternUnits', 'userSpaceOnUse')
					.attr('width', function (d) {
						return d.dy;
					})
					.attr('height', function (d) {
						return d.dy;
					})
					.attr("x", function(d) {
						return d.dy/2+d.dx/2;
					})
					.attr("y", 0)
				.append("image")
					.attr('width', function (d) {
						return d.dy;
					})
					.attr('height', function (d) {
						return d.dy;
					})
					.attr("xlink:href", d => "https://raw.githubusercontent.com/com-480-data-visualization/data-visualization-project-2021-m3/master/data/logos/" + d.name + ".svg")
					.attr("preserveAspectRatio", "none")
			
			tournament_nodes
				.append("circle")
				.attr("cx", sankey.nodeWidth()/2)
				.attr("cy", function (d) {
					return d.dy/2;
				})
				.attr("r", function (d) {
					return d.dy/2;
				})
				.attr('fill', d => "url(#" + d.name.replace(/\s/g, '').toLowerCase() + ")")
				.attr('stroke-width', 4)
				.attr('stroke', 'white')
			

			// add in the title for the nodes
			node.filter(function(d) { return d.type != 'tournament' })
				.append("text")
				.attr("id", function(d) { return "text:" + d.name})
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
						) + ")")
						.attr("dragged", "True");
				sankey.relayout();
				link.attr("d", path);
			}
			
			function showPlayerInfo(d) {
				console.log(d);
				console.log(d3.event);
				/// a man's gotta do what a man's gotta do
				if (!d3.select(this).select('text')._groups[0][0]) return;
				var playerName = d3.select(this).select('text')._groups[0][0].innerHTML;
				if (["Australian Open", "French Open", "Wimbledon", "US Open"].includes(playerName)) return;
				if (d.other) return;
				var coordinates = this.children[1].getBoundingClientRect();
				var popup = document.getElementById("infobox");
				popup.style.position = "absolute";
				popup.style.left = (d3.event.x + (d.type == 'winner' ? +150 : -350)) + 'px';
				popup.style.top = (d3.event.offsetY) + 'px';
				popup.innerHTML = generatePlayerDescription(playerName);
				popup.classList.toggle("show");

				function generatePlayerDescription(playerName) {
					const base_url = '../data/player_images/';
					var image_url = base_url + playerName + '.jpg';

					const playerInfo = getPlayerInfo(playerName);

					var ret = '<div class="infoTitle">' + playerName + '</div>';
					ret += '<img src="' + image_url + '"class=player_image>';
					ret += '<table>';
					ret += '<tbody>';
					ret += '<tr>';
					ret += '<td>' + 'Birth date:' + '</td>';
					ret += '<td>' + playerInfo.birth_date + '</td>';
					ret += '</tr>';
					ret += '<tr>';
					ret += '<td>' + 'Country:' + '</td>';
					ret += '<td>' + playerInfo.country + '</td>';
					ret += '</tr>';
					ret += '<tr>';
					ret += '<td>' + 'Residence:' + '</td>';
					ret += '<td>' + playerInfo.residence + '</td>';
					ret += '</tr>';
					ret += '<tr>';
					ret += '<td>' + 'Height:' + '</td>';
					ret += '<td>' + playerInfo.height + '</td>';
					ret += '</tr>';
					ret += '<tr>';
					ret += '<td>' + 'Playing style:' + '</td>';
					ret += '<td>' + playerInfo.play_style + '</td>';
					ret += '</tr>';
					ret += '<tr>';
					ret += '<td>' + 'Turned Pro:' + '</td>';
					ret += '<td>' + playerInfo.turned_pro + '</td>';
					ret += '</tr>';
					ret += '<tr>';
					ret += '<td>' + 'Grand Slam(s) ' + (d.type == "winner" ? "Won" : "Finals") + ':' + '</td>';
					ret += '<td>' + d.value + '</td>';
					ret += '</tr>';
					ret += '</tbody>';
					ret += '</table>';
					return ret;

					function getPlayerInfo(playerName) {
						var curPlayerData = playersData.filter(x => x.Name.includes(playerName));
						if (curPlayerData.length == 0) return {};
						var data = curPlayerData[0];

						return {
							'name': removeQuotes(data.Name),
							'country': removeQuotes(data['Country (sports)']),
							'birth_date': removeQuotes(data.Born),
							'height': removeQuotes(data.Height),
							'play_style': removeQuotes(data.Plays),
							'residence': removeQuotes(data.Residence),
							'turned_pro': data['Turned pro']
						}
						function removeQuotes(x) {
							return x.substr(1, x.length - 2);
						}
					}
				}
			}

			function endclick(d) {
				var wasDragged = d3.select(this).attr("dragged");
				d3.select(this).attr("dragged", "False");
				if (wasDragged && wasDragged == "True") return;
			}
		});

	});
};

function updateSankey(URL, range, gender) {
	d3.select('#sankey_div').selectAll('svg').remove();
	makeSankey(URL, range, gender);
}
