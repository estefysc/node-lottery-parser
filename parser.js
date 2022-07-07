
// imports work with " "type": "module", " in the package.json file.
import cheerio from "cheerio";
import got from "got";
import * as fs from "fs";

const lotteryURL = "https://flalottery.com/exptkt/l6.htm";
const numsPerPlay = 6;

let wordArray = [];
let resultsArray = [];
let intArray = [];
let numOfRows;


function create2dArray(rows, columns, numArr) {
    let twoDimArray = [];
    let numsArrayIndex = 0;

    for(let i = 0; i < rows; i++) {
        twoDimArray.push([]);

        twoDimArray[i].push(new Array(columns));

        for(let j = 0; j < columns; j++) {
            if(numsArrayIndex < numArr.length) {
                twoDimArray[i][j] = numArr[numsArrayIndex];
                numsArrayIndex++;
            }

        }
    }
    return twoDimArray;
}

let wordsArrayPromise = new Promise(function(resolve, reject) {
    let test = true;

    if(test) {
        resolve(
            got(lotteryURL).then(response => {
                // var wordArray = [];

                const pattern = new RegExp('[0-9]+-');
                const patternSec = new RegExp('[0-9]+/')
                const $ = cheerio.load(response.body);

                // response.body contained in $ is filtered by 'td' and converted to text. The numbers followed by - or / will be replaced so when the
                // intArray is populated, those numbers are not included as lottery results.
                $('td').each((index, element) => {
                    wordArray.push($(element).text().replace(pattern, 'NaN').replace(patternSec, 'NaN'));
                });

            }).catch(err => {
                console.log(err);
            })
        );
    } else {
        reject("promise did not work");
    }
});

let createResultsArray = function (arrayWithWords) {
    new Promise(function (resolve, reject) {
        let test = true;

        if (test) {
            resolve(
                arrayWithWords.forEach(element => {
                    if (!isNaN(parseInt(element))) {
                        intArray.push(parseInt(element));
                    }
                }),

                numOfRows = intArray.length / numsPerPlay,

                resultsArray = create2dArray(numOfRows, numsPerPlay, intArray),

                fs.writeFile(
                    "websiteDataFile.txt",
                    resultsArray.map(function(v) {
                        return v.join(', ')
                    }).join('\n'), function (err) {
                        console.log(err ? 'Error :' + err : 'File created')
                    }
                )
            );
        } else {
            reject("second promise did not work");
        }
    }).then();
}

wordsArrayPromise.then(() => {
    createResultsArray(wordArray);
    console.log(resultsArray);
});