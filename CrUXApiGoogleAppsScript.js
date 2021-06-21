/*
This collects data from Chrome UX Report API and pushes it to Google Sheets. 
How to:
- Create a Google Spreadsheet with two Sheets "Data" and "Origins"
- Open Google Apps Script and copy paste the code. 
- Set var "googleSheetsId" to access the sheet from the script
- Get an API Key for Chrome UX Report API + set var "apiKey" https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started
- Add the domains you want to monitor in sheet "Origins" in A:A as full URLs 
- Test running "start" function... There should be data in the Sheet "Data" 
- Schedule the "start" function of the script to run e.g. 6 in the morning. Check https://developers.google.com/web/tools/chrome-user-experience-report/api/reference#daily-updates
- Create a Dashboard / Datastudio with the collected data
*/

var googleSheetsId = ""
var apiKey = ""

//Query API
function getOrigin(origin) {
    var url = "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=" + apiKey
    var headers = {
        contentType: 'application/json',
        method: 'post',
        payload: JSON.stringify({ origin: origin })
    }

    var response = UrlFetchApp.fetch(url, headers);
    toOutputArray(response)
    //Logger.log(response.getContentText());
}

//Generate the output array
function toOutputArray(response) {
  var responseJson = JSON.parse(response);
   
  //LCP
  //LCP Good
  var lcpgood = responseJson.record.metrics.largest_contentful_paint.histogram.filter(function (row) {
    return row.start === 0;
  });
  lcpgood = lcpgood[0].density
  
  //LCP Needs improvements
  var lcpni = responseJson.record.metrics.largest_contentful_paint.histogram.filter(function (row) {
    return row.start === 2500;
  });
  lcpni = lcpni[0].density

  //LCP Poor
  var lcppoor = responseJson.record.metrics.largest_contentful_paint.histogram.filter(function (row) {
    return row.start === 4000;
  });
  lcppoor = lcppoor[0].density

 
  //CLS
  //CLS Good
  var clsgood = responseJson.record.metrics.cumulative_layout_shift.histogram.filter(function (row) {
    return row.start === "0.00";
  });
  clsgood = clsgood[0].density

  //CLS Needs improvements
  var clsni = responseJson.record.metrics.cumulative_layout_shift.histogram.filter(function (row) {
    return row.start === "0.10";
  });
  clsni = clsni[0].density

  //CLS Poor
  var clspoor = responseJson.record.metrics.cumulative_layout_shift.histogram.filter(function (row) {
    return row.start === "0.25";
  });
  clspoor = clspoor[0].density
  
  
  //FID
  //FID Good
  var fidgood = responseJson.record.metrics.first_input_delay.histogram.filter(function (row) {
    return row.start === 0;
  });
  fidgood = fidgood[0].density

  //FID Needs improvements
  var fidni = responseJson.record.metrics.first_input_delay.histogram.filter(function (row) {
    return row.start === 100;
  });
  fidni = fidni[0].density

  //FID Poor
  var fidpoor = responseJson.record.metrics.first_input_delay.histogram.filter(function (row) {
    return row.start === 300;
  });
  fidpoor = fidpoor[0].density

  var date = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd")
  var outputArray = [date, responseJson.record.key.origin, lcpgood, lcpni, lcppoor, clsgood, clsni, clspoor, fidgood, fidni, fidpoor]
  //Logger.log(outputArray)
  appendOutputRow(outputArray)
}

//Append data to data sheet 
function appendOutputRow(outputArray) {
  var ss = SpreadsheetApp.openById(googleSheetsId);
  var sheet = ss.getSheetByName("Data");
  
  sheet.appendRow(outputArray);
}

//Get column 1 of origins sheet
function getOriginsToStart() {
  var ss = SpreadsheetApp.openById(googleSheetsId);
  var sheet = ss.getSheetByName("Origins");
  var values = sheet.getSheetValues(1, 1, 100, 1);
  return values
}

//Start with geting sheets
function start() {
  var origins = getOriginsToStart()
  
  //Loop all competitors 
  for(i=0;i<origins.length;++i){
    if (origins[i][0] != "") {
      Logger.log(origins[i][0])
      getOrigin(origins[i][0])
    }
  }
}


