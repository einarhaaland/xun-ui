const DATA = { 
    "nodes": [
        {
            "ID": 0,
            "name": "Sima Parameter",
            "arguments": [
                "Mean Windspeed",
                "Current"
            ],
            "position": { x: 300, y: 75}
        },
        {
            "ID": 1,
            "name": "Mean Windspeed",
            "arguments": [],
            "position": { x: 0, y: 0}
        },
        {
            "ID": 2,
            "name": "Mean Windspeed",
            "arguments": [],
            "position": { x: 0, y: 150}
        }
    ],
    "links": [
        {
            "source": 1, 
            "destination": {
                "node": 0,
                "argument": 0,
            }
        },
        {
            "source": 2, 
            "destination": {
                "node": 0,
                "argument": 1,
            }
        }
    ]
}


function dragstarted(event) {
}

function dragged(event) {
    event.subject.position.x += event.dx;
    event.subject.position.y += event.dy;
    d3.select(this).raise().attr('transform', (d) => 'translate(' + (event.subject.position.x) + ',' + (event.subject.position.y) + ')');
}

function dragended(event) {
}

const drag = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);


const container = d3.select('svg')
    .classed('container', true);

const g = container.append('g');

const nodes = g
    .selectAll('g')
    .data(DATA.nodes)
    .enter()
    .append('g')
    .attr('transform', (d) => 'translate(' + d.position.x + ',' + d.position.y + ')')
    .attr('width', '200px')
    .attr('height', '100px')
    .call(drag);

const nodeShapes = nodes
    .append('rect')
    .classed('node', true)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr('width', '200px')
    .attr('height', '100px');

const nodeNames = nodes
    .append('text')
    .classed('nodeName', true)
    .text(data => (data.name))
    .attr('x', '50%');

const arguments = nodes
    .selectAll('.argument')
    .data((d) => d.arguments)
    .enter()
    .append('text')
    .classed('argument', true)
    .text((data) => data)
    .attr('x', 20)
    .attr('y', (d, i) => i*30 + 50);

const links = g
    .selectAll("link")
    .data(DATA.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", d => DATA.nodes[d.source].position.x)
    .attr("y1", d => DATA.nodes[d.source].position.y)
    .attr("x2", d => DATA.nodes[d.destination.node].position.x)
    .attr("y2", d => DATA.nodes[d.destination.node].position.y)
    .attr("fill", "none")
    .attr("stroke", "white");
