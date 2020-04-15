
const D3Node    = require('d3-node');

const d3n   = new D3Node();
const d3    = d3n.d3;

//const d3 = require('d3')

module.exports = class Radial {

    constructor(json, unit, rings=3) {

		var self = this

		this.json = json

		this.unit = unit

		this.rings = rings

    }

    async create(unit) {

    	var self = this

    	var width = this.unit 

		var height = this.unit 

		var radius = this.unit  / 2.9

		var tree = d3.tree()
		  .size([2 * Math.PI, radius])
		  .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

		var shiz = d3.hierarchy(self.json).sort((a, b) => d3.ascending(a.data.name, b.data.name))

		const root = tree(shiz);

		var links = root.links()

		const svg = d3n.createSVG(width, height)
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
				.data(links)
				.join("path")
					.attr("d", d3.linkRadial()
					.angle(d => d.x)
					.radius(d => d.y));

		

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
			.style("display", "block")
			.attr("transform", d => `
			rotate(${d.x * 180 / Math.PI - 90}) 
			translate(${d.y},0) 
			rotate(${d.x >= Math.PI ? 180 : 0})
			`)

		// Add the ever decreasing circles

		var rad = radius

		var labels = [3,2,1]

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

			// svg.append("text")
			// 	.attr("x", width / 2)
			// 	.attr("y", (width / 2) + (rad - 5))
			// 	.text(`${labels[i]}`)
			// 	.attr("font-family", "sans-serif")
			// 	.attr("font-size", "12px")
			// 	.attr("fill", "black")
			// 	.style("text-anchor","middle");

				rad = rad - (radius / this.rings)

		}

		svg.append("text")
			.attr("class", "radial-info")
			.attr("x", width / 2)
			.attr("y", 15)
			.text(`${self.json.name}, R naught = ${self.json.r0}`)
			.style("text-anchor","middle");

		svg.append("text")
			.attr("class", "radial-total")
			.attr("x", width / 2)
			.attr("y", height - 15)
			.text(`Total infected: ${self.json.total}`)
			.style("text-anchor","middle");

		svg.append("g")
			.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
			.attr("fill", "none")
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
			.data(links)
			.join("path")
			.attr("d", d3.linkRadial()
			.angle(d => d.x)
			.radius(d => d.y));

		svg.append("g")
			.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
			.attr("fill", "none")
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.selectAll("path")
				.data(links)
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
			.style("display", "block")
			.attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
			.attr("fill", "red")
			.attr("r", 5);			

		return await d3n.svgString()

    }
}