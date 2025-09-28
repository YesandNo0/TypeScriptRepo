"use strict";
function describeAthlete(name, age, isCutting) {
    const phase = isCutting ? "на сушці" : "на наборі";
    return `${name}, ${age} років — зараз ${phase}.`;
}
const athleteName = "Олександр";
const athleteAge = 20;
const currentCut = true;
console.log(describeAthlete(athleteName, athleteAge, currentCut));
