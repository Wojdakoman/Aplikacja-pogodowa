let weatherObject;
const imageSource = "http://openweathermap.org/img/wn/{name}.png"
/* MENU */
$(document).on('click','#navicon',function(event){
    event.preventDefault();
    $("#overlay").toggle();
});
//nav
$(".page").first().toggle();


//Funcja do onClick
function getCurrentLocation(){

    const successfulLookup = position => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=5af07f4f6a8b4918a010d981b6175f78`)
          .then(response => response.json())
          .then(console.log)

          //CallByCordinates(latitude, longitude)
          WeatherAPI.getByCordinates(latitude, longitude).then(
            function(response){
                weatherObject = new Weather(response);
                CompleteWeather();
            }
          )
    }
          
    if(window.navigator.geolocation){
        window.navigator.geolocation
      .getCurrentPosition(successfulLookup, console.log);
    }

}

if(window.navigator.geolocation){

    getCurrentLocation()

}

window.onload = function () {
    const searchBar = document.querySelector('.searchBar');
    const searchBarChildrens = searchBar.children;
    searchBarChildrens[0].addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            CheckCityName();
        }
    });
    searchBarChildrens[1].addEventListener('click', function (event) {
        CheckCityName();
    });
}

function CheckCityName() {
    var inputText = document.querySelector('.searchBar').children[0].value;
    if (inputText.length > 0) {
        WeatherAPI.getByCityName(inputText)
        .then(response => {
            weatherObject = new Weather(response); 
            CompleteWeather();
        })
        .fail(err => alert("eroro"))
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
    if(text.rain)
        this.rain = text.rain["1h"];
    //Snow
    if(text.snow)
        this.snow = text.snow["1h"];

    //Sys
    this.country = text.sys.country;
    this.sunrise = text.sys.sunrise;
    this.sunset = text.sys.sunset;
}

function CompleteWeather(){
    const unit = ((value) => {
        switch(value) {
            case "standard": return "K";
            case "metric": return "°C";
            case "imperial": return "F";
          default: return "OK";
        }
    })(unitType);

    document.querySelector('.cityName').innerHTML = weatherObject.name+', '+weatherObject.country;
    document.querySelector('.weatherImg').src = imageSource.replace("{name}", weatherObject.weatherIcon);
    document.querySelector('.cityInfo.flex.middle').children[1].innerHTML = weatherObject.temp + unit;
    document.querySelector('.tempMin').innerHTML = weatherObject.tempMin + unit;
    document.querySelector('.tempMax').innerHTML = weatherObject.tempMax + unit;

    var elements = document.querySelector('.cityDetail.flex.flex-column').children;
    //Obrazek czy pada czy jest snieg
    //elements[1].children[0]
    //Tekst pogodowy
    //elements[1].children[1].innerHTML = 
    if(weatherObject.rain){
        elements[0].style.display = "";
        elements[0].children[1].innerHTML = weatherObject.rain +" mm/h";
    }

    if(weatherObject.snow){
        elements[1].style.display = "";
        elements[1].children[1].innerHTML = weatherObject.snow +" mm/h";
    }

    const compass = ((value) => {
        val=Math.round((value/22.5)+.5, 1);
        arr=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
        return arr[(val % 16)]
    })(weatherObject.degrees);

    elements[2].children[1].innerHTML = weatherObject.speed + " m/s "+ compass;
    elements[3].innerHTML = "Odczuwalne: "+ weatherObject.feelsLike + unit;
    elements[4].innerHTML = "Wilgotność: "+ weatherObject.humidity +"%";
    elements[5].innerHTML = "Ciśnienie: "+ weatherObject.pressure +"hPa"
}