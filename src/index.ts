function describeAthlete(name: string, age: number, isCutting: boolean): string {
  const phase = isCutting ? "на сушці" : "на наборі";
  return `${name}, ${age} років — зараз ${phase}.`;
}

const athleteName: string = "Олександр";
const athleteAge: number = 20;
const currentCut: boolean = true;

console.log(describeAthlete(athleteName, athleteAge, currentCut));
