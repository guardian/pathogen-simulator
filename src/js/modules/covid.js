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

    create(counter, json=null) {

    	var self = this

    	if (json!=null) {

    		this.json = json

    	}

    	this.counter = 0

    	d3.select(`#${self.id}`).select(`svg`).remove();

    	var width = this.unit 

		var height = this.unit 

		var radius = this.unit  / 2.6

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
			.attr("fill", d => {

				if (d.data.infected==="isolated") {
					console.log("isolated")
					//isoball((width / 2) + d.x * 180 / Math.PI - 90, (width / 2) + d.y, 20)
				}
				
				return (d.data.infected === true) ? "#D73027" :
					(d.data.infected === false) ? "lightgrey" : "#91BFDB"
			})
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

		svg.append("text")
			.attr("class", "radial-info-big")
			.attr("x", width / 2)
			.attr("y", 30)
			.text(`${self.json.name}, R naught = ${self.json.r0}`)
			.style("text-anchor","middle");

		var total = svg.append("text")
			.attr("class", "radial-total-big")
			.attr("x", width / 2)
			.attr("y", height - 20)
			.style("text-anchor","middle");

		function isoball(x,y,r) {

			svg.append("g")
				.append("circle")
				.attr("cx", x)
				.attr("cy", y)
				.attr("r", r)
				.attr("stroke", "#555")
				.attr("stroke-opacity", 0.4)
				.attr("stroke-width", 1.5)
				.attr("fill", "none")
				.style("stroke-dasharray", ("3, 3"))


		}

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

		    if (self.counter === 3) {

				total.text(`Total infected: ${self.json.total}`)

		    } else {

		    	total.text(``)

		    }


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

    isolate(data) {

    	var counter = 0

		var recur = function (obj) {

			obj.infected = false

			obj.children.forEach(function (child) {

				counter++

				if (child.children) {

					child.infected = false

					recur(child)

				} else {

					child.infected = false

				}

			})

		} 

		recur(data.children[1])

		data.children[1].infected = 'isolated'

		var previous = data.total

		var updated = previous - counter - 1

		data.total = `${updated} instead of ${previous}` 

		return data

    }

}