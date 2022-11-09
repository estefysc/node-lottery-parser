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

got(lotteryURL).then(response => {
    // var wordArray = [];

    const pattern = new RegExp('[0-9]+-', 'g');
    const secondPattern = new RegExp('\\d+\\/\\d+', 'g');
    const $ = cheerio.load(response.body);

    // After error with previous code (suddenly stopped working), the body tag retrieves all the inner text.
    // The following code used to retrieve only the text inside the td tag and replace the numbers followed by - or / with NaN.
    //     $('td').each((index, element) => {
    //         wordArray.push($(element).text().replace(pattern, 'NaN').replace(patternSec, 'NaN'));
    //     });
    let text = $('body').text();

    fs.writeFile(
        "pureBody.txt",
        text,
        function (err) {
            console.log(err ? 'Error :' + err : 'pureBody file created')
        }
    );

    // filter text to replace all numbers followed by - or / with NaN.
    let replacedText = text.replace(pattern, 'NaN').replace(secondPattern, 'NaN');
    // Separates the text by words.
    wordArray = replacedText.split(' ');

    fs.writeFile(
        "replacedText.txt",
        wordArray.toString(),
        function (err) {
            console.log(err ? 'Error :' + err : 'replacedText array file created')
        }
    );

    wordArray.forEach(element => {
        if (!isNaN(parseInt(element))) {
            intArray.push(parseInt(element));
        }
    });

    numOfRows = intArray.length / numsPerPlay;
    resultsArray = create2dArray(numOfRows, numsPerPlay, intArray);

    fs.writeFile(
        "testerResults.txt",
        resultsArray.map(function (v) {
            return v.join(', ');
        }).join('\n'),
        function (err) {
            console.log(err ? 'Error :' + err : 'testerResults file created')
        }
    );

}).catch(err => {
    console.log(err);
})