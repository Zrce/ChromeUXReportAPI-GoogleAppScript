function getOrigin(origin) {
    var url = "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR-KEY"
    var headers = {
        contentType: 'application/json',
        method: 'post',
        payload: JSON.stringify({ origin: origin })
    }

    var response = UrlFetchApp.fetch(url, headers);
    Logger.log(response.getContentText());
}

function start() {
    getOrigin("https://zrce.eu")

}


