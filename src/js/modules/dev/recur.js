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