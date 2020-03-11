import shuffle from "../modules/shuffle"
import mustache from "../modules/mustache"
import * as d3 from "d3"
import { kdTree } from "kd-tree-javascript"
import noUiSlider from 'nouislider'
import info from '../../templates/results.html'

export class Contagion {

    constructor(settings, id) {

    	var self = this

    	this.settings = settings

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

	    this.distance = (a, b) => Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);

	    this.compile()

    }

    compile() {

        var self = this

        var r0_slider = document.getElementsByClassName('filter_slider')[0];

		noUiSlider.create(r0_slider, {
		    start: [self.settings.r0 * 10],
		    range: {
		        'min': [0],
		        'max': [200]
		    }
		});

        r0_slider.noUiSlider.on('slide', function( values, handle, unencoded, tap, positions ) {

            self.settings.r0 = parseInt(values[0]) / 10

            self.templatize()

        });

        r0_slider.noUiSlider.on('end', function( values, handle, unencoded, tap, positions ) {

        	self.trigger()

        });

        var immunity_slider = document.getElementsByClassName('filter_slider')[1];

			noUiSlider.create(immunity_slider, {
			    start: [15, 85],
			    connect: true,
			    range: {
			        'min': 0,
			        'max': 100
			    }
			});

        immunity_slider.noUiSlider.on('slide', function( values, handle, unencoded, tap, positions ) {

        	var diff = ( parseInt(values[1]) - parseInt(values[0]) ) / 100

            self.settings.susceptible = diff

            self.templatize()

        });

        immunity_slider.noUiSlider.on('end', function( values, handle, unencoded, tap, positions ) {

        	self.trigger()

        });

        this.init()

    }

    trigger() {

    	var self = this

    	this.nodes = this.getNodes()

    	if (this.simulation!=null) {

    		this.simulation.stop()

    	}

    	this.init() 

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

	    this.simulation = d3.forceSimulation(self.nodes)
	        .velocityDecay(0.2)
	        .force("x", d3.forceX().strength(0.002))
	        .force("y", d3.forceY().strength(0.002))
	        .force("collide", d3.forceCollide().radius(function(d) { return d.r + 0.5; }).iterations(2))
	        .on("tick", self.ticked)

		self.settings.steps.total = Math.ceil(self.getBaseLog(self.settings.r0, self.settings.population * self.settings.susceptible))

		console.log(`Total number of steps: ${self.settings.steps.total}`)

		self.settings.deaths = 0

		self.settings.steps.current = 0

		self.settings.steps.term = 1

		self.settings.infected = 1

		var origin = Math.floor(Math.random() * self.settings.population) + 1  

		self.nodes[origin].status = "infected"

		self.nodes[origin].exposed = true

		self.settings.current = self.nodes[origin]

		this.next()

    }

    getNodes() {

    	var self = this

	    var nodes = d3.range(self.settings.population).map(function(i) {
	      return {
	        r: 7,
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

      	console.log(`Current steps: ${self.settings.steps.current}`)

      	self.settings.steps.term = self.settings.steps.term * self.settings.r0

      	var tree = new kdTree(vulnerable, self.distance, ["x", "y"]);
       
      	var nearest = tree.nearest(self.settings.current, self.settings.steps.term);

		for (var i = 0; i < nearest.length; i++) {

			nearest[i][0].status = 'infected'

			nearest[i][0].exposed = true

		}

		var infected = self.nodes.filter(item => item.status === 'infected')

		self.settings.infected = infected.length

		this.templatize()

      	this.simulation.restart()

      	this.next()

    }

    templatize() {

    	var self = this

	    var target = document.getElementById("info"); 

	    var html = mustache(info, { population : 1000, r0 : self.settings.r0, susceptible: self.settings.susceptible * 100, infected : Math.floor(self.settings.infected), fatalities : self.settings.deaths  })

	    target.innerHTML = html

    }

    finale() {

    	var self = this

		self.settings.deaths = Math.floor(self.settings.population / 100 * self.settings.fatality_rate)

		var deathlist = self.nodes.filter(item => item.status === "infected")

		var departed = deathlist.splice(0, self.settings.deaths)

		for (var i = 0; i < self.settings.deaths; i++) {

			departed[i].status = "dead"

		}

		this.templatize()

    }

    next() {

    	var self = this

    	var exposed = self.nodes.filter(item => item.exposed)

    	console.log(exposed.length)

		if (self.settings.steps.current < self.settings.steps.total) {

			setTimeout(function(){ self.calculate(); }, 1000);

		} else {

			self.finale()

		}

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