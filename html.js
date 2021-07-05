const DATA = { 
    "nodes": [
        {
            "ID": 0,
            "name": "Sima Parameter",
            "arguments": [
                "Mean Windspeed",
                "Current"
            ],
            "position": { x: 500, y: 100}
        },
        {
            "ID": 1,
            "name": "Mean Windspeed",
            "arguments": [],
            "position": { x: 20, y: 20}
        },
        {
            "ID": 2,
            "name": "Current",
            "arguments": [],
            "position": { x: 20, y: 150}
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

//nodePos may be redundant (and stupid:D )because of nodeProperties
/**
 * 
 * @param {*} node int ID of node
 * @returns returns object {x: , y: } of given node
 */
function nodePos(nodeIndex) {
    return DATA.nodes[nodeIndex].position;
}


/**
 * 
 * @param {*} node int ID of node
 * @returns returns object {width: , height: , x: , y: , top: , bottom: , left: , right: }
 */
function nodeProperties(nodeIndex) {
    return (d3.selectAll('.node')
        .filter(d => d.ID === nodeIndex)
        .node()
        .getBoundingClientRect())
}


/**
 * 
 * @param {*} selection d3.selectAll(<cssSelector>).filter(d => d.ID === wantedID).node()
 * @returns returns object {width: , height: , x: , y: , top: , bottom: , left: , right: }
 */
function elemProperties(selection) {
    return (selection.node().getBoundingClientRect());
}


/**
 * 
 * @param {*} nodeIndex Index of link destination node
 * @param {*} argIndex Index of argument in link destination node
 * @returns returns object {x: , y: } of argument on given argIndex in given node
 */
function argumentPos(nodeIndex, argIndex) {
    argProps = elemProperties(
        d3.selectAll('.node')
        .filter(d => d.ID === nodeIndex)
        .selectAll('.node-argument')
        .filter((d, i) => i === argIndex)
    )
    return {x: argProps.x, y: argProps.y};
}


/**
 * 
 * @param {*} nodeIndex Index of link source node
 * @returns returns object {x: , y: } of outputBar in given node
 */
function outputBarPos(nodeIndex) {
    barProps = elemProperties(
        d3.selectAll('.node')
        .filter(d => d.ID == nodeIndex)
        .select('.output-bar')
    )
    return {x: barProps.x, y: barProps.y};
}

function worldToNodeSpace(nodeIndex, coord) {}
function nodeToWorldSpace(nodeIndex, coord) {}


function dragstarted(event) {}

function dragged(event) {
    event.subject.position.x += event.dx;
    event.subject.position.y += event.dy;
    d3.select(this).raise().style('transform', (d) => 'translate(' + (event.subject.position.x) + 'px, ' + (event.subject.position.y) + 'px)');
}

function dragended(event) {}

const drag = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);


const figure = d3.select('figure')
    .classed('container', true);

const nodes = figure
    .selectAll('div')
    .data(DATA.nodes)
    .enter()
    .append('div')
    .classed('node', true)
    .style('transform', d => 'translate(' + d.position.x + 'px ,' + d.position.y + 'px)')
    .call(drag);

const nodeHeaders = nodes
    .append('div')
    .classed('node-header', true)
    .text(d => d.name);


const nodeArguments = nodes
    .selectAll('.node-argument')
    .data(d => d.arguments)
    .enter()
    .append('div')
    .classed('node-argument', true)
    .text(d => d);

const outputBars = nodes
    .append('div')
    .classed('output-bar', true);

const canvas = figure
    .selectAll('canvas')
    .data(DATA.links)
    .enter()
    .append('canvas')
    .attr('width', '800px')
    .attr('height', '800px')
    .classed('canvas', true)
    .each((d, i) => {
        const c = document.getElementsByClassName('canvas')[i];
        const ctx = c.getContext("2d");

        const outPos = outputBarPos(d.source);
        const inPos = argumentPos(d.destination.node, d.destination.argument);

        const gradient = ctx.createLinearGradient(outPos.x, outPos.y, inPos.x, inPos.y);
        gradient.addColorStop("0", "#f06eaa");
        gradient.addColorStop("1.0", "#448ccb");
        
        //Bezier Control Points X    - make better
        function calcCP1(start, end) {
            return (start + (end - start) / 4);
        }
        function calcCP2(start, end) {
            return (end - (end - start) / 4);
        }

        /*
        Veldig buggy ved refresh. linkene kan flytte seg til høyre.
        Reproduce ved å scrolle ned før refresh
        flytting og scrolling påvirker

        TODO:
        sett størrelse på canvas(d => (bruke pos til arg og bar)).
        make links follow dragged node
        make links dragable?
        */

        //Draw
        ctx.beginPath();
        ctx.moveTo(outPos.x-15, outPos.y); //15 offset to visually connect to outputBars.
        ctx.bezierCurveTo(calcCP1(outPos.x, inPos.x), outPos.y, calcCP2(outPos.x, inPos.x), inPos.y, inPos.x, inPos.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
