import React, { useState } from "react";
import ReactDOM from 'react-dom/client';
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { setTokenSourceMapRange } from "typescript";
import './index.css';
import ReactGA from 'react-ga4'

ReactGA.initialize('G-W2K3RBN9YT')

const lightEdgeColor = '#b5b5b5'
const darkEdgeColor = '#333a47'
const visColor = '#f8556e'
const processingColor = '#fae135'
const nodeColor = '#56a5cd'
const startNodeColor = '333a47'
const INF = 987654321

function display(netNodes, netEdges) {
    document.getElementById('mynetwork').setAttribute("style","width:700px");
    document.getElementById('mynetwork').setAttribute("style","height:600px");
    const data = {
        nodes: netNodes,
        edges: netEdges
    };
    const options = {
        edges: {
            chosen: false
        },
        nodes: {
            chosen: false
        },
        physics: {
            stabilization: false
        }
        /*edges: {
            color: false
        }*/
    };
    let container = document.getElementById("mynetwork");
    const network = new Network(container, data, options);
}

class dijEntry {
    constructor(to, from, weight, id) {
        this.to = to
        this.from = from
        this.weight = weight
        this.id = id
    }
}

function Graph(props) {
    
    const [nn, setNumNodes] = useState(10);
    const [dij, setDij] = useState(false);
    const [adjWeight, setAdjWeight] = useState([[]]);
    const [adjChild, setAdjChild] = useState([[]]);
    const [adjId, setAdjId] = useState([[]]);
    const [vis, setVis] = useState([]);
    const [vish, setVish] = useState([[]]);
    const [netNodes, changeNodes] = useState(new DataSet([]));
    const [netEdges, changeEdges] = useState(new DataSet([]));
    const [edgeh, changeEdgeh] = useState([[]])
    const [step, setStep] = useState(0);
    const [reset, setReset] = useState(1);
    const [potH, setPotH] = useState([[]]);
    const [p, setP] = useState([]);
    const [edges, setEdges] = useState([]);
    const [dist, setDist] = useState([]);
    const [distH, setDistH] = useState([[]]);
    function refreshData()
    {
        container = document.getElementById('distancetable');
        while(container.firstChild){
            container.removeChild(container.firstChild);
        }
        let header = container.insertRow();
        let t1 = header.insertCell(0);
        let t2 = header.insertCell(1);
        t1.innerText = 'ID';
        t2.innerText = 'DISTANCE';
        for (let i = 0; i < nn; i++)
        {
            //console.log('tr')
            //console.log(dist[i])
            let row = container.insertRow(-1);
            let c1 = row.insertCell(0);
            let c2 = row.insertCell(1);
            c1.innerText = i;
            c2.innerText = (distH[step][i] != INF ? distH[step][i] : 'UNKNOWN');
        }
        container = document.getElementById('edgetable');
        while(container.firstChild){
            container.removeChild(container.firstChild);
        }
        header = container.insertRow();
        t1 = header.insertCell(0);
        t2 = header.insertCell(1);
        let t3 = header.insertCell(2);
        let t4 = header.insertCell(3);
        t1.innerText = 'TOTAL DISTANCE';
        t2.innerText = 'FROM';
        t3.innerText = 'TO';
        t4.innerText = 'NOTE';
        let ff = false;
        for (let i = potH[step].length-1; i >= 0; i--)
        {
            let row = container.insertRow(-1);
            let c1 = row.insertCell(0);
            let c2 = row.insertCell(1);
            let c3 = row.insertCell(2);
            let c4 = row.insertCell(3);
            //potH[step][i].weight + " " + potH[step][i].from +  " " + potH[step][i].to;
            c1.innerText = potH[step][i].weight;
            c2.innerText = potH[step][i].from;
            c3.innerText = potH[step][i].to;
            if (vish[step][potH[step][i].from] && vish[step][potH[step][i].to])
            {
                c4.innerText = "BOTH NODES HAVE ALREADY BEEN EXPLORED, IGNORING THIS EDGE";
            }
            else
            {
                if (!ff)
                {
                    ff = true;
                    c4.innerText = "EDGE WITH MINIMUM DISTANCE THAT ADDS A NODE, WILL BE ADDED";
                }
            }
        }
    }
    function compareDij(a, b)
    {
        if (a.weight < b.weight)
            return 1;
        else
            return -1;
    }
    function getPa(a)
    {
        //console.log(a);
        if (p[a] == a)
            return a;
        p[a] = getPa(p[a]);
        return p[a];
    }
    function addEdge(r1, r2, ew, cid)
    {
        adjWeight[r1].push(ew);
        adjChild[r1].push(r2);
        adjWeight[r2].push(ew);
        adjChild[r2].push(r1);
        adjId[r1].push(cid);
        adjId[r2].push(cid);
        edges.push(new dijEntry(r1, r2));
        p[getPa(r1)] = getPa(r2);
        netEdges.add({
            id: cid,
            from: r1, to :r2, 
            label: ew.toString(),
            color: darkEdgeColor
        });
    }
    let container = document.getElementById("mynetwork");
    useEffect(() => {
        if (reset > 0)
        {
            setStep(0);
            adjWeight.length = 0;
            adjChild.length = 0;
            adjId.length = 0;
            vis.length = 0;
            dist.length = 0;
            for (let i = 0; i < nn; i++) {
                adjWeight.push([]);
                adjChild.push([]);
                adjId.push([]);
                vis.push(false);
            }
            var ids = netNodes.getIds();
            for (let i = 0; i < ids.length; i++)
                netNodes.remove(ids[i]);
            //nodes = new DataSet([]);
            for (let i = 0; i < nn; i++) {
                dist.push(INF)
                netNodes.add({ id: i, label: i.toString()});
                //console.log(i);
            }
            dist[0] = 0;
            distH.length = nn-1;
            distH[0] = [...dist];
            p.length = 0;
            for (let i = 0; i < nn; i++)
                p.push(i);
            
            //edges = new DataSet([]);
            ids = netEdges.getIds();
            for (var i = 0; i < ids.length; i++)
                netEdges.remove(ids[i]);
            let cid = 0;
            let ved = [];
            edges.length = 0;
            for (let i = 0; i < nn*2; i++)
            {
                let r1 = Math.floor(Math.random()*nn);
                let r2 = Math.floor(Math.random()*nn);
                let ew = Math.floor(1+Math.random()*9);
                if (r1 != r2) {
                    addEdge(r1, r2, ew, cid);
                    cid++;
                    ved.push(false);
                }
            }
            for (let i = 0; i < nn-1; i++)
                if (getPa(i) != getPa(i+1))
                {
                    let r1 = i;
                    let r2 = i+1;
                    let ew = Math.floor(1+Math.random()*9);
                    if (r1 != r2) {
                        addEdge(r1, r2, ew, cid);
                        cid++;
                        ved.push(false);
                    }
                }
            vis[0] = true;
            let pot = [];
            potH.length = nn;
            vish[0] = [...vis];
            for (let i = 0; i < adjChild[0].length; i++)
            {
                pot.push(new dijEntry(adjChild[0][i], 0, adjWeight[0][i], adjId[0][i]));
                //console.log(pot[i].to);
                //console.log(adjWeight[0][i]);
            }
            pot.sort(compareDij);
            potH[0] = [...pot];
            //console.log('where' + pot.length)
            //console.log({x})
            edgeh[0] = [...ved];
            for (let i = 0; i < nn-1; i++)
            {
                //console.log('hello')
                while (pot.length != 0 && vis[pot[pot.length-1].to])
                {
                    pot.length--;
                }
                if (pot.length == 0)
                {
                    break;
                }
                //console.log(pot.length);
                ved[pot[pot.length-1].id] = true;
                edgeh[i+1] = [...ved];
                let gt = pot[pot.length-1].to;
                dist[gt] = pot[pot.length-1].weight;
                pot.length--;
                distH[i+1] = [...dist];
                vis[gt] = true;
                //console.log(vis)
                vish[i+1] = [...vis];
                for (let j = 0; j < adjChild[gt].length; j++)
                    pot.push(new dijEntry(adjChild[gt][j], gt, dist[gt] + adjWeight[gt][j], adjId[gt][j]));
                pot.sort(compareDij);
                potH[i+1] = [...pot];
            }
            //for (let i = 0; i < nn; i++)
            //    console.log(vish[i])
            display(netNodes, netEdges);
            setReset(0);
            refreshData();           
        }
        else
        {
            for (let i = 0; i < nn; i++)
            {
                if (vish[step][i] && netNodes.get(i)) {
                    netNodes.get(i).color = {
                        border:visColor,
                        //highlight:'#848484',
                        //hover: '#848484',
                        //inherit: 'from',
                        //opacity:1.0
                    }
                }
                else {
                    netNodes.get(i).color = {
                        border:darkEdgeColor,
                    }
                }
                if (i == 0)
                {
                    netNodes.get(i).color = {
                        color: nodeColor,
                    }
                }
                else
                {
                    netNodes.get(i).color = {
                        color: startNodeColor,
                    }
                }
            }
            for (let i = 0; i < edgeh[step].length; i++)
            {
                netEdges.get(i).width = 2;
                if (edgeh[step][i]) {
                    console.log(i);
                    netEdges.get(i).color = {
                        color:visColor,
                    }
                }
                else if (!edgeh[step][i] && vish[step][edges[i].to] && vish[step][edges[i].from]) {
                    console.log('tr')
                    netEdges.get(i).color = {
                        color:lightEdgeColor,
                    }
                }
                else if (!edgeh[step][i] && (vish[step][edges[i].to] != vish[step][edges[i].from])) {
                    netEdges.get(i).color = {
                        color:processingColor,
                    }
                }
                else {
                    netEdges.get(i).color = {
                        inheritColor: false,
                        color:darkEdgeColor,
                    }
                }
            }
            let ni = netNodes.getIds();
            for (let i = 0; i < ni.length; i++)
            {
                netNodes.update(netNodes.get(ni[i]));
            }
            let ei = netEdges.getIds();
            for (let i = 0; i < ei.length; i++)
            {
                netEdges.update(netEdges.get(ei[i]));
            }
            refreshData();
            //display(netNodes, netEdges);
        }
    });
    const tr = (
        <div>
            <h3>NODES: {nn}<br></br><br></br>STEP: {step}</h3>
            <button type="button" onClick={() => {
                if (step > 0)
                    setStep(step-1);
            }}>Prev</button>
            <button type="button" onClick={() => {
                if (step < nn-1)
                    setStep(step+1);
            }}>Next</button>
            <h3>INPUT NUMBER OF NODES(2-30)</h3>
            <input type="text" id="number" name="number" />
            <br></br>
            <button type="button" onClick={() => {
                const elem = document.getElementById('number')
                if(typeof elem !== 'undefined' && elem !== null && elem.value > 1 && elem.value <= 30) {
                    setStep(0);
                    setNumNodes(elem.value);
                    console.log('donesetting')
                    setReset(1);
                    console.log('tr');
                }
            }}>Submit</button>
        </div>
    );
    return tr;
}



function App() {
    return (
        <div>
            <head>
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-W2K3RBN9YT"></script>
                <script>
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments)}
                    gtag('js', new Date());

                    gtag('config', 'G-W2K3RBN9YT');
                </script>
            </head>
            <div id="cont">
                <div id='c1'>
                    <div id="mynetwork"></div>
                    <h3>Drag screen to move view, Drag nodes to change orientation, Scroll to zoom</h3>
                </div>
                <div id='c2'>
                    <Graph/>
                    <h3>Edges in Priority Queue (min distance first)</h3>
                    <table id="edgetable" border="1"></table>
                </div>
                <div id='c3'>
                    <h3> Distance to node by ID<br></br></h3>
                    <table id="distancetable" border="1"></table>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);