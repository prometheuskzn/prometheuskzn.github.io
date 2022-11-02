diafan_ajax.success.subscription_add=function(form,response){if(response.errors&&response.errors.captcha&&!response.result){$(".captcha",form).addClass("active")}
else{$(".captcha",form).removeClass("active")}
return!0}