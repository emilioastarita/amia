/// <reference path='typings/jquery.d.ts' />
/// <reference path='typings/d3.d.ts' />

declare var AMIA: any;

module AmiaGraph {
  interface Edge extends D3.Layout.GraphLinkForce {
    id: number;
    name: string;
    description: string;
    node_from: number;
    node_to: number;
  }
  interface Node extends D3.Layout.GraphNodeForce {
    id: number;
    name: string;
    photo: string;
    x: number;
    y: number;
    radius: number;
    description: string;
    width: number;
    height: number;
  }


  var isDragging = false;
  var nodes: { [index: number]: Node; };
  var edges: { [index: number]: Edge; };
  var edgesG: D3.Selection;
  var nodesG: D3.Selection;
  var edge: D3.UpdateSelection;
  var node: D3.UpdateSelection;

  var selector: string = '#graph';

  var width: number;
  var height: number;
  var defaultWidth = 30;


  var curEdgesData: Edge[];
  var curNodesData: Node[];
  var linkedByIndex: { [index: number]: string; };



  var force: D3.Layout.ForceLayout;


  var network: any;
  var $node: JQuery;
  var $edge: JQuery;
  var $what: JQuery;

  var drag;

  function init() {
    width = $(selector).width();
    height = $(selector).height();
    curEdgesData = [];
    curNodesData = [];
    linkedByIndex = {};
    force = d3.layout.force();

    $node = $('#nodeInfoTpl');
    $edge = $('#edgeInfoTpl');
    $('.js-start').on('click', e => {
      e.preventDefault();
      $('#loading').addClass('remove');
    });
    $('body').on('click', '.popupGraph .close',hidePopup);
    $('#whatis').on('click', _ => {
      hidePopup();
      openPopup($('#what'));
    });

  }

  function showNodeInfo(nodeId) {
    hidePopup();
    var node = nodes[nodeId];
    var $nodeClone = $node.clone();
    $nodeClone.attr('id', '');
    $nodeClone.addClass('js-remove-after');
    $nodeClone.appendTo('body');
    $nodeClone.find('h1').html(node.name);
    $nodeClone.find('.image img').attr('src', img(node));
    $nodeClone.find('.description').html(node.description);
    openPopup($nodeClone);
  }

  function openPopup($e: JQuery) {
    setTimeout(_ => {
      $e.addClass('active');
      $e.css('max-height', $(selector).height() - 125);
    }, 0)
  }

  function hidePopup() {
    $('.popupGraph').removeClass('active');
    var $e = $('.popupGraph.js-remove-after');
    if ($e.length) {
      setTimeout(_ => { $e.remove(); }, 2000);
    }
  }

  function showEdgeInfo(edgeId) {
    hidePopup();
    var edge = edges[edgeId];
    var from = nodes[edge.node_from];
    var to = nodes[edge.node_to];
    var $edgeClone = $edge.clone();
    $edgeClone.addClass('js-remove-after');
    $edgeClone.find('.title').html(edge.name);
    $edgeClone.find('.node_from').html(from.name);
    $edgeClone.find('.node_to').html(to.name);
    $edgeClone.find('.description').html(edge.description);
    $edgeClone.appendTo('body');
    openPopup($edgeClone);
  }

  function img(node): string {
    return '/' + AMIA.options['dir-uploads'] + '/' + node.photo;
  }

  function start(): void {
    $.ajax('json-data', { dataType: 'json' }).done(data => {
      nodes = data.nodes;
      edges = data.edges;
      startWidthData();
    });
  }

  function setupData(): void {
    var maxRadius = 50;
    var minRadius = 10;
    var maxRelationsNode = 0;
    var relationsByNode : any = {};
    Object.keys(nodes).forEach((i, num) => {
      var n = nodes[i];
      n.x = n.y = Math.floor(Math.random() * width);
      n.y = Math.floor(Math.random() * height);
      n.width = n.height = 50;
      n.value = n.radius = n.width / 2 ;
      relationsByNode[i] = 1;
    });

    Object.keys(edges).forEach(i => {
      var l = edges[i];
      l.source = nodes[l.node_from];
      l.target = nodes[l.node_to];
      linkedByIndex[l.node_from + "," + l.node_to] = 1;
      relationsByNode[l.node_from]++;
      relationsByNode[l.node_to]++;
      if (maxRelationsNode < relationsByNode[l.node_to])
        maxRelationsNode = relationsByNode[l.node_to];
      if (maxRelationsNode < relationsByNode[l.node_from])
        maxRelationsNode = relationsByNode[l.node_from];
    });
    Object.keys(nodes).forEach((i, num) => {
      var n = nodes[i];
      var newRadius = n.radius * (relationsByNode[i]  /  maxRelationsNode);
      if (newRadius < minRadius) {
        newRadius = minRadius;
      }
      n.value = n.radius = newRadius;
      n.width = n.height = n.radius * 2;
    });

  }

  function filterNodes(nodes: { [index: number]: Node; }) {
    return d3.values(nodes);
  }

  function filterEdges(edges: { [index: number]: Edge; }, nodes?: { [index: number]: Node; }) {
    return d3.values(edges);
  }

  function isConnected(a, b): boolean {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index];
  }
  function activeNode(d) {
    node.classed("node-active", function(o) {
      var thisOpacity = isConnected(d, o) ? true : false;
      this.setAttribute('fill-opacity', thisOpacity);
      return thisOpacity;
    });

    edge.classed("edge-active", function(o) {
      return o.source === d || o.target === d ? true : false;
    });

    d3.select(this).classed("node-active", true);
    d3.select(this).select("circle").transition()
      .duration(450)
      .attr("r", d.radius * 1.1);
  }
  function deactiveNode(d) {
    node.classed("node-active", false);
    edge.classed("edge-active", false);
    d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", d.radius);
  }
  function setupNodes() {
    node = nodesG.selectAll(".node").data(curNodesData, function(d) {
      return d.id;
    });
    var g = node.enter()

      .append("g")
      .attr("class", "node").call(drag);

    g.append("circle")
      .attr("cx", d => { return d.radius; })
      .attr("cy", d => { return d.radius; })
      .attr("r", d => { return d.radius; })

    g.append('image')
      .attr("xlink:href", d => {
        return img(d);
      })
      .attr("clip-path", d => { return "url(#clipCircle-"+d.id+")"; } )
      .attr("width", d => { return d.width; })
      .attr("height", d => { return d.height; });

    g.append('text')
      .attr('y', d => { return d.height + d.radius / 2 })
      .attr('x', d => { return d.radius / 2 * -1 })
      .attr('font-size', d => { return (d.radius * 0.3) + "px" })
      .text(d => { return d.name; })

      node.on("mouseover", activeNode)
      .on("mouseout", deactiveNode)
      .on('click', function(d) {
        if (d3.event.defaultPrevented) return; //
        var self = this;
        console.log('click called')
        activeNode.call(self, d);
        if (d) {
          showNodeInfo(d.id);
        }
      })


    node.exit().remove();
  }

  function setupEdges() {
    edge = edgesG.selectAll(".edge").data(curEdgesData, function(d) {
      return d.source.id + "_" + d.target.id;
    });
    var g = edge.enter().append('g').attr('class', 'edge');
    var click = function(d) {
      console.log('click edge', d)
        if (d) {
          showEdgeInfo(d.id);
        }
    };


    g.append("line").on('click', click)
      .attr("x1", function(d) {
        return d.source.x;
      }).attr("y1", function(d) {
        return d.source.y;
      }).attr("x2", function(d) {
        return d.target.x;
      }).attr("y2", function(d) {
        return d.target.y;
      });
    g.append('text')
    .on('click', click)
    .text(d => { return d.name; })

    g.on('click', click)

    return edge.exit().remove();
  }


  function forceTick() {
    node.attr("transform", (d) => {
      return "translate(" + (d.x - d.radius) + "," + (d.y - d.radius) + ")";
    });
    edge.select('text').attr("transform", d => {
      return "translate(" + ((d.source.x + d.target.x) / 2) + "," + (d.source.y + d.target.y) / 2 + ")";
    });
    edge.select('line')
    .attr("x1", d => {
      return d.source.x;
    }).attr("y1", d => {
        return d.source.y;
      }).attr("x2", d => {
        return d.target.x;
      }).attr("y2", d => {
        return d.target.y;
      });
  }

  function createClipRadius(vis : D3.Selection) {
    var defs = vis.append('defs');
    Object.keys(nodes).forEach((i, num) => {
      var d = nodes[i];
      defs.append('clipPath')
      .attr("id", "clipCircle-"+d.id)
      .append('circle')
      .attr('r', d.radius)
      .attr('cx', d.radius )
      .attr('cy', d.radius )
    })

  }

  function setupZoom(root : D3.Selection) {
    d3.select('#graph').call(d3.behavior.zoom()
      .scaleExtent([.1, 50])
      .on("zoom", () => {
        root.attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");

      }));
  }

  function setupDragging() {

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      force.stop();
    }

    function dragged(d) {
      isDragging = true;
      d.px += d3.event.dx;
      d.py += d3.event.dy;
      d.x += d3.event.dx;
      d.y += d3.event.dy;
      forceTick();
    }

    function dragended(d) {
      d3.event.sourceEvent.stopPropagation();
      d.fixed = true;
      forceTick();
      if (isDragging) {
        force.resume();
        isDragging = false;
      }
    }
    drag = d3.behavior.drag()
      .origin((d) => { return d; })
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);
  }

  function startWidthData(): void {
    var vis = d3.select(selector).append("svg").attr("width", width).attr("height", height);
    var root = vis.append('g');
    setupData();
    setupZoom(root);
    createClipRadius(vis);

    setupDragging();
    edgesG = root.append("g").attr("id", "links");
    nodesG = root.append("g").attr("id", "nodes");
    force.size([width, height])
      .gravity(0.5)
      .charge(-3900)
      .linkDistance(defaultWidth * 2);

    curNodesData = filterNodes(nodes);
    curEdgesData = filterEdges(edges, curNodesData);
    force.nodes(curNodesData);
    setupNodes();

    force.links(curEdgesData);
    setupEdges();
    force.start();

    force.on("tick", forceTick)
  }

  $(function() {
    init();
    start();
  });
};
