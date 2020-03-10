import * as d3 from "d3"
import { kdTree } from "kd-tree-javascript"

const attack = {

  init: (r0, fatality_rate=0) => {

    var canvas = document.querySelector("canvas");
    var width = document.documentElement.clientWidth
    var height = document.documentElement.clientHeight

    var context = canvas.getContext("2d")
        canvas.width = width
        canvas.height = height
    var tau = 2 * Math.PI;

    var contagion = {

      r0 : r0,

      fatality_rate : fatality_rate,

      population : 1000,

      infected : 0,

      steps : {

        current : 0,

        term : 1,

        total : 0

      },

      database : {

        infected : 0,

        deaths : 0,

      }

    }

    var distance = (a, b) => Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);

    var nodes = d3.range(contagion.population).map(function(i) {
      return {
        r: Math.random() * 14 + 4,
        status: "healthy",
        exposed: false
      };
    });

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

    function calculate() {

      simulation.stop()

      var vulnerable = nodes.filter(item => !item.exposed)

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
      return (status==="dead") ? "black" :
      (status==="infected") ? "red" : "yellow"
    }

    function getBaseLog(r, total) {

      return Math.log(total) / Math.log(r);

    }

    function next() {

      // console.log(contagion.infected)

      if (contagion.steps.current < contagion.steps.total) {

        setTimeout(function(){ calculate(); }, 1000);

      } else {

        console.log("The end")

        finale()

      }

    }

    function finale() {

      var fatalities = Math.floor(contagion.population / 100 * contagion.fatality_rate)

      var deathlist = nodes.filter(item => item)

      var departed = deathlist.splice(0, fatalities)

      for (var i = 0; i < departed.length; i++) {

        departed[i].status = "dead"

      }

    }


    init()


  }

}