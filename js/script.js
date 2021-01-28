/* MENU */
$(document).on('click','#navicon',function(event){
    event.preventDefault();
    $("#overlay").toggle();
});
//nav
$(".page").first().toggle();