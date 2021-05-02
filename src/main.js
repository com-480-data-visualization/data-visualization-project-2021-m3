function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

// reload page on resize
addEventListener('resize', function() {
  location.reload();
});

whenDocumentLoaded(() => {
  // Range slider; adapted from https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush

  d3.csv('../data/men_finals.csv').then((data) => makeTimeline(data))

  function makeTimeline(data) {
    let filtered = data.filter(d => {
          return +d.Year > 1967 ;
      });
    let years = filtered.map(d => +d.Year);

    const timelineElement = document.getElementById("timeline")

    const margin = {
        top: 10,
        right: 40,
        bottom: 150,
        left: 60
      },
    width = timelineElement.clientWidth * 0.95,
    height = 80,
    h = 25,
    w = width - margin.left - margin.right,
    range = [d3.min(years), d3.max(years) + 1];

    var x = d3.scaleLinear()
      .domain(range)  
      .range([0, w]);  

    var svg = d3.select("#timeline") 
      .append("svg")
        .attr("width", width)
        .attr("height", height)
    let g = svg.append('g')
             .attr('transform', `translate(${margin.left}, ${margin.top})`)
   
    /* Adds ticks to the timeline but idk, I prefer the minimalist appearance
      g.append('g').selectAll('line')
      .data(d3.range(range[0], range[1]+1))
      .enter()
      .append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', h)
      .style('stroke', '#3D0B09')
      .style('opacity', '0.25')
    */

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
        // if the view should only be updated after brushing is over, 
        // move these two lines into the on('end') part below
        svg.node().value = s.map(d => Math.round(x.invert(d)));
        svg.node().dispatchEvent(new CustomEvent("input"));
      })
      .on('end', function() {
        if (!d3.event.sourceEvent) return;
        var d0 = d3.event.selection.map(x.invert);
        var d1 = d0.map(Math.round)
        d3.select(this).transition().call(d3.event.target.move, d1.map(x))
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
});
