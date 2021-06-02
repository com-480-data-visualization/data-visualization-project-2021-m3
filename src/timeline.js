import { updateSankey } from './sankey.js'
import { Network } from './network.js'

var data = "https://raw.githubusercontent.com/com-480-data-visualization/data-visualization-project-2021-m3/master/data/combined_OpenEra.csv"
var graph = new Network("#network");

var margin = {
    top: 10,
    right: 40,
    bottom: 150,
    left: 40
    }

var width = $(document).width() * 0.5,
  timeline_height = 80,
  h = 25,
  w = width - margin.left - margin.right;

class Timeline {
  constructor(element) {
    this.svg = d3.select(element)
            .append("svg")
                .attr("width", width)
                .attr("height", timeline_height)
    this.g = this.svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.years = [];
    for (var i = 1968; i <= 2021; i++) {
        this.years.push(i);
    }

    this.range = [d3.min(this.years), d3.max(this.years) + 1];

    this.x = d3.scaleLinear()
        .domain(this.range)
        .range([0, w]);

    this.labelL = this.g.append('text')
    .attr('id', 'labelleft')
    .attr('x', 0)
    .attr('y', h + 5)
    .text(this.range[0])

    this.labelR = this.g.append('text')
      .attr('id', 'labelright')
      .attr('x', 0)
      .attr('y', h + 5)
      .text(this.range[1])

    var brush = d3.brushX()
      .extent([[0,0], [w, h]])
      .on('brush', () => {
        const selection = d3.event.selection;
			  this.updateTime(selection);
      })
      .on('end', () => {
        if (!d3.event.sourceEvent) return;
        const event = d3.event;
        this.updateData(event);
      });

    var gBrush = this.g.append("g")
      .attr("class", "brush")
      .call(brush)

    this.handle = gBrush.selectAll(".handle--custom")
      .data([{type: "w"}, {type: "e"}])
      .enter().append("path")
      .attr("class", "handle--custom")
      .attr("stroke", "#3D0B09")
      .attr("fill", '#3D0B09')
      .attr("cursor", "ew-resize")
      .attr("d", this.brushResizePath);

      // override default behaviour - clicking outside of the selected area
      // will select a small piece there rather than deselecting everything
      // https://bl.ocks.org/mbostock/6498000
      gBrush.selectAll(".overlay")
      .each(function(d) { d.type = "selection"; })
      .on("mousedown touchstart", this.brushcentered)

      gBrush.call(brush.move, this.range.map(this.x))

      this.initPlots("M");
    }

    initPlots(gender) {
      updateSankey(data, this.range, gender);
      graph.updateNetwork(data, this.range, gender);
      this.gender = gender;
    }

    updateTime(selection) {
      // update and move labels
      this.labelL.attr('x', selection[0])
        .text(Math.round(this.x.invert(selection[0])))
      this.labelR.attr('x', selection[1])
        .text(Math.round(this.x.invert(selection[1])) - 1)
      // move brush handles
      this.handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ selection[i], - h / 4] + ")"; });
      // update view
      this.svg.node().value = selection.map(d => Math.round(this.x.invert(d)));
      this.svg.node().dispatchEvent(new CustomEvent("input"));
    }

    updateData(event) {
        var actual = event.selection.map(this.x.invert);
        /// var selection = actual.map(Math.round) nononono
		var selection = actual.map(Math.floor) // year selection
        d3.select("brush").transition().call(event.target.move, selection.map(this.x))
        updateSankey(data, selection, this.gender);

        graph.updateNetwork(data, selection, this.gender);

        this.range = selection;
    }


    brushResizePath(d) {
      // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
      var e = +(d.type == "e"),
          x = e ? 1 : -1,
          y = h / 2;
      return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
        "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
        "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    brushcentered() {
      var dx = x(1) - x(0), // use a fixed width when recentering
      cx = d3.mouse(this)[0],
      x0 = cx - dx / 2,
      x1 = cx + dx / 2;
      d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }
  }

function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", action);
  } else {
      // `DOMContentLoaded` already fired
      action();
  }
}

whenDocumentLoaded(() => {
    var plot_timeline = new Timeline("#timeline");

    d3.select("#switchButton").on("change", function() {
      if(this.checked){
        plot_timeline.initPlots("M")
      }else{
        plot_timeline.initPlots("F")
      }
    })


    var clicked=false;
    d3.select("#button").on("click", function() {
      graph.magnifier_on_off(); // fisheye zoom
      if(clicked){
        $(this).css('background-color', 'white');
        $(this).css('color', '#171515');
        clicked  = false;
    } else {
        $(this).css('background-color', '#171515');
        $(this).css('color', 'white');
        clicked  = true;
    }
    })

    d3.select(".exitButton").on("click",function() {graph.exitSearch();});
});

addEventListener('resize', function() {
  location.reload();
});
