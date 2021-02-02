const API_Key = "3aa09f21d6c61c817b25075fbaf29495";
//https://openweathermap.org/current#data
let unitType = "metric";
//https://openweathermap.org/current#multi
let language = "en"
//https://openweathermap.org/api/one-call-api
let excludes = "current,minutely,hourly,alerts";
//GoogleMaps API
const mapsAPI = "XD";

/*function CallByCityName(cityName) {
    API_Call("http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + unitType + "&appid=" + API_Key + "&lang=" + language);
}

function CallByCityID(cityID) {
    API_Call("http://api.openweathermap.org/data/2.5/weather?id=" + cityID + "&units=" + unitType + "&appid=" + API_Key + "&lang=" + language);
}

function CallByCordinates(x, y) {
    API_Call("http://api.openweathermap.org/data/2.5/weather?lat=" + x + "&lon=" + y + "&units=" + unitType + "&appid=" + API_Key + "&lang=" + language);
}

function API_Call(preparedURL) {
    $.ajax({
        url: preparedURL,
        type: "GET",
        dataType: 'json',
        success: function (result) {
            console.log(result);
            weatherObject = new Weather(result);
        },
        error: function (error) {
            console.log(error);
            alert("brak");
        }
    })
}*/
const WeatherAPI = {
    getByCityName: function(cityName){
        return $.ajax({type:"GET", url: "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + unitType + "&appid=" + API_Key + "&lang=" + language, dataType: 'json',});
    },
    getByCityID: function(cityID){
        return $.ajax({type:"GET", url: "http://api.openweathermap.org/data/2.5/weather?id=" + cityID + "&units=" + unitType + "&appid=" + API_Key + "&lang=" + language});
    },
    getByCordinates: function(x, y){
        return $.ajax({type:"GET", url: "http://api.openweathermap.org/data/2.5/weather?lat=" + x + "&lon=" + y + "&units=" + unitType + "&appid=" + API_Key + "&lang=" + language});
    }
}

const ForecastAPI = {
    getSevenDaysForecast: function(x, y){
        return $.ajax({type:"GET", url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + x +"&lon=" + y + "&exclude=" + excludes + "&appid=" + API_Key});
    }
}

//GoogleMAp
let map;
let markerObject;
let script = document.createElement("script");
script.src = "https://maps.googleapis.com/maps/api/js?key=" + mapsAPI + "&callback=initMap";
script.defer = true;

window.initMap = function(){
    map = new google.maps.Map(document.getElementById("googleMap"), {
        center: { lat: parseFloat(defaultCords[0]), lng: parseFloat(defaultCords[1])},
        //center: { lat: 50.292961, lng: 18.668930},
        zoom: 6,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
        },
        gestureHandling: "auto",
        restriction: {
            latLngBounds: {
                north: 85,
                south: -85,
                west: -180,
                east: 180
            }
        },
    });
    map.addListener("click", (e) =>{
        let cordX = e.latLng.lat();
        let cordY = e.latLng.lng();
        GetCityByCords(cordX, cordY);
        AddMarker(cordX, cordY);
    })
    map.setOptions({ minZoom: 4, maxZoom: 12 });
}
document.head.appendChild(script);

function ChangeLocation(x, y){
    const pos ={
        lat: parseFloat(x),
        lng: parseFloat(y),
    };
    map.panTo(pos);
    AddMarker(x, y);
}

function AddMarker(x, y){
    DeleteMarks();
    const pos ={
        lat: parseFloat(x),
        lng: parseFloat(y),
    };
    const marker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP,
    });
    map.panTo(pos);
    markerObject = marker;
}

function DeleteMarks(){
    if(markerObject)
        markerObject.setMap(null);
}