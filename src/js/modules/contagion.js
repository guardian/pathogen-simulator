import shuffle from "../modules/shuffle"
import mustache from "../modules/mustache"
import cumulative from "../modules/cumulative"
import * as d3 from "d3"
import { kdTree } from "kd-tree-javascript"
import noUiSlider from 'nouislider'
import info from '../../templates/results.html'

export class Contagion {

    constructor(settings, id, sliders, cases) {

    	var self = this

    	this.settings = settings

    	this.settings.re = (this.settings.r0 * this.settings.susceptible).toFixed(2);

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

	    this.novel = false

	    this.steps = []

	    this.timeout = null

	    this.distance = (a, b) => Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);

	    this.compile()

    }

    compile() {

        var self = this

		document.querySelectorAll('.filter_slider').forEach(function(slider, index) {

			noUiSlider.create(slider, self.sliders[index].params);

	        slider.noUiSlider.on('slide', (values) => self.handle(index, values));

	        slider.noUiSlider.on('change', () => self.trigger());

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

		susceptibleslider.noUiSlider.set([cases.susceptible * 100])

		this.trigger()

    }

    handle(id, values) {

    	var self = this

		switch(id) {
		  case 0:
		   self.settings.r0 = (values[0] / 10).toFixed(1);
		    break;
		  case 1:
		    self.settings.fatality_rate = parseInt(values[0])
		    break;
		  case 2:
           	self.settings.susceptible = parseInt(values[0]) / 100
		    break;
		  case 3:
		    self.settings.population = parseInt(values[0])
		    break;
		  default:
		}

		if (this.timeout!=null) {

			this.timeout=null

		}

    	if (this.simulation!=null) {

    		this.simulation.stop()

    	}

		self.templatize(false)

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

			node.status = "healthy"

			node.exposed = false 

			node.susceptible = (index < self.settings.population * self.settings.susceptible) ? true : false ;

		});

		var atomized = await shuffle(nodes)

		return atomized

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


    	var nodes = self.nodes

    	this.updateNodes(nodes).then( data => {

    		self.nodes = data

    		self.simulation.on("tick", self.ticked)

    	})

    	var r0 = document.getElementById("r0"); 

	    r0.innerHTML = `${self.settings.r0}, R<sub>e</sub>: ${self.settings.re}`

	    var r1 = document.getElementById("r1"); 

	    r1.innerHTML = `${self.settings.fatality_rate}%`

	    var r2 = document.getElementById("r2"); 

	    r2.innerHTML = `${parseInt(self.settings.susceptible * 100)}% of population`

    }

    propagate() {

		var self = this

		this.settings.steps.precise = self.getBaseLog(self.settings.r0, self.settings.population * self.settings.susceptible)

		this.settings.steps.total = Math.ceil(self.getBaseLog(self.settings.r0, self.settings.population * self.settings.susceptible))

		this.settings.deaths = 0

		this.settings.steps.current = 0

		this.settings.steps.term = 1

		this.settings.infected = 1

		this.settings.cumulative = cumulative(self.settings.r0, self.settings.population * self.settings.susceptible, self.settings.steps.total)

		var origin = Math.floor(Math.random() * self.settings.population) + 1  

		this.nodes[origin].status = "infected"

		this.nodes[origin].exposed = true

		this.settings.current = self.nodes[origin]

		this.next()


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

	    return nodes

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

    templatize(chart=true) {

    	var self = this

    	this.settings.re = (this.settings.r0 * this.settings.susceptible).toFixed(2);

    	var r0 = document.getElementById("r0"); 

	    r0.innerHTML = `${self.settings.r0}, R<sub>e</sub>: ${self.settings.re}`

	    var r1 = document.getElementById("r1"); 

	    r1.innerHTML = `${self.settings.fatality_rate}%`

	    var r2 = document.getElementById("r2"); 

	    r2.innerHTML = `${parseInt(self.settings.susceptible * 100)}% of population`

		var target = document.getElementById("info"); 

		var html = mustache(info, { population : self.settings.population, r0 : self.settings.r0, re : self.settings.re, susceptible: self.settings.susceptible * 100, infected : Math.floor(self.settings.infected), fatalities : self.settings.deaths, cumulative :self.settings.cumulative.precise.toFixed(2), totality : self.settings.population * self.settings.susceptible  })

		target.innerHTML = html

		if (chart) {

			this.chart()

		}

    }

    chart() {

    	var self = this

		var margin = {top: 5, right: 5, bottom: 35, left: 5}
		  , width = 150 - margin.left - margin.right // Use the window's width 
		  , height = 125 - margin.top - margin.bottom; // Use the window's height

		var xScale = d3.scaleLinear()
		    .domain([0, self.settings.cumulative.total]) //console.log(self.settings.cumulative)
		    .range([0, width]);

		var interesectionX = xScale(self.settings.cumulative.precise)

		var current = xScale(self.settings.steps.current)

		var yScale = d3.scaleLinear()
		    .domain([0, self.settings.population * self.settings.susceptible])
		    .range([height, 0]);

		var interesectionY = yScale(self.settings.population * self.settings.susceptible)

		var line = d3.line()
		    .x(function(d, i) { return xScale(i); })
		    .y(function(d) { return yScale(d.y); })
		    .curve(d3.curveMonotoneX)

		var svg = d3.select("#mini").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale).ticks(self.settings.cumulative.total))


		svg.append("line")
			.attr("x1", interesectionX)
			.attr("y1", 0)
			.attr("x2", interesectionX)
			.attr("y2", height)
			.attr("stroke-width", 1)
			.attr("stroke", "lightgrey")
			.attr("stroke-dasharray", "2 2")

		svg.append("line")
			.attr("x1", 0)
			.attr("y1", interesectionY)
			.attr("x2", width)
			.attr("y2", interesectionY)
			.attr("stroke-width", 1)
			.attr("stroke", "lightgrey")
			.attr("stroke-dasharray", "2 2")


		svg.append("line")
			.attr("x1", current)
			.attr("y1", 0)
			.attr("x2", current)
			.attr("y2", height)
			.attr("stroke-width", 1)
			.attr("stroke", "red")
			.attr("stroke-dasharray", "2 2")


		  svg.append("line")
		      .attr("x1", 0)
		      .attr("y1", 0)
		      .attr("x2", 0)
		      .attr("y2", height)
		      .attr("stroke-width", 1)
		      .attr("stroke", "black");

 
			svg.append("path")
			    .datum(self.settings.cumulative.data)
			    .attr("class", "line")
			    .attr("d", line);

			svg.append("text")   
				.attr("class", "phase")          
				.attr("transform",
				    "translate(" + (width/2) + " ," + 
				                   (height + margin.top + 25) + ")")
				.style("text-anchor", "middle")
				.text("Phases");


    }

    finale() {

    	var self = this

		self.settings.deaths = Math.floor( ( self.settings.population / 100 *  self.settings.susceptible) * self.settings.fatality_rate ) 

		var deathlist = self.nodes.filter(item => item.status != "healthy")

		var departed = deathlist.splice(0, self.settings.deaths)

		for (var i = 0; i < self.settings.deaths; i++) {

			departed[i].status = "dead"

		}

		this.templatize()

    }

    next() {

    	var self = this

    	var exposed = self.nodes.filter(item => item.status === "infected" || item.status === "dead")

    	// console.log(`Infected: ${exposed.length}, Risk: ${self.settings.population * self.settings.susceptible}`)

		if (exposed.length < (self.settings.population * self.settings.susceptible)) {

			self.timeout = setTimeout(function(){ self.calculate(); }, 1000);

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