const request = require("request");
const cheerio = require("cheerio");

// url = "https://www.espncricinfo.com//series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";

function processScoreCard(url){
    request(url,function(error,response,html){
        if(error){
            console.log(error);
        }else{
            getMatchDetails(html);
        }
    });
}

function getMatchDetails(html){

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
    for(let i = 0;i<innings.length;i++){
        htmlString = htmlString + $(innings[i]).html();

        teamName = $(innings[i]).find('h5').text();
        teamName = teamName.split('INNINGS')[0];

        opponentIdx = (i+1)%2;
        opponentName = $(innings[opponentIdx]).find('h5').text();
        opponentName = opponentName.split('INNINGS')[0];



        // console.log(teamName , opponentName);

        let cInnings = $(innings[i]);

        let allRows = cInnings.find('.table.batsman tbody tr');

        for(let i = 0; i< allRows.length;i++){
            let allCols = $(allRows[i]).find('td');
            let isWorthy = $(allCols[0]).hasClass('batsman-cell');
            if(isWorthy == true){
                let playerName = $(allCols[0]).text().trim();

                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let STR = $(allCols[7]).text().trim();

                console.log(`${playerName} | ${runs} |${balls} | ${fours} | ${sixes} | ${STR}`);  
            }
        }
        console.log('-------------------------------------------------------------------------');
    }

    // console.log(htmlString);
}

module.exports = {
    processScore : processScoreCard
};