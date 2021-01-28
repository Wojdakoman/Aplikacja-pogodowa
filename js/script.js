let weatherObject;

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
        WeatherAPI.getByCityName(inputText).then(
            function(response){
                weatherObject = new Weather(response);
            }
        )
    }
}

function Weather(text) {
    alert(text.name);
    alert(text.coord.lon);
    this.name = text.name;
    this.cordX = text.coord.lon;
    this.cordY = text.coord.lat;
}