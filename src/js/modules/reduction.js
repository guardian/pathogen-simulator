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

    loadCase(r0, fatality_rate, susceptible, spread=true, shuffle=true) {

    	var self = this

    	self.spread = spread

    	self.shuffle = shuffle

		self.settings.r0 = r0

		self.settings.fatality_rate = fatality_rate

		self.settings.susceptible = susceptible

		this.trigger()

    }

    trigger() {

    	var self = this

    	//this.nodes = this.getNodes()

    	if (this.simulation!=null) {

    		this.simulation.stop()

    	}

    	self.nodes.filter(item => {

			item.status = "healthy"

			item.exposed = false    	
		})

	    for (var i = 0; i < self.nodes.length; i++) {

	    	self.nodes[i].susceptible = (i < self.settings.population * self.settings.susceptible) ? true : false ;

	    }

		if (self.shuffle) {

			self.nodes = shuffle(self.nodes)

		}

    	this.propagate() 

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

    	var strength = (width < 480) ? 0.005 :
			    	(width < 900) ? 0.003 :
			    	(width < 1600) ? 0.004 : 0.0004 ;

    	var velocityDecay = (width < 480) ? 0.25 :
			    	(width < 900) ? 0.3 :
			    	(width < 1600) ? 0.35 : 0.4 ;

    	var iterations = (width < 480) ? 2.5 :
			    	(width < 900) ? 3 :
			    	(width < 1600) ? 3.5 : 4 ;

	    this.simulation = d3.forceSimulation(self.nodes)
	        .velocityDecay(velocityDecay)
	        .force("x", d3.forceX().strength(strength))
	        .force("y", d3.forceY().strength(strength))
	        .force("collide", d3.forceCollide().radius(function(d) { return d.r; }).iterations(iterations))
	        .on("tick", self.ticked)

	    //this.propagate()

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

			console.log("Spread the virus")

			this.next()

		}

    }

    getRadius() {

    	var width = document.documentElement.clientWidth

    	var radius = (width < 480) ? 2 :
			    	(width < 900) ? 3 :
			    	(width < 1300) ? 4 : 5 ;

    	console.log(`Width: ${width}, rad: ${radius}`)

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

      	var vulnerable = self.nodes.filter(item => !item.exposed && item.susceptible)

      	++self.settings.steps.current

      	self.settings.steps.term = self.settings.steps.term * self.settings.r0

      	var tree = new kdTree(vulnerable, self.distance, ["x", "y"]);
       
      	var nearest = tree.nearest(self.settings.current, self.settings.steps.term);

		for (var i = 0; i < nearest.length; i++) {

			if (self.settings.infected < self.settings.population * self.settings.susceptible) {

				nearest[i][0].status = 'infected'

				nearest[i][0].exposed = true

				++self.settings.infected
			}

		}

		//this.templatize()

      	this.simulation.restart()

      	this.next()

    }

    templatize() {

    	/*

    	var self = this

	    r0.innerHTML = `${self.settings.r0}, R<sub>e</sub>: ${self.settings.re}`

	    var r1 = document.getElementById("r1"); 

	    r1.innerHTML = `${self.settings.fatality_rate}%`

	    var r2 = document.getElementById("r2"); 

	    r2.innerHTML = `${parseInt(self.settings.susceptible * 100)}% of population`

		var target = document.getElementById("info"); 

		var html = mustache(info, { population : self.settings.population, r0 : self.settings.r0, re : self.settings.re, susceptible: self.settings.susceptible * 100, infected : Math.floor(self.settings.infected), fatalities : self.settings.deaths  })

		target.innerHTML = html

		*/

    }

    finale() {

    	var self = this

		self.settings.deaths = Math.floor( ( self.settings.population / 100 *  self.settings.susceptible) * self.settings.fatality_rate ) 

		var deathlist = self.nodes.filter(item => item.status != "healthy")

		var departed = deathlist.splice(0, self.settings.deaths)

		for (var i = 0; i < self.settings.deaths; i++) {

			departed[i].status = "dead"

		}

		//this.templatize()

    }

    next() {

    	var self = this

    	var exposed = self.nodes.filter(item => item.exposed)

		if (exposed.length < self.settings.population * self.settings.susceptible) {

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

      return (status==="dead") ? "black" : (status==="infected") ? "red" : "yellow"
      
    }

    getBaseLog(r, total) {

      return Math.log(total) / Math.log(r);

    }

}