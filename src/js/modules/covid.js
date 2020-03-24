import * as d3 from "d3"

export default class Covid {

    constructor(json, id, unit, rings=3) {

		var self = this

		this.json = json

		this.id = id

		this.timeout = null

		this.counter = 0

		this.unit = unit

		this.rings = rings

    }

    create(counter) {

    	var self = this

    	this.counter = 0

    	d3.select(`#${self.id}`).select(`svg`).remove();

    	var width = this.unit 

		var height = this.unit 

		var radius = this.unit  / 2.5

		var tree = d3.tree()
		  .size([2 * Math.PI, radius])
		  .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

		var shiz = d3.hierarchy(self.json).sort((a, b) => d3.ascending(a.data.name, b.data.name))

		const root = tree(shiz);

		var temp = function() {

			var links = root.links()

			return links.filter( (item) => {

				if (item.source.depth < self.counter) {

					return item

				}
			})
		}

		const svg = d3.select(`#${self.id}`)
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.classed("svg-content", true);

		svg.append("g")
			.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
			.attr("fill", "none")
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
				.data(temp)
				.join("path")
					.attr("d", d3.linkRadial()
					.angle(d => d.x)
					.radius(d => d.y));

		svg.append("g")
		.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		.selectAll("circle")
			.data(root.descendants())
			.join("circle")
			.attr("class", "testing")
			.style("display", "none")
			.attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
			.attr("fill", d => d.children ? "red" : "red")
			.attr("r", 5);

		svg.append("g")
		.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("stroke-linejoin", "round")
		.attr("stroke-width", 3)
		.selectAll("text")
			.data(root.descendants())
			.join("text")
			.attr("class", "testing")
			.style("display", "none")
			.attr("transform", d => `
			rotate(${d.x * 180 / Math.PI - 90}) 
			translate(${d.y},0) 
			rotate(${d.x >= Math.PI ? 180 : 0})
			`)

		// Add the ever decreasing circles

		var rad = radius

		for (var i = 0; i < this.rings; i++) {

			svg.append("g")
				.append("circle")
				.attr("cx", width / 2)
				.attr("cy", width / 2)
				.attr("r", rad)
				.attr("stroke", "#555")
				.attr("stroke-opacity", 0.4)
				.attr("stroke-width", 1.5)
				.attr("fill", "none")
				.style("stroke-dasharray", ("3, 3"))

				rad = rad - (radius / this.rings)

		}

	    d3.select(`#${self.id}`).selectAll(".testing").style("display", d => {
	      return (d.depth > self.counter) ? "none" : "block" ;
	    })


		function render() {

		    d3.select(`#${self.id}`).selectAll("path").remove()

			svg.append("g")
			.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
			.attr("fill", "none")
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
			.data(temp)
			.join("path")
			.attr("d", d3.linkRadial()
			.angle(d => d.x)
			.radius(d => d.y));

		    d3.select(`#${self.id}`).selectAll(".testing").style("display", d => {
		      return (d.depth > self.counter) ? "none" : "block" ;
		    })

		    next()

		}

		function next() {

		  if (self.counter < counter) {

		  	++self.counter
		  	
		    render(); 

		    

		  }

		}

		render()

    }

}