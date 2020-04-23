import shuffle from "../modules/shuffle"
import mustache from "../modules/mustache"
import * as d3 from "d3"
import { kdTree } from "kd-tree-javascript"
import noUiSlider from 'nouislider'
import info from '../../templates/results.html'

export class Reduction {

    constructor(settings, id) {

    	var self = this

    	this.settings = settings

    	this.settings.re = (this.settings.r0 * this.settings.susceptible).toFixed(2);

    	this.simulation = null

    	this.nodes = this.getNodes()

		this.canvas = document.createElement('canvas');

        this.div = document.getElementById(id);

	    this.width = this.div.clientWidth || this.div.getBoundingClientRect().width

	    this.height = this.div.clientHeight || this.div.getBoundingClientRect().height

	    this.context = this.canvas.getContext("2d")

	    this.canvas.width = this.width
	       
	    this.canvas.height = this.height

	    this.div.appendChild(this.canvas)

	    this.novel = false

	    this.distance = (a, b) => Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);

	    this.resizer()
    }

    loadCase(r0, fatality_rate, susceptible, isolation, spread, shuffle, id) {

    	var self = this

    	self.spread = spread

    	self.shuffle = shuffle

		self.settings.r0 = r0

		self.settings.fatality_rate = fatality_rate

		self.settings.susceptible = susceptible

		self.settings.isolated = isolation

		//console.log(`Trigger: ${id}, R0: ${r0}, Fatality rate: ${fatality_rate}, susceptiblity: ${susceptible}, isolation: ${isolation}, Spread: ${spread}, Shuffle: ${shuffle}`)

		this.trigger()

    }

    trigger() {

    	var self = this

    	if (this.simulation!=null) {

    		this.simulation.stop()

    	}

    	var nodes = self.nodes

    	this.updateNodes(nodes).then( data => {

    		self.nodes = data

    		self.propagate() 

    	})

    }

    async updateNodes(nodes) {

    	var self = this

		await nodes.forEach(function(node, index) {

			node.exposed = false 

			node.susceptible = (index < self.settings.population * self.settings.susceptible) ? true : false ;

			node.isolated = (index < self.settings.population * self.settings.isolated) ? true : false ;

			node.status = (node.isolated) ? "isolated" : "healthy"

		});

		if (self.shuffle) {

			nodes = await shuffle(nodes)

		}

		var vulnerable = nodes.filter( (item) => { return item.susceptible && !item.isolated })

		self.settings.vulnerable = Math.floor(vulnerable.length)

		//console.log(`Vulnerable: ${self.settings.vulnerable}`)

		//console.log(`RE: ${ self.settings.r0 * ( 100 / 1000 * self.settings.vulnerable / 100 )}`)


		return nodes

    }

    init() {

    	var self = this

		this.ticked = () => {

			var self = this

			self.context.clearRect(0, 0, self.width, self.height);
			self.context.save();
			self.context.translate(self.width / 2, self.height / 2);

			self.nodes.forEach(function(d) {
				self.context.beginPath();
				self.context.moveTo(d.x + d.r, d.y);
				self.context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
				self.context.strokeStyle = "#333";
				self.context.fillStyle = self.getStatus(d.status)
				self.context.fill();
				self.context.stroke();
			});

			self.context.restore();

		}

		var width = document.documentElement.clientWidth

    	var strength = (width < 1500) ? 0.0004 * 20 : 0.0004  ;

    	var velocityDecay = (width < 1500) ? 0.4 * 0.7 : 0.4 ; 

    	var iterations = (width < 1500) ?  4 * 0.7 : 4 ; 

	    this.simulation = d3.forceSimulation(self.nodes)
	        .velocityDecay(velocityDecay)
	        .force("x", d3.forceX().strength(strength))
	        .force("y", d3.forceY().strength(strength))
	        .force("collide", d3.forceCollide().radius(function(d) { return d.r; }).iterations(iterations))
	        .on("tick", self.ticked)

    }

    propagate() {

    	var self = this

		self.settings.steps.total = Math.ceil(self.getBaseLog(self.settings.r0, self.settings.population * self.settings.susceptible))

		self.settings.deaths = 0

		self.settings.steps.current = 0

		self.settings.steps.term = 1

		self.settings.infected = 1

		// var origin = Math.floor(Math.random() * self.settings.population) + 1  

		self.nodes[0].status = "infected"

		self.nodes[0].exposed = true

		self.settings.current = self.nodes[0]

		self.settings.steps.total

		self.simulation.restart()

		if (self.spread) {

			this.next()

		}

    }

    getRadius() {

    	var width = document.documentElement.clientWidth

    	var radius = (width < 480) ? 2 :
			    	(width < 900) ? 3 :
			    	(width < 1300) ? 4 : 5 ;

    	return radius

    }

    getNodes() {

    	var self = this

	    var nodes = d3.range(self.settings.population).map(function(i) {
	      return {
	        r: self.getRadius(),
	        status: "healthy",
	        exposed: false
	      };
	    });

	    for (var i = 0; i < nodes.length; i++) {

	    	nodes[i].susceptible = (i < self.settings.population * self.settings.susceptible) ? true : false ;

	    }

	    return shuffle(nodes)

    }

    calculate() {

    	var self = this

      	this.simulation.stop()

      	var vulnerable = self.nodes.filter(item => !item.exposed && item.susceptible && !item.isolated)

      	++self.settings.steps.current

      	self.settings.steps.term = self.settings.steps.term * self.settings.r0

      	var tree = new kdTree(vulnerable, self.distance, ["x", "y"]);
       
      	var nearest = tree.nearest(self.settings.current, vulnerable.length);

      	var actual = 0

		for (var i = 0; i < nearest.length; i++) {

			if (actual < self.settings.steps.term ) {

				if (self.settings.infected < self.settings.vulnerable) { 

					nearest[i][0].status = 'infected' 

					++actual

					++self.settings.infected

					nearest[i][0].exposed = true

				}

			}

		}

		if (actual > 0) {

			this.next()

		} else {

			//console.log("The virus has stopped spreading. ")

		}

      	this.simulation.restart()

    }

    finale() {

    	var self = this

		self.settings.deaths = Math.floor( ( self.settings.population / 100 *  self.settings.susceptible) * self.settings.fatality_rate ) 

		var deathlist = self.nodes.filter(item => item.status != "healthy")

		var departed = deathlist.splice(0, self.settings.deaths)

		for (var i = 0; i < self.settings.deaths; i++) {

			departed[i].status = "dead"

		}

    }

    next() {

    	var self = this

    	var exposed = self.nodes.filter(item => item.exposed)

		if (exposed.length < self.settings.vulnerable) {

			setTimeout(function(){ self.calculate(); }, 1000);

		} else {

			self.finale()

		}

    }

    resizer() {

        var self = this

        window.addEventListener("resize", function() {

            clearTimeout(document.body.data)

            document.body.data = setTimeout( function() { 

			    self.width = self.div.clientWidth || self.div.getBoundingClientRect().width

			    self.height = self.div.clientHeight || self.div.getBoundingClientRect().height

			    self.context = self.canvas.getContext("2d")

			    self.canvas.width = self.width
			       
			    self.canvas.height = self.height

            	self.trigger()

            }, 200);

        });

    }


    distance(a, b) {

    	return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2)

    }

    getStatus(status) {

		return (status==="dead") ? "#542788" : 
		(status==="infected") ? "#D73027"  :
		(status==="isolated") ? "#91BFDB" : "#FEE090"
      
    }

    getBaseLog(r, total) {

      return Math.log(total) / Math.log(r);

    }

}