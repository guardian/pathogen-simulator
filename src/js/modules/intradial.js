import * as d3 from "d3"

export default class Radial {

    constructor(json, svg, id, x, y, unit, radius, rings=3) {

		var self = this

		this.json = json

		this.svg = svg

		this.id = id

		this.x = x

		this.y = y

		this.timeout = null

		this.counter = 0

		this.unit = unit

		this.rings = rings

    }

    create() {

    	var self = this

    	var width = this.unit 

		var height = this.unit 

		var radius = this.unit

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

		this.svg.append("g")
			.attr("id", `intro-ball-${self.id}`)
			.attr("transform", "translate(" + (self.x) + "," + (self.y) + ")")
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
				.data(temp)
				.join("path")
					.attr("d", d3.linkRadial()
					.angle(d => d.x)
					.radius(d => d.y));

		this.svg.append("g")
		.attr("transform", "translate(" + (self.x) + "," + (self.y) + ")")
		.selectAll("circle")
			.data(root.descendants())
			.join("circle")
			.attr("class", "testing")
			.style("display", "none")
			.attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
			.attr("fill", d => d.children ? "red" : "red")
			.attr("r", 5);

		this.svg.append("g")
		.attr("transform", "translate(" + (self.x) + "," + (self.y) + ")")
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

		var labels = [3,2,1]

		for (var i = 0; i < this.rings; i++) {

			this.svg.append("g")
				.append("circle")
				.attr("cx", self.x)
				.attr("cy", self.y)
				.attr("r", rad)
				.attr("stroke", "white")
				.attr("stroke-opacity", 0.4)
				.attr("stroke-width", 1.5)
				.attr("fill", "none")
				.style("stroke-dasharray", ("3, 3"))

			this.svg.append("text")
				.attr("x", width / 2)
				.attr("y", (width / 2) + (rad - 5))
				.text(`${labels[i]}`)
				.attr("font-family", "sans-serif")
				.attr("font-size", "12px")
				.attr("fill", "black")
				.style("text-anchor","middle");

				rad = rad - (radius / this.rings)

		}


		function render() {

		    d3.select(`#intro-ball-${self.id}`).selectAll("path").remove()

			self.svg.append("g")
			.attr("transform", "translate(" + (self.x) + "," + (self.y) + ")")
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
			.data(temp)
			.join("path")
			.attr("d", d3.linkRadial()
			.angle(d => d.x)
			.radius(d => d.y));


		    d3.select(`#intro-ball-${self.id}`).selectAll(".testing").style("display", d => {

		      return (d.depth > self.counter) ? "none" : "block" ;

		    })

		    next()

		}

		function update(){

			self.svg.append("g")
			.attr("transform", "translate(" + (self.x) + "," + (self.y) + ")")
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
				.data(temp)
				.join("path")
					.attr("d", d3.linkRadial()
					.angle(d => d.x)
					.radius(d => d.y));

		}

		function next() {

		  if (self.counter < 5) {

		    self.timeout = setTimeout(function() { render(); ++self.counter }, 1000);

		  }

		}

		render()


    }
}