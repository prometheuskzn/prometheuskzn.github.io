$("include").each(function (index, el){
    $(el).load($(el).attr('src'), function(response, status, xhr) {
     if(status == "error") {
       $(el).replaceWith("Ой, кажется, произошла проблема. Информация: " + xhr.status + " " + xhr.statusText);
     }else{
       $(el).replaceWith(response);
     }
    });
});