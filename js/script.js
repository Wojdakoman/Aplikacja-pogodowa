let weatherObject;
let daysObject;
const imageSource = "http://openweathermap.org/img/wn/{name}.png"
let currentItem;
let defaultCords = ["50.292961", "18.668930"];

function getCurrentLocation() {
    const successfulLookup = position => {
        const { latitude, longitude } = position.coords;
        /*fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=5af07f4f6a8b4918a010d981b6175f78`)
            .then(response => response.json())
            .then(console.log)*/

        //CallByCordinates(latitude, longitude)
        WeatherAPI.getByCordinates(latitude, longitude).then(
            function (response) {
                weatherObject = new Weather(response);
                CompleteWeather();
                WeatherForecast(weatherObject.cordX, weatherObject.cordY);
                AddMarker(weatherObject.cordY, weatherObject.cordX);
            }
        )
    }

    if (window.navigator.geolocation) {
        window.navigator.geolocation
            .getCurrentPosition(successfulLookup, ChangeVisibility);
    }
}

if (window.navigator.geolocation) {
    getCurrentLocation()
}

window.onload = function () {
    const searchBar = document.querySelector('.searchBar');
    const searchBarChildrens = searchBar.children;
    searchBarChildrens[0].addEventListener('keydown', CheckKeyInput, false);
    searchBarChildrens[1].addEventListener('click', function (event) {
        CheckCityName();
    }, false);
    searchBarChildrens[0].addEventListener('input', AutoComplete, false);
    searchBarChildrens[0].addEventListener('focusin', AutoComplete, false);
    document.addEventListener('click', CloseList, false);
    document.getElementsByClassName("noLocation")[0].addEventListener('click', GetLocation, false);
    WeatherAPI.getByCordinates(defaultCords[0], defaultCords[1]).then(
        function (response) {
            weatherObject = new Weather(response);
            CompleteWeather();
            WeatherForecast(weatherObject.cordX, weatherObject.cordY);
            AddMarker(weatherObject.cordY, weatherObject.cordX);
        }
    )
}

function CheckCityName() {
    var inputText = document.querySelector('.searchBar').children[0].value;
    if (inputText.length > 0) {
        WeatherAPI.getByCityName(inputText)
            .then(response => {
                weatherObject = new Weather(response);
                CompleteWeather();
                WeatherForecast(weatherObject.cordX, weatherObject.cordY);
                ChangeLocation(weatherObject.cordY, weatherObject.cordX);
            })
            .fail(err => document.getElementsByClassName("searchBar")[0].children[0].value = "")
    }
}

function Weather(text) {
    this.ID = text.id;
    this.name = text.name;
    //Coord
    this.cordX = text.coord.lon;
    this.cordY = text.coord.lat;
    //Weather
    this.weatherID = text.weather[0].id;
    this.weatherMain = text.weather[0].main;
    this.weatherDescription = text.weather[0].description;
    this.weatherIcon = text.weather[0].icon;
    //Main
    this.temp = text.main.temp;
    this.feelsLike = text.main.feels_like;
    this.pressure = text.main.pressure;
    this.humidity = text.main.humidity;
    this.tempMin = text.main.temp_min;
    this.tempMax = text.main.temp_max;
    this.seaLevel = text.main.sea_level;
    this.grnd_level = text.main.grnd_level;
    //Wind
    this.speed = text.wind.speed;
    this.degrees = text.wind.deg;
    this.gust = text.wind.gust;

    //Rain
    if (text.rain)
        this.rain = text.rain["1h"];
    //Snow
    if (text.snow)
        this.snow = text.snow["1h"];

    //Sys
    this.country = text.sys.country ? text.sys.country: "";
    this.sunrise = text.sys.sunrise;
    this.sunset = text.sys.sunset;
}

function CompleteWeather() {
    const unit = ((value) => {
        switch (value) {
            case "standard": return "K";
            case "metric": return "°C";
            case "imperial": return "F";
            default: return "OK";
        }
    })(unitType);

    document.getElementsByClassName("currentLocation flex flex-column")[0].style.display = " ";
    document.getElementsByClassName("noLocation")[0].style.display = "none";

    var nameText = (weatherObject.name + ', ' + weatherObject.country).trim();
    if(nameText[nameText.length - 1] == ",") nameText = nameText.replace(",", "");
    document.querySelector('.cityName').innerHTML = nameText.length == 1? " " : nameText;
    document.querySelector('.weatherImg').src = imageSource.replace("{name}", weatherObject.weatherIcon);
    document.querySelector('.cityInfo.flex.middle').children[1].innerHTML = weatherObject.temp + unit;
    document.querySelector('.tempMin').innerHTML = weatherObject.tempMin + unit;
    document.querySelector('.tempMax').innerHTML = weatherObject.tempMax + unit;

    var elements = document.querySelector('.cityDetail.flex.flex-column').children;
    //Obrazek czy pada czy jest snieg
    //elements[1].children[0]
    //Tekst pogodowy
    //elements[1].children[1].innerHTML = 
    if (weatherObject.rain) {
        elements[0].style.display = "";
        elements[0].children[1].innerHTML = weatherObject.rain + " mm/h";
    }
    else{
        elements[0].style.display = "none";
        elements[0].children[1].innerHTML = "";
    }
    if (weatherObject.snow) {
        elements[1].style.display = "";
        elements[1].children[1].innerHTML = weatherObject.snow + " mm/h";
    }
    else{
        elements[1].style.display = "none";
        elements[1].children[1].innerHTML = "";
    }

    const compass = ((value) => {
        val = Math.round((value / 22.5) + .5, 1);
        arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)]
    })(weatherObject.degrees);

    elements[2].children[1].innerHTML = weatherObject.speed + " m/s " + compass;
    elements[3].innerHTML = "Odczuwalne: " + weatherObject.feelsLike + unit;
    elements[4].innerHTML = "Wilgotność: " + weatherObject.humidity + "%";
    elements[5].innerHTML = "Ciśnienie: " + weatherObject.pressure + "hPa"
}

//let cityArray = ["Katowice", "Gliwice", "Bytom", "Radom", "Radomsko"];
$.get('./files/miasta.csv', function(data){
    cityArray = data.split(',');
});

function AutoComplete() {
    ClearAutoCompleteList();

    let inputText = this.value.toLowerCase();
    let inputElement = this;
    if(!inputText) return;
    currentItem = -1;
    //let parentContainer = document.getElementById("nav");
    let parentContainer = document.getElementsByClassName("searchBar")[0];
    let divContainer = document.createElement("div");
    divContainer.classList.add("autoCompleteList");

    for(let i = 0; i < cityArray.length; i++){
        if(cityArray[i].toLowerCase().substr(0, inputText.length) === inputText){
            let text = cityArray[i];
            let textContainer = document.createElement("div");
            textContainer.classList.add("autoCompleteItem");
            textContainer.innerHTML = "<b>" + text.substr(0, inputText.length) + "</b>" + text.substr(inputText.length);
            textContainer.value = cityArray[i];
            textContainer.addEventListener("click", function(event){
                inputElement.value = this.value;
                ClearAutoCompleteList();
                CheckCityName();
            });

            divContainer.appendChild(textContainer);
        }
    }
    parentContainer.appendChild(divContainer);
}

function ClearAutoCompleteList(){
    let listContainer = document.getElementsByClassName("autoCompleteList")[0];
    if(listContainer)
        listContainer.remove();
}

function CloseList(event){
    let listContainer = document.getElementsByClassName("autoCompleteList")[0];
    let inputElement = document.getElementsByClassName("searchBar")[0].children[0];
    if(event.target != inputElement && listContainer){
        listContainer.remove();
    }
}

function CheckKeyInput(event){
    switch(event.key){
        case "ArrowUp":  currentItem--; SetItemActive() ;break;
        case "ArrowDown": currentItem++; SetItemActive() ; break;
        case "Enter": ChooseItem(); break;
    }
}

function SetItemActive(){
    if(!document.getElementsByClassName("autoCompleteList")[0]) return;

    let children = document.getElementsByClassName("autoCompleteList")[0].children;
    ClearItemActive()

    let parentCount = children.length;
    if(currentItem >= parentCount) currentItem = 0;
    if(currentItem < 0) currentItem = parentCount - 1;
    if(children)
        children[currentItem].classList.add("autoCompleteItemSelected");
}

function ClearItemActive(){
    let children = document.getElementsByClassName("autoCompleteList")[0].children;
    for(let i = 0; i < children.length; i++){
        children[i].classList.remove("autoCompleteItemSelected");
    }
}

function ChooseItem(){
    if(document.getElementsByClassName("autoCompleteList")[0] && currentItem != -1){
        let children = document.getElementsByClassName("autoCompleteList")[0].children;
        document.querySelector('.searchBar').children[0].value = children[currentItem].value;
    }
    CheckCityName();
    ClearAutoCompleteList();
}

function WeatherForecast(x, y){
    ForecastAPI.getSevenDaysForecast(y, x)
    .then(response =>{
        forecastObject = Forecast(response);
        CompleteForecast();
    })
    .fail(err => document.getElementsByClassName("swiper-container swiper-container-cube swiper-container-3d swiper-container-initialized swiper-container-horizontal")[0].style.display = "none")
}

function Forecast(forecast){
    daysObject = [];
    for(let i = 0; i < 8; i++){
        daysObject.push(new Day(forecast.daily[i]));
    }
}

function Day(day){

    let date = new Date(day.dt * 1000);
    this.dt = date.toLocaleString().split(',')[0];

    this.dayTemp = day.temp.day;
    this.tempMin = day.temp.min;
    this.tempMax = day.temp.max;
    this.feelLike = day.feels_like.day;
    this.pressure = day.pressure;
    this.humidity = day.humidity;
    this.windSpeed = day.wind_speed;
    this.degrees = day.wind_deg;
    this.icon = day.weather[0].icon;
    this.description = day.weather[0].description;

    //Rain
    if (day.rain)
        this.rain = day.rain;
    //Snow
    if (day.snow)
        this.snow = day.snow;
}

function GetCityByCords(latitude, longitude){
    WeatherAPI.getByCordinates(latitude, longitude).then(
        function (response) {
            weatherObject = new Weather(response);
            defaultCords = [weatherObject.cordX, weatherObject.cordY];
            CompleteWeather();
            WeatherForecast(weatherObject.cordX, weatherObject.cordY);
        }
    )
}

function ChangeVisibility() {
    /*document.getElementsByClassName("noLocation")[0].style.display = "block";
    document.getElementsByClassName("currentLocation flex flex-column")[0].style.display = "none";
    document.getElementsByClassName("swiper-container")[0].style.display = "none";
    document.getElementsByClassName("swiper-pagination")[0].style.display = "none";*/
}

function GetLocation() {
    if (window.navigator.geolocation) {
        getCurrentLocation()
    }
}

function CompleteForecast() {
    if(document.getElementsByClassName("swiper-container swiper-container-cube swiper-container-3d swiper-container-initialized swiper-container-horizontal")[0].style.display == "none"){
        document.getElementsByClassName("swiper-container swiper-container-cube swiper-container-3d swiper-container-initialized swiper-container-horizontal")[0].style.display = "";
    }
    const unit = ((value) => {
        switch (value) {
            case "standard": return "K";
            case "metric": return "°C";
            case "imperial": return "F";
            default: return "OK";
        }
    })(unitType);

    let forecastDays = document.getElementsByClassName("cityName");
    let forecastImg = document.getElementsByClassName("weatherImg");
    let forecastTemp = document.getElementsByClassName("cityInfo flex middle");
    let forecastTempMinMax = document.getElementsByClassName("temperatureObject");
    let forecastDetails = document.getElementsByClassName("cityDetail flex flex-column");
    for(let i = 1; i < 8; i++){
        forecastDays[i].innerHTML = daysObject[i].dt;
        forecastImg[i].src = imageSource.replace("{name}", daysObject[i].icon);
        forecastTemp[i].children[1].innerHTML = daysObject[i].dayTemp + unit;
        forecastTempMinMax[i].children[0].innerHTML = daysObject[i].tempMin + unit;
        forecastTempMinMax[i].children[1].innerHTML = daysObject[i].tempMax + unit;

        if (daysObject[i].rain) {
            forecastDetails[i].children[0].style.display = ""
            forecastDetails[i].children[0].children[1].innerHTML = daysObject[i].rain + " mm/h";
        }
        else{
            forecastDetails[i].children[0].style.display = "none"
            forecastDetails[i].children[0].children[1].innerHTML = ""
        }

        if (daysObject[i].snow) {
            forecastDetails[i].children[1].style.display = "";
            forecastDetails[i].children[1].children[1].innerHTML = daysObject[i].snow + " mm/h";
        }
        else{
            forecastDetails[i].children[1].style.display = "none";
            forecastDetails[i].children[1].children[1].innerHTML = "";
        }

        const compass = ((value) => {
            val = Math.round((value / 22.5) + .5, 1);
            arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
            return arr[(val % 16)]
        })(daysObject[i].degrees);
    
        forecastDetails[i].children[2].children[1].innerHTML = daysObject[i].windSpeed + " m/s " + compass;
        forecastDetails[i].children[3].innerHTML = "Odczuwalne: " + daysObject[i].feelLike + unit;
        forecastDetails[i].children[4].innerHTML = "Wilgotność: " + daysObject[i].humidity + "%";
        forecastDetails[i].children[5].innerHTML = "Ciśnienie: " + daysObject[i].pressure + "hPa"
    }
}