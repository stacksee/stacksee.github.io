#!/usr/bin/env node

const fs = require('fs');

function getNotables(poeTreeJson) {
    let nodes = Object.keys(poeTreeJson.nodes).map(key => poeTreeJson.nodes[key]);
    let notables = nodes.filter(node => node.isNotable == true);
    return notables;
}

function nid(notable) {
    return notable.name;
}

let poe315 = JSON.parse(fs.readFileSync('poe315.json'));
let poe315notables = getNotables(poe315);

let poe316 = JSON.parse(fs.readFileSync('poe316v3.json'));
let poe316notables = getNotables(poe316);

let unchangedNotables = [];
let changedNotables = [];
let removedNotables = [];
let newNotables = poe316notables;

poe315notables.forEach(poe315notable => {
    let nid315 = nid(poe315notable);

    let notable316 = poe316notables.find(n => nid(n) == nid315);
    if (notable316) {
        let n315stats = poe315notable.stats;
        let n316stats = notable316.stats;

        let remainingStats = n315stats.filter(stat => n316stats.includes(stat));
        let removedStats = n315stats.filter(stat => !n316stats.includes(stat));
        let addedStats = n316stats.filter(stat => !n315stats.includes(stat));
        
        if (removedStats.length > 0 || addedStats.length > 0) {
            changedNotables.push({
                "name": nid315,
                "remainingStats": remainingStats,
                "removedStats": removedStats,
                "addedStats": addedStats
            });
        } else {
            unchangedNotables.push(nid315);
        }
    } else {
        removedNotables.push({
            "name": nid315,
            "removedStats": poe315notable.stats
        });
    }
});

newNotables = poe316notables.filter(n => {
    let nid316 = nid(n);
    let changed = changedNotables.find(c => c.name == nid316) != null;
    let removed = removedNotables.find(c => c.name == nid316) != null;
    let unchanged = unchangedNotables.includes(nid316);

    return !(changed || removed || unchanged);
}).map(n => ({
    "name": nid(n),
    "addedStats": n.stats
}));

let all = {
    "changed": changedNotables,
    "added": newNotables,
    "removed": removedNotables
};

console.log("Changed");
console.log(changedNotables);
console.log("New");
console.log(newNotables);
console.log("Removed");
console.log(removedNotables);


let data = JSON.stringify(all);
fs.writeFileSync('poe316notablechanges.json', data);


