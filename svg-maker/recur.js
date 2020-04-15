const d3 = require('d3')

module.exports = class Recur {

    constructor(r0, virus, generations=3) {

		var self = this

		this.r0 = r0

		this.virus = virus

		this.generations = generations

		this.data = { "name": virus, "r0": r0 }

	    this.infected = d3.range((generations + 2)).map( (i) => {
			return {
				"phase" : i + 1,
				"infected" : 0
			}
	    });

		this.create()

    }

    create() {

    	var self = this

		function generatePartial(r0) {

			if (r0 % 1 != 0) {

				var base = Math.floor(r0)

				var remainder = parseInt((r0 + "").split(".")[1]) / 10

				var addition = 0

				if (Math.random(0, 1) <= remainder) {

					addition = 1

				}

				return base + addition

			} else {

				return r0

			}
		}

		function makeNodes(r0, level) {

			var temp = [];

			var nodes = generatePartial(r0);

			for (var i = 0; i < nodes; i++) {

				temp.push({

					"name": "node_" + level + "_" + i,

				})
			}

			return temp
		}

		var getDepth = function(obj) {

			var depth = 0;

			if (obj.children) {

				obj.children.forEach(function(d) {

					var tmpDepth = getDepth(d)

					if (tmpDepth > depth) {

						depth = tmpDepth

					}
				})
			}

			return 1 + depth

		}

		var getLevel = function(obj, root) {

			var depth = 0;

			var found = false;

			function search(current) {

				if (current === obj) {

					found = true

					return depth
				}

				if (current.children) {

					depth = 1 + depth;

					current.forEach(function(d) {

						if (d === obj) {

							found = true

							return depth
						}

						current.children.forEach(function(dd) {

							var blah = search(dd);

							return blah
						})
					})
				}
			}

			var blah = search(root);

			return blah
		}

		var recur = function (obj, root, depth) {

			if (!obj.children && (depth <= self.generations)) {

				obj.children = makeNodes(root.r0, depth)
			
				obj.level = depth

				obj.infected = true

				self.infected[depth].infected = self.infected[depth].infected + 1

				if (!obj.name) {

					obj.name = "gen" + depth

				}

				if (obj.level <= self.generations) {

					obj.children.forEach(function (child) {

						if (!child.children) {

							recur(child, root, depth + 1)

						}

					})
				}
			} else {

				obj.infected = true

				self.infected[depth].infected = self.infected[depth].infected + 1

			}
		} 

		recur(self.data, self.data, 0)

    }

    json() {

		var total = this.infected.reduce( (accumulator, cases) => accumulator + cases.infected, 0);

		this.data.total = total

    	this.data.info = this.infected

    	this.data.infected = true

    	return this.data

    }

}