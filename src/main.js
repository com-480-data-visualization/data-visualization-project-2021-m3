function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

/*
whenDocumentLoaded(() => {
	showTimeline = new Timeline('timeline');
});

class Timeline {
  constructor(id) {
    this.svg = document.getElementById("#" + id);
    const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;
  }
}
*/

d3.csv('../data/men_finals.csv', loadFinals).then((d) => console.log(d))

function loadFinals(d) {
  return {
    year : new Date(+d.Year, 0, 1),
    tournament: d.Tournament,
    winner: d.Winner,
    rup: d["Runner-up"],
    score: d.Score
  };
}