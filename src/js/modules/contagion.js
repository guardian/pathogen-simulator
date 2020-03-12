import shuffle from "../modules/shuffle"
import mustache from "../modules/mustache"
import * as d3 from "d3"
import { kdTree } from "kd-tree-javascript"
import noUiSlider from 'nouislider'
import info from '../../templates/results.html'

export class Contagion {

    constructor(settings, id, sliders, cases) {

    	var self = this

    	this.settings = settings

    	this.sliders = sliders

    	this.cases = cases

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

		document.querySelectorAll('.filter_slider').forEach(function(slider, index) {

			noUiSlider.create(slider, self.sliders[index].params);

	        slider.noUiSlider.on('slide', (values) => self.handle(index, values));

	        slider.noUiSlider.on('end', () => self.trigger());

		});

		document.querySelectorAll('.case').forEach(function(cases) {

			var info = cases.getAttribute('data-id');

			cases.addEventListener('click',() => self.loadCase(info));

		});

		var info = document.querySelector('#close')

		info.addEventListener('click',() => {

			document.querySelectorAll('.boom').forEach(function(element) {

				element.classList.toggle("hide");

				self.trigger()

			});

		});

		this.resizer()

    }

    loadCase(id) {

    	var self = this

    	var cases = self.cases[id]

		self.settings.r0 = cases.r0

		var r0slider = document.querySelectorAll('.filter_slider')[0]

		r0slider.noUiSlider.set([cases.r0 * 10])

		self.settings.fatality_rate = cases.fatality_rate

		var fatality_rateslider = document.querySelectorAll('.filter_slider')[1]

		fatality_rateslider.noUiSlider.set([cases.fatality_rate])

		self.settings.susceptible = cases.susceptible

		var susceptibleslider = document.querySelectorAll('.filter_slider')[2]

		susceptibleslider.noUiSlider.set([...cases.score])

		self.settings.population = cases.population

		var populationslider = document.querySelectorAll('.filter_slider')[3]

		populationslider.noUiSlider.set([cases.population])

		this.trigger()

    }

    handle(id, values) {

    	var self = this

		switch(id) {
		  case 0:
		   self.settings.r0 = parseInt(values[0]) / 10
		    break;
		  case 1:
		    self.settings.fatality_rate = parseInt(values[0])
		    break;
		  case 2:
            self.settings.susceptible = ( parseInt(values[1]) - parseInt(values[0]) ) / 100
		    break;
		  case 3:
		    self.settings.population = parseInt(values[0])
		    break;
		  default:
		}

		self.templatize()

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
	        .force("x", d3.forceX().strength(0.02))
	        .force("y", d3.forceY().strength(0.02))
	        .force("collide", d3.forceCollide().radius(function(d) { return d.r; }).iterations(2))
	        .on("tick", self.ticked)

		self.settings.steps.total = Math.ceil(self.getBaseLog(self.settings.r0, self.settings.population * self.settings.susceptible))

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

    getRadius(pop) {

    	var radius = (pop > 3000) ? 4 :
    		(pop > 2000) ? 5 :
    		(pop > 1000) ? 6 : 7 ;

    		return (this.width < 480) ? radius / 1.5 : radius ;

    }

    getNodes() {

    	var self = this

	    var nodes = d3.range(self.settings.population).map(function(i) {
	      return {
	        r: self.getRadius(self.settings.population),
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

		this.templatize()

      	this.simulation.restart()

      	this.next()

    }

    templatize() {

    	var self = this

	    r0.innerHTML = self.settings.r0

	    var r1 = document.getElementById("r1"); 

	    r1.innerHTML = `${self.settings.fatality_rate}%`

	    var r2 = document.getElementById("r2"); 

	    r2.innerHTML = `${parseInt(self.settings.susceptible * 100)}% of population`

	    var r3 = document.getElementById("r3"); 

	    r3.innerHTML = self.settings.population

	    var target = document.getElementById("info"); 

	    var html = mustache(info, { population : self.settings.population, r0 : self.settings.r0, susceptible: self.settings.susceptible * 100, infected : Math.floor(self.settings.infected), fatalities : self.settings.deaths  })

	    target.innerHTML = html

    }

    finale() {

    	var self = this

		self.settings.deaths = Math.floor( ( self.settings.population / 100 *  self.settings.susceptible) * self.settings.fatality_rate ) 

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

    	//console.log(exposed.length)

    	console.log(`Infected: ${exposed.length}, Ceiling: ${self.settings.population * self.settings.susceptible}, Population: ${self.settings.population}`)

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