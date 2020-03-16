import * as d3 from "d3"

export default class Radial {

    constructor(json, id) {

		var self = this

		this.json = json

		this.id = id

    }

    create(unit) {

    	var self = this

    	var width = unit

		var height = unit

		var radius = unit / 2.5

		var counter = 0

		var tree = d3.tree()
		  .size([2 * Math.PI, radius])
		  .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

		var shiz = d3.hierarchy(self.json).sort((a, b) => d3.ascending(a.data.name, b.data.name))

		const root = tree(shiz);

		var temp = function() {

			var links = root.links()

			return links.filter( (item) => {

				if (item.source.depth < counter) {

					return item

				}
			})
		}

		const svg = d3.select(`#${self.id}`).append("svg").attr("width", width).attr("height", width)

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
			.attr("fill", d => d.children ? "#555" : "#999")
			.attr("r", 2.5);

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
			.attr("dy", "0.31em")
			.attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
			.attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
			.text( (d,i) => i+1)
			.clone(true).lower()
			.attr("stroke", "white");

		svg.append("g")
			.append("circle")
			.attr("cx", width / 2)
			.attr("cy", width / 2)
			.attr("r", (width / 2) / 2.5)
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.attr("fill", "none")
			.style("stroke-dasharray", ("3, 3"))

		svg.append("g")
			.append("circle")
			.attr("cx", width / 2)
			.attr("cy", width / 2)
			.attr("r", (width / 2) / 5)
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.attr("fill", "none")
			.style("stroke-dasharray", ("3, 3"))

		svg.append("g")
			.append("circle")
			.attr("cx", width / 2)
			.attr("cy", width / 2)
			.attr("r", (width / 2) / 1.67)
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.attr("fill", "none")
			.style("stroke-dasharray", ("3, 3"))

		svg.append("g")
			.append("circle")
			.attr("cx", width / 2)
			.attr("cy", width / 2)
			.attr("r", (width / 2) / 1.25)
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5)
			.attr("fill", "none")
			.style("stroke-dasharray", ("3, 3"))

		function render() {

		    d3.selectAll("path").remove()

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

		    d3.selectAll(".testing").style("display", d => {
		      return (d.depth > counter) ? "none" : "block" ;
		    })

		    next()

		}

		function update(){

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

		}

		function next() {

		  if (counter < 5) {
		    setTimeout(function(){ 
		      render();
		      ++counter
		    }, 1000);
		  }

		}

		render()


    }
}