import * as d3 from "d3"

export class Graph {

  constructor(canvas) {

  var self = this;
  this.canvas = canvas;
  this.nodes = [];
  this.links = [];
  this.radius = 20;
  this.distance = 80;

  this.simulation = d3.forceSimulation([{index: 1, level: 1}]);
  this.simulation.force("link", d3.forceLink().distance(function(d) {
    return self.distance;
  }));
  this.simulation.force("charge", d3.forceManyBody());
  this.simulation.force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2));
  this.simulation.on("tick", function() {
    self.paint();
  });

  d3.select(canvas)
    .call(d3.drag()
      .container(canvas)
      .subject(function() {
        return self.simulation.find(d3.event.x, d3.event.y, self.radius);
      })
      .on("start", function() {
        if (!d3.event.active) self.simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
      })
      .on("drag", function() {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
      })
      .on("end", function() {
        if (!d3.event.active) self.simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }));

}

setSize(width, height) {
  this.simulation.force("center", d3.forceCenter(width / 2, height / 2));
  this.simulation.alphaTarget(0).restart();
}

getNodeById(id) {
  return this.nodes.find(function(a) {
    return a.id === id;
  });
}

getLinkByIds(src, dst) {
  return this.links.find(function(a) {
    return (a.src === src && a.dst === dst) || (a.src === dst && a.dst === src);
  });
}

add(src, dst) {
  if (!this.getNodeById(src))
    this.nodes.push({
      id: src,
      x: this.canvas.width * Math.random(),
      y: this.canvas.height * Math.random()
    });
  if (!this.getNodeById(dst))
    this.nodes.push({
      id: dst,
      x: this.canvas.width * Math.random(),
      y: this.canvas.height * Math.random()
    });
  if (src !== dst && !this.getLinkByIds(src, dst))
    this.links.push({
      source: this.getNodeById(src),
      target: this.getNodeById(dst)
    });

  this.simulation.nodes(this.nodes);
  this.simulation.force("link").links(this.links);
  this.simulation.alphaTarget(0.3).restart();

  return this;
}

paint() {

  var c = this.canvas.getContext("2d");
  var r = this.radius;

  c.clearRect(0, 0, this.canvas.width, this.canvas.height);
  c.save();

  this.links.forEach(function(d) {
    c.strokeStyle = "#000000";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(d.source.x, d.source.y);
    c.lineTo(d.target.x, d.target.y);
    c.stroke();
  });

  this.nodes.forEach(function(d) {
    // circle
    c.fillStyle = "#ffffff";
    c.strokeStyle = "#000000";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(d.x + r, d.y);
    c.arc(d.x, d.y, r, 0, 2 * Math.PI);
    c.fill();
    c.stroke();
    // text
    c.fillStyle = "#000";
    c.font = "24px sans-serif";
    //c.fillText(d.id, d.x - r / 2, d.y + r / 2);
  });

  c.restore();
  }
}
