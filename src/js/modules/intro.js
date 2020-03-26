import * as d3 from 'd3'
import Recur from '../modules/recur'
import screensizer from "../modules/screensizer"; 
import Radial from '../modules/intradial'

export var intro = {

  width: null,

  height: null,

  unit: screensizer(),

  initialize: function() {

    intro.width = document.documentElement.clientWidth

    intro.height = document.documentElement.clientHeight

    intro.expo()

  },

  resize: function() {

    intro.generate();

  },

  expo: function() {

    intro.microbiology = [{

      "r0" : 5.2

    },{

      "r0" : 2.5

    },{

      "r0" : 3

    },{

      "r0" : 4.5

    },{

      "r0" : 15

    },{

      "r0" : 13

    },{

      "r0" : 6.7

    },{

      "r0" : 7

    }]

    intro.microbiology.forEach((virus, index) => {

      virus.x = Math.floor(Math.random() * intro.width) + 1
      virus.y = Math.floor(Math.random() * intro.height) + 1  
      virus.unit = Math.floor(Math.random() * intro.unit / 5) + 100 
      virus.json = new Recur(virus.r0, `virus-${index}`, 2).json()

    });

    intro.generate()

  },

  generate: function(node) {

    var tally = 0

    var svg = d3.select("#intro_header").append("svg")
        .attr("width", intro.width)
        .attr("height", intro.height)
        .attr("id", "saulbass")

    intro.microbiology.forEach((microbe, index) => {

      setTimeout(() => {

        var radial  = new Radial(microbe.json, svg, index, microbe.x, microbe.y, microbe.unit)

        radial.create()

      }, index * 2500);

    });

  }

}