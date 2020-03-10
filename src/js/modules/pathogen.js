import shuffle from "../modules/shuffle"
import * as d3 from "d3"
import { kdTree } from "kd-tree-javascript"
import ScrollyTeller from "../modules/scrollyteller"

export default {

	init: (config) => {

		var settings = config.settings

		var contagion = config.settings.pathogen

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-2"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
		});

		var canvas = document.createElement('canvas');

        var div = document.getElementById("pathogen-simulator");

	    var width = div.clientWidth || div.getBoundingClientRect().width

	    var height = div.clientHeight || div.getBoundingClientRect().height

	    var context = canvas.getContext("2d")

	    canvas.width =  width
	       
	    canvas.height = height

	    var tau = 2 * Math.PI;

	    div.appendChild(canvas)

	    var distance = (a, b) => Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);

	    var nodes = d3.range(contagion.population).map(function(i) {
	      return {
	        r: Math.random() * 14 + 4,
	        status: "healthy",
	        exposed: false
	      };
	    });

	    for (var i = 0; i < nodes.length; i++) {

	    	nodes[i].toInfect = (i < contagion.population * contagion.initAttackRate) ? true : false ;

	    	nodes[i].susceptible = (i < contagion.population * contagion.initSusceptibleProportion) ? true : false ;

	    }

	    nodes = shuffle(nodes)

	    var simulation = d3.forceSimulation(nodes)
	        .velocityDecay(0.2)
	        .force("x", d3.forceX().strength(0.002))
	        .force("y", d3.forceY().strength(0.002))
	        .force("collide", d3.forceCollide().radius(function(d) { return d.r + 0.5; }).iterations(2))
	        .on("tick", ticked)

	    function ticked() {

			context.clearRect(0, 0, width, height);
			context.save();
			context.translate(width / 2, height / 2);

			nodes.forEach(function(d) {
				context.beginPath();
				context.moveTo(d.x + d.r, d.y);
				context.arc(d.x, d.y, d.r, 0, tau);
				context.strokeStyle = "#333";
				context.fillStyle = getStatus(d.status)
				context.fill();
				context.stroke();
			});

			context.restore();
	    }

	    function calculate() {

	      	simulation.stop()

	      	var vulnerable = nodes.filter(item => !item.exposed && item.toInfect)

			// console.log(vulnerable.length)

	      	++contagion.steps.current

	      	contagion.steps.term = contagion.steps.term * contagion.r0

	      	contagion.infected = contagion.infected +  contagion.steps.term

	      	var tree = new kdTree(vulnerable, distance, ["x", "y"]);
	       
	      	var nearest = tree.nearest(contagion.current, contagion.steps.term);

			for (var i = 0; i < nearest.length; i++) {

				nearest[i][0].status = 'infected'

				nearest[i][0].exposed = true

			}

	      	simulation.restart()

	      	next()

	    }

	    function getStatus(status) {

	      return (status==="dead") ? "black" : (status==="infected") ? "red" : "yellow"
	      
	    }

	    function getBaseLog(r, total) {

	      return Math.log(total) / Math.log(r);

	    }

	    function finale() {

	      var fatalities = Math.floor(contagion.population / 100 * contagion.fatality_rate)

	      var deathlist = nodes.filter(item => item.toInfect)

	      var departed = deathlist.splice(0, fatalities)

	      for (var i = 0; i < departed.length; i++) {

	        departed[i].status = "dead"

	      }

	    }

	    function next() {

	      if (contagion.steps.current < contagion.steps.total) {

	        setTimeout(function(){ calculate(); }, 500);

	      } else {

	        console.log("The end")

	        finale()

	      }

	    }

	    function init() {

			contagion.steps.total = Math.floor(getBaseLog(contagion.r0, contagion.population))

			contagion.steps.term = 1

			contagion.infected = 1

			var origin = Math.floor(Math.random() * contagion.population) + 1  

			nodes[origin].status = "infected"

			nodes[origin].exposed = true

			contagion.current = nodes[origin]

			next()

	    }

	    init()

	    scrolly.watchScroll();

	}

};