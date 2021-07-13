// DATA
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


// HELPER FUNCTIONS
/**
 * 
 * @param {*} nodeIndex Index of node
 * @returns Returns object {width: , height: , x: , y: , top: , bottom: , left: , right: } of node
 */
function nodeProperties(nodeIndex) {
    return (d3.selectAll('.node')
        .filter(d => d.ID === nodeIndex)
        .node()
        .getBoundingClientRect())
}

/**
 * 
 * @param {*} selection Selection to get properties from. Example: d3.selectAll('.nodes').filter(d => d.ID === 0)
 * @returns Returns object {width: , height: , x: , y: , top: , bottom: , left: , right: }
 */
function elemProperties(selection) {
    return (selection.node().getBoundingClientRect());
}

/**
 * 
 * @param {*} nodeIndex Index of link destination node
 * @param {*} argIndex Index of argument in link destination node
 * @returns Returns object {x: , y: } of argument on given argIndex in given node
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
 * @returns Returns object {x: , y: } of outputBar in given node
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
 * @returns Returns object {x: , y: } of inputSocket in given node and argument position
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


/**
 * 
 * @param {*} start X-coordinate of start of bezier curve
 * @param {*} end X-coordinate of end of bezier curve
 * @returns X-coordinate of start-control-point of bezier curve
 */
function cp1(start, end) {
    return (start + Math.abs(end - start) / 3);
}
/**
 * 
 * @param {*} start X-coordinate of start of bezier curve
 * @param {*} end X-coordinate of end of bezier curve
 * @returns X-coordinate of end-control-point of bezier curve
 */
function cp2(start, end) {
    return (end - Math.abs(end - start) / 3);
}


/**
 * Re-draws every link in compliance with data
 */
function reDrawLinks() {
    const selection = links
        .selectAll('path')
        .data(DATA.links);


    selection.join(
        enter => enter
            .append('path')
            .classed('link', true),
        update => update,
        exit => exit.remove()
    ).attr("d", d => {
        const s = outputBarProps(d.source);
        const i = inputSocketProps(d.destination.node, d.destination.argument);
        return `
            M${s.x},${s.y + s.height/2}
            C${cp1(s.x, i.x)},${s.y + s.height/2}
            ${cp2(s.x, i.x)},${i.y + i.height/2}
            ${i.x},${i.y + i.height/2}
        `
    });
/*
    selection.enter()
        .append('path')
        .classed('link', true)
        .merge(selection)
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
    selection.exit().remove();*/
}


// DRAG FUNCTIONS
/**
 * Runs once on node dragstarted
 * @param {*} event 
 */
function dragstarted(event) {
    
}
/**
 * Runs when dragging node
 * @param {*} event 
 */
function dragged(event) {
    event.subject.position.x += event.dx;
    event.subject.position.y += event.dy;
    //d3.select(this).raise().style('transform', (d) => 'translate(' + (event.subject.position.x) + 'px, ' + (event.subject.position.y) + 'px)');
    d3.select(this).style('transform', (d) => 'translate(' + (event.subject.position.x) + 'px, ' + (event.subject.position.y) + 'px)');
    reDrawLinks();
}
/**
 * Runs once on node dragended
 * @param {*} event 
 */
function dragended(event) {
    
}


/**
 * Runs once on outputBar dragstart
 * @param {*} event 
 */
function outPutBarDragStart(event) {
    const mouseX = event.sourceEvent.x;
    const mouseY = event.sourceEvent.y;
    const props = elemProperties(d3.select(this));
    placeholderLink
        .data([{start: props, end: {x: mouseX, y: mouseY, height: 0}}])
        .style('visibility', 'visible')
        .attr("d", d => {
            const s = d.start;
            const i = d.end;
            return `
                M${s.x},${s.y + s.height/2}
                C${cp1(s.x, i.x)},${s.y + s.height/2}
                ${cp2(s.x, i.x)},${i.y + i.height/2}
                ${i.x},${i.y + i.height/2}
            `
        });
}
/**
 * Runs when dragging link from outputBar
 * @param {*} event 
 */
function outPutBarDragged(event) {
    const mouseX = event.sourceEvent.x;
    const mouseY = event.sourceEvent.y;
    const oldData = placeholderLink.data()[0];
    const data = [{
        sourceNodeID: oldData.sourceNodeID, 
        start: oldData.start, 
        end: {x: mouseX, y: mouseY, height: 0}}];
    placeholderLink
        .data(data)
        .attr("d", d => {
            const s = d.start;
            const i = d.end;
            return `
                M${s.x},${s.y + s.height/2}
                C${cp1(s.x, i.x)},${s.y + s.height/2}
                ${cp2(s.x, i.x)},${i.y + i.height/2}
                ${i.x},${i.y + i.height/2}
            `
        });
}
/**
 * Runs once on outputBar dragend
 * @param {*} event 
 */
function outPutBarDragEnd(event) {
    placeholderLink.style('visibility', 'hidden');
    const inputSocket = d3.select('.input-socket:hover');
    if (!inputSocket.empty()) {
        inputSocket.each(d => {
            const newSource = event.subject.ID;
            const newDestination = {
                "node": d.ID,
                "argument": d.argument
            };
            function notUnique(item) {
                return item.destination.node != newDestination.node || 
                    item.destination.argument != newDestination.argument;
            }
            if (newSource != newDestination.node) {
                DATA.links = DATA.links.filter(notUnique)
                DATA.links.push({
                    "source": newSource,
                    "destination": newDestination
                })
            }
        });
        reDrawLinks();
    }
}

function inputSocketDragStart(event) {
    const mouseX = event.sourceEvent.x;
    const mouseY = event.sourceEvent.y;
    const linkdata = DATA.links.filter(isDraggedLink);
    const props = elemProperties(
        d3.selectAll('.node')
        .filter(d => d.ID == linkdata[0].source)
        .select('.output-bar'));
    
    function notUnique(item) {
        return item.destination.node != event.subject.ID || 
            item.destination.argument != event.subject.argument;
    }
    function isDraggedLink(item) {
        return item.destination.node == event.subject.ID && 
            item.destination.argument == event.subject.argument;
    }

    DATA.links = DATA.links.filter(notUnique);

    placeholderLink
        .data([{
            sourceNodeID: linkdata[0].source,
            start: props,
            end: {x: mouseX, y: mouseY, height: 0}
        }])
        .style('visibility', 'visible')
        .attr("d", d => {
            const s = d.start;
            const i = d.end;
            return `
                M${s.x},${s.y + s.height/2}
                C${cp1(s.x, i.x)},${s.y + s.height/2}
                ${cp2(s.x, i.x)},${i.y + i.height/2}
                ${i.x},${i.y + i.height/2}
            `
        });
    reDrawLinks();
}
function inputSocketDragged(event) {
    //merge with outPutBarDragged to create linkDragged?
}
function inputSocketDragEnd(event) {
    placeholderLink.style('visibility', 'hidden');
    const inputSocket = d3.select('.input-socket:hover');
    if (!inputSocket.empty()) {
        inputSocket.each(d => {
            const newSource = placeholderLink.data()[0].sourceNodeID;
            const newDestination = {
                "node": d.ID,
                "argument": d.argument
            };
            function notUnique(item) {
                return item.destination.node != newDestination.node || 
                    item.destination.argument != newDestination.argument;
            }
            DATA.links = DATA.links.filter(notUnique)
            DATA.links.push({
                "source": newSource,
                "destination": newDestination
            })
        });
        reDrawLinks();
    }
}


// DRAG INITIATORS
const drag = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

const outPutBarDrag = d3
    .drag()
    .on("start", outPutBarDragStart)
    .on("drag", outPutBarDragged)
    .on("end", outPutBarDragEnd);

const inputSocketDrag = d3
    .drag()
    .on("start", inputSocketDragStart)
    .on("drag", outPutBarDragged)
    .on("end", inputSocketDragEnd);


// DOM STRUCTURE
const figure = d3
    .select('#viewport')
    .append('div')
    .classed('container', true);

const svg = figure
    .append('svg')
    .classed('link-svg', true)
    .on('contextmenu', contextMenu);

const placeholderLink = svg
    .append('path')
    .attr('id', 'placeholder-link')
    .classed('link', true)
    .classed('link-placeholder', true)
    .style('visibility', 'hidden');


/*
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
    .classed('node-content', true);

const nodeArguments = nodeContent
    .selectAll('.node-argument')
    .data(d => d.arguments.map((e,i) => ({
        ID: d.ID, 
        argument: i, 
        name: e
    })))
    .enter()
    .append('div')
    .classed('node-argument', true);

const inputSocket = nodeArguments
    .append('span')
    .classed('input-socket', true)
    .style('background-color', '#448ccb')
    .call(inputSocketDrag);

const argumentText = nodeArguments
    .append('span')
    .text(d => d.name);

const outputBars = nodeContent
    .append('div')
    .classed('output-bar', true)
    .call(outPutBarDrag);

*/
drawNodes();

const links = svg
    .append('g')
    .attr('id', 'links');
reDrawLinks();

function contextMenu(event) {
    event.preventDefault();
    const mouseX = event.pageX;
    const mouseY = event.pageY;

    d3.select('.context-menu').remove();

    const menu = figure
        .append('div')
        .classed('context-menu', true)
        .style('left', mouseX + 'px')
        .style('top', mouseY + 'px');

    const menuHeaders = menu
        .selectAll('menu-header')
        .data(['Add New Node'])
        .enter()
        .append('span')
        .text(d => d)
        .classed('menu-header', true);

    const entries = menu
        .selectAll('menu-entry')
        .data(['Function 1', 'Function 2'])
        .enter()
        .append('span')
        .classed('menu-entry', true)
        .text(d => d)
        .on('mouseup', (d, event) => addNode(d, event, mouseX, mouseY));

    d3.select('body').on('click', (event) => d3.select('.context-menu').remove());
}

function addNode(event, d, posX, posY) {
    DATA.nodes.push(
        {
            "ID": DATA.nodes.length,
            "name": d,
            "arguments": ["arg1", "arg2"],
            "position": { x: posX, y: posY}
        }
    )
    drawNodes();
}

function drawNodes() {
    const nodes = figure
        .selectAll('.node')
        .data(DATA.nodes)
        .enter()
        .append('div')
        .classed('node', true)
        .style('transform', d => 'translate(' + d.position.x + 'px ,' + d.position.y + 'px)')
        .sort(d => d.ID)
        .call(drag);
    
/*
    nodes.join(
            enter => enter.append('div').classed('node', true),
            update => update.data(DATA.nodes, d => d.ID).style('transform', d => 'translate(' + d.position.x + 'px ,' + d.position.y + 'px)'),
            exit => exit.remove()
        )
        .call(drag);*/
        
    //lag noder append...

    //select node og sett verdier

    //key function when setting data? selection.order?

    const nodeHeaders = nodes
        .append('div')
        .classed('node-header', true)
        .text(d => d.name);

    const nodeContent = nodes
        .append('div')
        .classed('node-content', true);

    const nodeArguments = nodeContent
        .selectAll('.node-argument')
        .data(d => d.arguments.map((e,i) => ({
            ID: d.ID, 
            argument: i, 
            name: e
        })))
        .enter()
        .append('div')
        .classed('node-argument', true);

    const inputSocket = nodeArguments
        .append('span')
        .classed('input-socket', true)
        .style('background-color', '#448ccb')
        .call(inputSocketDrag);

    const argumentText = nodeArguments
        .append('span')
        .text(d => d.name);

    const outputBars = nodeContent
        .append('div')
        .classed('output-bar', true)
        .call(outPutBarDrag);

    nodes.exit().remove();
}
