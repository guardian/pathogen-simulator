import ScrollyTeller from "../modules/scrollyteller"
import * as d3 from "d3"


export default {

	init: () => {

		  var data = [
		      {"name":"Covid-19 (Diamond Princess)", "r0":2},
		      {"name":"Measles", "r0":9},
		      {"name":"SARS", "r0":2.8}
		  ]

		  function generatePartial(r0) {
		    if (r0 % 1 != 0) {
		      var base = Math.floor(r0)
		      var remainder = parseInt((r0 + "").split(".")[1])
		      var addition = 0

		      if (Math.random(0,1) <= remainder) {
		        addition = 1
		      }
		      return base + addition
		    }

		    else {
		      return r0
		    }
		  }

		  function makeNodes(r0, level) {
		    var temp = [];
		    var nodes = generatePartial(r0);

		    for (var i = 0; i < nodes; i++) { 
		        temp.push(
		          {"name": "node_" + level + "_" + i}
		        )     
		      }
		    return temp 
		  }

		  // d.childen[n].children[n2].children[n3]

		  var getDepth = function (obj) {
		        var depth = 0;
		        if (obj.children) {
		            obj.children.forEach(function (d) {
		                var tmpDepth = getDepth(d)
		                if (tmpDepth > depth) {
		                    depth = tmpDepth
		                }
		            })
		        }
		        return 1 + depth
		    }

		  var getLevel = function (obj, root) {
		        var depth = 0;
		        var found = false;

		        //console.log(obj, root)

		        function search(current) {
		          //console.log("current",current);

		          if (current === obj) {
		              //console.log("found it! ", depth);
		              found = true
		              //console.log(depth)
		              return depth
		            }

		          if (current.children) {
		            depth = 1 + depth;
		            current.forEach(function (d) {
		              if (d === obj) {
		                //console.log("found it!!!");
		                found = true
		                return depth
		              }

		                current.children.forEach(function (dd) {
		                  var blah = search(dd);
		                return blah
		              })
		            })
		          }
		          
		        }

		        var blah = search(root);
		        return blah
		        
		    } 


		  var generations = 3;  

		  var recur = function (obj, root, depth) {
		    // //console.log(getDepth(obj))
		    // var depth = 0
		    // var level = getLevel(obj, root)
		    
		    //console.log("depth", 0)
		    //console.log("obj", 0)

		      if (!obj.children && (depth <= generations)) {

		        //console.log("make children")
		        obj.children = makeNodes(root.r0, depth)
		        obj.level = depth
		        //console.log(obj.level)

		        if (!obj.name) {
		          obj.name = "gen" + depth
		        }
		        
		        if (obj.level <= generations) {
		          //console.log("recur")
		          obj.children.forEach(function (child) {
		            if (!child.children) {
		              recur(child, root, depth + 1)
		            }
		              
		            })
		        }

		      }

		      else {
		        //console.log("yehhhh")
		      }
		        
		  } 

		  recur(data[0], data[0], 0)

		  

		  var element = d3.select('.scroll-text').node();

			var width = element.getBoundingClientRect().width;

		  var height = width

		  var radius = width / 2.5

		  var counter = 0

		  var tree = d3.tree()
		      .size([2 * Math.PI, radius])
		      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

		  var shiz = d3.hierarchy(data[0])
		      .sort((a, b) => d3.ascending(a.data.name, b.data.name))

		  const root = tree(shiz);
		 
		  var temp = function() {

		    var links = root.links()

		    return links.filter( (item) => {
		      if (item.source.depth < counter) {
		        return item
		      }
		    })
		  }


		function update(){

		  svg.append("g")
		      .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		      .attr("fill", "none")
		      .attr("stroke", "#555")
		      .attr("stroke-opacity", 0.4)
		      .attr("stroke-width", 1.5)
		    .selectAll("path")
		    .data(temp)
		    .join("path")
		      .attr("d", d3.linkRadial()
		          .angle(d => d.x)
		          .radius(d => d.y));

		}


		  const svg = d3.select("#r-zero-animation").append("svg").attr("width", width).attr("height", width)

		  svg.append("g")
		      .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		      .attr("fill", "none")
		      .attr("stroke", "#555")
		      .attr("stroke-opacity", 0.4)
		      .attr("stroke-width", 1.5)
		    .selectAll("path")
		    .data(temp)
		    .join("path")
		      .attr("d", d3.linkRadial()
		          .angle(d => d.x)
		          .radius(d => d.y));


		  svg.append("g")
		    .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		    .selectAll("circle")
		    .data(root.descendants())
		    .join("circle")
		      .attr("class", "testing")
		      .style("display", "none")
		      .attr("transform", d => `
		        rotate(${d.x * 180 / Math.PI - 90})
		        translate(${d.y},0)
		      `)
		      .attr("fill", d => d.children ? "#555" : "#999")
		      .attr("r", 2.5);

		  svg.append("g")
		      .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		      .attr("font-family", "sans-serif")
		      .attr("font-size", 10)
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-width", 3)
		    .selectAll("text")
		    .data(root.descendants())
		    .join("text")
		      .attr("class", "testing")
		      .style("display", "none")
		      .attr("transform", d => `
		        rotate(${d.x * 180 / Math.PI - 90}) 
		        translate(${d.y},0) 
		        rotate(${d.x >= Math.PI ? 180 : 0})
		      `)
		      .attr("dy", "0.31em")
		      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
		      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
		      .text( (d,i) => i+1)
		    .clone(true).lower()
		      .attr("stroke", "white");

		  svg.append("g")
		    .append("circle")
		    .attr("cx", width / 2)
		    .attr("cy", width / 2)
		    .attr("r", (width / 2) / 2.5)
		      .attr("stroke", "#555")
		      .attr("stroke-opacity", 0.4)
		      .attr("stroke-width", 1.5)
		      .attr("fill", "none")
		      .style("stroke-dasharray", ("3, 3"))

		  svg.append("g")
		    .append("circle")
		    .attr("cx", width / 2)
		    .attr("cy", width / 2)
		    .attr("r", (width / 2) / 5)
		      .attr("stroke", "#555")
		      .attr("stroke-opacity", 0.4)
		      .attr("stroke-width", 1.5)
		      .attr("fill", "none")
		      .style("stroke-dasharray", ("3, 3"))

		  svg.append("g")
		    .append("circle")
		    .attr("cx", width / 2)
		    .attr("cy", width / 2)
		    .attr("r", (width / 2) / 1.67)
		      .attr("stroke", "#555")
		      .attr("stroke-opacity", 0.4)
		      .attr("stroke-width", 1.5)
		      .attr("fill", "none")
		      .style("stroke-dasharray", ("3, 3"))

		  svg.append("g")
		    .append("circle")
		    .attr("cx", width / 2)
		    .attr("cy", width / 2)
		    .attr("r", (width / 2) / 1.25)
		      .attr("stroke", "#555")
		      .attr("stroke-opacity", 0.4)
		      .attr("stroke-width", 1.5)
		      .attr("fill", "none")
		      .style("stroke-dasharray", ("3, 3"))



		function render() {

		    d3.selectAll("path").remove()

		    svg.append("g")
		        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
		        .attr("fill", "none")
		        .attr("stroke", "#555")
		        .attr("stroke-opacity", 0.4)
		        .attr("stroke-width", 1.5)
		      .selectAll("path")
		      .data(temp)
		      .join("path")
		        .attr("d", d3.linkRadial()
		            .angle(d => d.x)
		            .radius(d => d.y));

		    d3.selectAll(".testing").style("display", d => {
		      return (d.depth > counter) ? "none" : "block" ;
		    })

		    next()

		}

		function next() {

		  if (counter < 5) {
		    setTimeout(function(){ 
		      render();
		      ++counter
		    }, 1000);
		  }

		}

		render()



		const scrolly = new ScrollyTeller({
	            parent: document.querySelector("#scrolly-1"),
	            triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
	            triggerTopMobile: 0.75,
	            transparentUntilActive: true
	     });

		scrolly.watchScroll();

	}

}

