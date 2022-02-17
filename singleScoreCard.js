const request = require("request");
const cheerio = require("cheerio");
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

// url = "https://www.espncricinfo.com//series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";

function processScoreCard(url) {
    request(url, function (error, response, html) {
        if (error) {
            console.log(error);
        } else {
            getMatchDetails(html);
        }
    });
}

function getMatchDetails(html) {

    let $ = cheerio.load(html);
    let details = $('.header-info .description').text().split(',');
    let venue = details[1].trim();
    let date = details[2].trim();
    let result = $('.match-info.match-info-MATCH.match-info-MATCH-half-width div[class="status-text"]').text();
    console.log(`Venue -> ${venue}`);
    console.log(`Date -> ${date}`);
    console.log(`Result -> ${result}`);

    let innings = $('.card.content-block.match-scorecard-table>.Collapsible');
    let htmlString = "";
    for (let i = 0; i < innings.length; i++) {
        htmlString = htmlString + $(innings[i]).html();

        teamName = $(innings[i]).find('h5').text();
        teamName = teamName.split('INNINGS')[0];

        opponentIdx = (i + 1) % 2;
        opponentName = $(innings[opponentIdx]).find('h5').text();
        opponentName = opponentName.split('INNINGS')[0];



        // console.log(teamName , opponentName);

        let cInnings = $(innings[i]);

        let allRows = cInnings.find('.table.batsman tbody tr');

        for (let i = 0; i < allRows.length; i++) {
            let allCols = $(allRows[i]).find('td');
            let isWorthy = $(allCols[0]).hasClass('batsman-cell');
            if (isWorthy == true) {
                let playerName = $(allCols[0]).text().trim();

                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let STR = $(allCols[7]).text().trim();

                console.log(`${playerName} | ${runs} |${balls} | ${fours} | ${sixes} | ${STR}`);

                processPlayer(teamName, opponentName, playerName, runs, balls, fours, sixes, STR, venue, date, result);
            }
        }
        console.log('-------------------------------------------------------------------------');
    }

    // console.log(htmlString);
}


function processPlayer(teamName, opponentName, playerName, runs, balls, fours, sixes, STR, venue, date, result) {
    let teamPath = path.join(__dirname, "IPL", teamName);
    dirCreator(teamPath);
    let playerFilePath = path.join(teamPath, playerName + ".xlsx");

    let content = excelReader(playerFilePath, playerName);

    let playerObj = {
        playerName,
        teamName,
        opponentName,
        runs,
        balls,
        fours,
        sixes,
        STR,
        venue,
        date,
        result
    }
    content.push(playerObj);

    excelWriter(playerFilePath, playerName, content);
}

function dirCreator(folderPath) {
    if (fs.existsSync(folderPath) == false) {
        fs.mkdirSync(folderPath);
    }
}
function excelWriter(fileName, sheetName, jsonData) {
    // Creating a new WorkBook
    let newWB = xlsx.utils.book_new();
    // Json is converted to sheet format (rows and cols)
    let newWS = xlsx.utils.json_to_sheet(jsonData);
    // Setting up the workbook
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    // writing the workbook into excel file
    xlsx.writeFile(newWB, fileName);
}


function excelReader(fileName, sheetName) {
    if (fs.existsSync(fileName) == false) {
        return [];
    }
    let wb = xlsx.readFile(fileName);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}


module.exports = {
    processScore: processScoreCard
};