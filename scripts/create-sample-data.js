const fs = require("fs");
const path = require("path");


let rev = 1;
let dataDir = "../data";
let weeks = [0, 2, 4, 8, 12, 16];
let numSubjects = 200;
let data = [];

// Create the header.
let header = ["USUBJID"];
weeks.forEach((week) => {
    header.push(`WEEK ${week}`);
});
data.push(header);

// Create the data.
for (let i = 0; i < numSubjects; i++) {
    let row = [`S${10001 + i}`];
    for (let j = 0; j < weeks.length; j++) {
        let x = (Math.random() * (1.0 - j / weeks.length)).toFixed(3);
        row.push(x);
    }
    data.push(row);
}

let files = fs.readdirSync(dataDir)
files.forEach((file) => {
    let numString = file.replace(/[^\d]/g, "");
    let num = parseInt(numString, 10);
    if (num >= rev) {
        rev = num + 1;
    }
});
let fileName = `sample-data-${rev}.csv`;

let csvString = [];
for (let i = 0; i < data.length; i++) {
    csvString.push( data[i].join(",") );
}

fs.writeFileSync(path.join(dataDir, fileName), csvString.join("\n"));
