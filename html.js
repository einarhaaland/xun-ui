const DATA = { 
    "nodes": [
        {
            "ID": 0,
            "name": "Sima Parameter",
            "arguments": [
                "Mean Windspeed",
                "Current",
                "arg3",
                "arg4",
                "arg5"
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
            "position": { x: 20, y: 200}
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
 * @param {*} selection d3.selectAll(<cssSelector>).filter(d => d.ID === wantedID)
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
    const argProps = elemProperties(
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
function outputBarProps(nodeIndex) {
    const barProps = elemProperties(
        d3.selectAll('.node')
        .filter(d => d.ID == nodeIndex)
        .select('.output-bar')
    )
    return barProps;
}

/**
 * 
 * @param {*} nodeIndex Index of link target node
 * @param {*} argIndex Index of argument in target node
 * @returns returns object {x: , y: } of inputSocket in given node and argument position
 */
function inputSocketProps(nodeIndex, argIndex) {
    const socketProps = elemProperties(
        d3.selectAll('.node')
        .filter((d,i) => {
            return d.ID == nodeIndex
        })
        .selectAll('.node-argument')
        .filter((d,i) => argIndex == i)
        .select('.input-socket')
    )
    return socketProps;
}

function worldToNodeSpace(nodeIndex, coord) {
    const nodePos = DATA.nodes[nodeIndex].position;
    return {x: coord.x - nodePos.x, y: coord.y - nodePos.y};
}
function nodeToWorldSpace(nodeIndex, coord) {
    const nodePos = DATA.nodes[nodeIndex].position;
    return {x: coord.x + nodePos.x, y: coord.y + nodePos.y};
}


function dragstarted(event) {
    
}

function dragged(event) {
    event.subject.position.x += event.dx;
    event.subject.position.y += event.dy;
    d3.select(this).raise().style('transform', (d) => 'translate(' + (event.subject.position.x) + 'px, ' + (event.subject.position.y) + 'px)');
    reDrawLinks();
}

function dragended(event) {
    
}

const drag = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);


const figure = d3.select('figure')
    .classed('container', true);

const svg = figure
    .append('svg')
    .classed('link-svg', true);

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

const nodeContent = nodes
    .append('div')
    .classed('node-content', true)

const nodeArguments = nodeContent
    .selectAll('.node-argument')
    .data(d => d.arguments)
    .enter()
    .append('div')
    .classed('node-argument', true)

const inputSocket = nodeArguments
    .append('span')
    .classed('input-socket', true)
    .style('background-color', '#448ccb')

const argumentText = nodeArguments
    .append('span')
    .text(d => d);

const outputBars = nodeContent
    .append('div')
    .classed('output-bar', true);

const links = svg
    .append('g')
    .attr('stroke', 'white')
    .attr('fill', 'none')
    .selectAll('g')
    .data(DATA.links)
    .join('path')
    .attr('stroke-width', '2')
    .attr("d", d => {
        const s = outputBarProps(d.source);
        const i = inputSocketProps(d.destination.node, d.destination.argument);
        return `
            M${s.x},${s.y + s.height/2}
            C${cp1(s.x, i.x)},${s.y + s.height/2}
             ${cp2(s.x, i.x)},${i.y + i.height/2}
             ${i.x},${i.y + i.height/2}
        `
    });

function reDrawLinks() {
    svg
    .selectAll('path')
    .data(DATA.links)
    .attr("d", d => {
        const s = outputBarProps(d.source);
        const i = inputSocketProps(d.destination.node, d.destination.argument);
        return `
            M${s.x},${s.y + s.height/2}
            C${cp1(s.x, i.x)},${s.y + s.height/2}
             ${cp2(s.x, i.x)},${i.y + i.height/2}
             ${i.x},${i.y + i.height/2}
        `
    });
}


function cp1(start, end) {
    return (start + Math.abs(end - start) / 3);
}
function cp2(start, end) {
    return (end - Math.abs(end - start) / 3);
}
