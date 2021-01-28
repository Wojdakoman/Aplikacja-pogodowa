/* MENU */
$(document).on('click','#navicon',function(event){
    event.preventDefault();
    $("#overlay").toggle();
});
//nav
$(".page").first().toggle();


//Funcja do onClick potem
function getCurrentLocation(){

    const successfulLookup = position => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=5af07f4f6a8b4918a010d981b6175f78`)
          .then(response => response.json())
          .then(console.log);
        
          CallByCordinates(latitude, longitude)
    }
          
    if(window.navigator.geolocation){
        window.navigator.geolocation
      .getCurrentPosition(successfulLookup, console.log);
    }

}

//Na teraz by działo po otwarciu pliku
const successfulLookup = position => {
    const { latitude, longitude } = position.coords;
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=5af07f4f6a8b4918a010d981b6175f78`)
      .then(response => response.json())
      .then(console.log);
    
      CallByCordinates(latitude, longitude)
}

if(window.navigator.geolocation){
    window.navigator.geolocation
  .getCurrentPosition(successfulLookup, console.log);
}