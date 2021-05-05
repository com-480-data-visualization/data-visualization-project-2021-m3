import { updateSankey } from './sankey.js'
import { updateNetwork } from './network.js'
export { createTimeline }

//var male = "https://raw.githubusercontent.com/com-480-data-visualization/data-visualization-project-2021-m3/master/data/men_finals_OpenEra.csv";
//var female = "https://raw.githubusercontent.com/com-480-data-visualization/data-visualization-project-2021-m3/master/data/women_finals_OpenEra.csv";
var data = "https://raw.githubusercontent.com/com-480-data-visualization/data-visualization-project-2021-m3/master/data/combined_OpenEra.csv"

const timelineElement = document.getElementById("timeline")

var margin = {
    top: 10,
    right: 40,
    bottom: 150,
    left: 60
    }
var width = timelineElement.clientWidth * 0.95,
timeline_height = 80,
h = 25,
w = width - margin.left - margin.right,
r = [2015, 2021];

var svg = d3.select("#timeline") 
            .append("svg")
                .attr("width", width)
                .attr("height", timeline_height)
let g = svg.append('g')
       .attr('transform', `translate(${margin.left}, ${margin.top})`)

function createTimeline(gender = "M") {
    let years = [];
    for (var i = 1968; i <= 2021; i++) {
        years.push(i);
    }
    
    const range = [d3.min(years), d3.max(years) + 1];

    var x = d3.scaleLinear()
        .domain(range)  
        .range([0, w]);

    var labelL = g.append('text')
    .attr('id', 'labelleft')
    .attr('x', 0)
    .attr('y', h + 5)
    .text(range[0])

    var labelR = g.append('text')
      .attr('id', 'labelright')
      .attr('x', 0)
      .attr('y', h + 5)
      .text(range[1])

    var brush = d3.brushX()
      .extent([[0,0], [w, h]])
      .on('brush', function() {
        var s = d3.event.selection;
        // update and move labels
        labelL.attr('x', s[0])
          .text(Math.round(x.invert(s[0])))
        labelR.attr('x', s[1])
          .text(Math.round(x.invert(s[1])) - 1)
        // move brush handles      
        handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - h / 4] + ")"; });
        // update view
        svg.node().value = s.map(d => Math.round(x.invert(d)));
        svg.node().dispatchEvent(new CustomEvent("input"));
      })
      .on('end', function() {
        if (!d3.event.sourceEvent) return;
        var d0 = d3.event.selection.map(x.invert);
        var d1 = d0.map(Math.round)
        d3.select(this).transition().call(d3.event.target.move, d1.map(x))
        updateSankey(data, d1, gender); 
        updateNetwork(data, d1, gender);
      })

    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush)

    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function(d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = h / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
          "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
          "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    var handle = gBrush.selectAll(".handle--custom")
      .data([{type: "w"}, {type: "e"}])
      .enter().append("path")
      .attr("class", "handle--custom")
      .attr("stroke", "#3D0B09")
      .attr("fill", '#3D0B09')
      .attr("cursor", "ew-resize")
      .attr("d", brushResizePath);

      // override default behaviour - clicking outside of the selected area 
      // will select a small piece there rather than deselecting everything
      // https://bl.ocks.org/mbostock/6498000
      gBrush.selectAll(".overlay")
      .each(function(d) { d.type = "selection"; })
      .on("mousedown touchstart", brushcentered)

    function brushcentered() {
      var dx = x(1) - x(0), // use a fixed width when recentering
      cx = d3.mouse(this)[0],
      x0 = cx - dx / 2,
      x1 = cx + dx / 2;
      d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }

    gBrush.call(brush.move, range.map(x))

  }

createTimeline();
updateSankey(data);
updateNetwork(data);
