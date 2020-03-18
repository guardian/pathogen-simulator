import * as d3 from 'd3'
import Recur from '../modules/recur'
import screensizer from "../modules/screensizer"; 

export var intro = {

  width: null,

  height: null,

  force: null,

  stopped: false,

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

    var microbiology = [{

      "disease" : "Influenza (bird flu)",

      "r0" : 5.2,

      "fatality" : 60

    },{

      "disease" : "Influenza (seasonal flu)",

      "r0" : 2.5,

      "fatality" : 0.1

    },{

      "disease" : "Influenza (Spanish flu)",

      "r0" : 3,

      "fatality" : 2.5

    },{

      "disease" : "Influenza (swine flu)",

      "r0" : 4.5,

      "fatality" : 0.2

    },{

      "disease" : "Measles",

      "r0" : 15,

      "fatality" : 0.3

    },{

      "disease" : "Mumps",

      "r0" : 13,

      "fatality" : 1

    },{

      "disease" : "SARS",

      "r0" : 6.7,

      "fatality" : 9.6

    },{

      "disease" : "Smallpox",

      "r0" : 7,

      "fatality" : 15

    }]


    var velocity = 2

    microbiology.forEach((virus, index) => {

      var unit = Math.floor(Math.random() * intro.unit / 5) + 100 

      virus.x = Math.floor(Math.random() * intro.width) + 1
      virus.y = Math.floor(Math.random() * intro.height) + 1  
      virus.vx = velocity * Math.cos(Math.random() * 360 * Math.PI / 180)
      virus.vy = velocity * Math.sin(Math.random() * 360 * Math.PI / 180)
      virus.radius = unit
      virus.width = unit
      virus.height = unit
      virus.json = new Recur(virus.r0, virus.disease, 2).json()

    });

    intro.generate(microbiology)


  },

  generate: function(node) {

    var tally = 0

    var svg = d3.select("#intro_header").append("svg")
        .attr("width", intro.width)
        .attr("height", intro.height)
        .attr("id", "saulbass")

    svg.selectAll(".circle_reel")
        .data(node)
        .enter()      
        .append("g")
          .attr("class", "circle_reel")
          .attr('transform', function (d) { return 'translate(' + (d.x) + ',' + (d.y) + ') rotate(' +  tally +')'})
          .attr("opacity", "0.7")

    d3.selectAll(".circle_reel").each(function(d, i) {

        var reel = d3.select(this)

        var inner = reel.append("g")
        .append("circle")
        .attr("cx", node[i].width / 2)
        .attr("cy", node[i].width / 2)
        .attr("r", node[i].radius)
        .attr("stroke", "white")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .style("stroke-dasharray", ("3, 3"))


        var tree = d3.tree()
          .size([2 * Math.PI, node[i].radius])
          .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

        var shiz = d3.hierarchy(node[i].json).sort((a, b) => d3.ascending(a.data.name, b.data.name))

        var root = tree(shiz);

        var links = root.links()

        reel.append("g")
        .attr("transform", "translate(" + (node[i].width / 2) + "," + (node[i].height / 2) + ")")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
          .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y));

        reel.append("g")
        .attr("transform", "translate(" + (node[i].width / 2) + "," + (node[i].height / 2) + ")")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("class", "contagionister")
        .style("display", "none")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .attr("fill", d => d.children ? "white" : "white")
        .attr("r", 5);

        reel.append("g")
        .attr("transform", "translate(" + (node[i].width / 2) + "," + (node[i].height / 2) + ")")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)

    })

    var boxForce = boundedBox()
        .bounds([[0, 0], [intro.width, intro.height]])
        .size(function (d) { 
          return [d.width / 2, d.height / 2] 
        })

    const forceX = d3.forceX(intro.width / 2).strength(0.000015)
    const forceY = d3.forceY(intro.height).strength(0.00005)

    intro.force = d3.forceSimulation()
        .velocityDecay(0.00005)
        .alphaTarget(1)
        .on('tick', ticked)
        .force('box', boxForce)
        .force("collide", d3.forceCollide().radius(function(d) { return d.radius + 0.5 }).iterations(2))
        .force('x', forceX)
        .force('y',  forceY)
        .nodes(node)

    function boundedBox() {
        var nodes
        var bounds
        var size
        var sizes

        function force() {
            var node
            var size
            var i = -1
            while (++i < nodes.length) {
                node = nodes[i]
                size = sizes[i]
                if (node.x + node.vx < bounds[0][0] || node.x + node.vx + size[0] > bounds[1][0]) {
                    node.x += node.vx
                    node.vx = -node.vx
                }
                if (node.y + node.vy < bounds[0][1] || node.y + node.vy + size[1] > bounds[1][1]) {
                    node.y += node.vy
                    node.vy = -node.vy
                }
            }
        }

        force.initialize = function (_) {
            sizes = (nodes = _).map(size)
        }

        force.bounds = function (_) {
            return (arguments.length ? (bounds = _, force) : bounds)
        }

        force.size = function (_) {
            return (arguments.length
                 ? (size = typeof _ === 'function' ? _ : constant(_), force)
                 : size)
        }

        return force
    }

    setTimeout(function(){ intro.force.stop(); }, 3000);

    function ticked() {

      d3.selectAll(".circle_reel")
          .attr('transform', function (d, i) { 
            var current = (i==1) ? -tally : tally
            return 'translate(' + (d.x) + ',' + (d.y) + ') rotate(' +  current +')'
          })

      tally = tally + 360 / 1100

    };

  }

}