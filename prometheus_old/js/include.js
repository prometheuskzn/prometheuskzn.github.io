$("include").each(function (index, el){
    $(el).load($(el).attr('src'), function(response, status, xhr) {
     if(status == "error") {
       $(el).replaceWith("An error occured: " + xhr.status + " " + xhr.statusText);
     }else{
       $(el).replaceWith(response);
     }
    });
});