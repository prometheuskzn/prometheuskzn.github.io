$(document).on('change',".js_shop_depend_param, .shop_form .depend_param",function(){select_param_price($(this).parents('form'))});$(document).on('click',"input[action=buy]",function(){$(this).parents('form').find('input[name=action]').val('buy');$(this).parents('form').submit()});$(document).on('click',"input[action=wish]",function(){$(this).parents('form').find('input[name=action]').val('wish');$(this).parents('form').submit()});$(document).on('click',"input[action=wait]",function(){$(this).parents('form').find('input[name=action]').val('wait');$(this).parents('form').submit()});$(document).on('click',"input[action=one_click]",function(){$('form[one_click=true]').removeAttr('one_click');$(this).parents('form').attr('one_click','true');$(this).parents('.js_shop').find('.js_cart_one_click, .cart_one_click').show()});$(document).on('click',".js_cart_one_click_form :button, .cart_one_click_form :button",function(){$(this).attr('disabled','disabled');var self=$(this).parents(".js_cart_one_click_form, .cart_one_click_form");$('.js_shop_form_param input, .js_shop_form_param select, .shop_form_param input, .shop_form_param select, input[name=count], .js_shop_additional_cost input[type="checkbox"]:checked','form[one_click=true]').each(function(){$("input[name='"+$(this).attr('name')+"']",self).remove();self.prepend('<input type="hidden" name="'+$(this).attr('name')+'" value="'+$(this).val()+'">')});$("input[name='additional_cost[]']",self).remove();$('.js_shop_additional_cost input[type="checkbox"]:checked','form[one_click=true]').each(function(){self.prepend('<input type="hidden" name="'+$(this).attr('name')+'" value="'+$(this).val()+'">')});self.submit()});diafan_ajax.success.cart_one_click=function(form,response){$('input:button',form).removeAttr('disabled')}
$(document).on('click','.js_shop_wishlist, .shop-like',function(){var form=$(this).parents('.js_shop, .shop').find('.js_shop_form, .shop_form').first();form.find('input[name=action]').val('wish')
form.submit()});$(document).on('click','.js_shop_add_compare, .shop_compare_button',function(){$(this).parents('form').submit();if(!$('.js_shop_compare_all_button').length)
{return}
var count=$('.js_shop_compare_all_button').attr('data-count')*1;if($(this).is(':checked'))
{count++}
else{count--}
$('.js_shop_compare_all_button').attr('data-count',count);$('.js_shop_compare_all_button').attr('value',$('.js_shop_compare_all_button').attr('data-title')+' ('+count+')')});$(document).on('click','.js_shop_additional_cost input[type="checkbox"]',function(){cacl_additional_pice($(this).parents('form'))});function cacl_additional_pice(th)
{var js_price;$('.js_shop_price',th).each(function(){js_price=$(this);var price=js_price.attr("summ");$('.js_shop_additional_cost input[type="checkbox"]:checked',th).each(function(){price=price*1+$(this).attr("summ")*1});var pr=js_price;if($('span',js_price).length)
{pr=$('span',js_price)}
pr.text(format_price(price,js_price.attr('format_price_1'),js_price.attr('format_price_2'),js_price.attr('format_price_3')))})}
function format_price(str,s1,s2,s3)
{if(0===s1||'0'===s1)
{s1=0}
else{if(!s1)
{s1=2}
else{s1=s1}}
if(!s2)
{s2=','}
if(!s3)
{s3=' '}
d=str.toString().match(/([\.,](.*))/g);if(s1)
{if(d)
{d=d.toString().replace(/[\.,]/g,'').substr(0,s1).replace(/0+$/,'');l=s1-d.length;if(l>0)
{d=d+'0'.repeat(l)}
d=s2+d}
else{d=''}}
else{d='';str=Math.round(str)}
str=str.toString().replace(/([\.,](.*))/g,'');str=str.replace(/\s+/g,'');var arr=str.split('');var str_temp='';if(str.length>3){for(var i=arr.length-1,j=1;i>=0;i--,j++){str_temp=arr[i]+str_temp;if(j%3==0&&i!=0){str_temp=s3+str_temp}}
return str_temp+d}else{return str+d}}
function select_param_price(th)
{var param_code='';$(".js_shop_depend_param, .depend_param",th).each(function(){param_code=param_code+'['+$(this).attr('name')+'='+$(this).val()+']'});if($('.js_shop_param_price, .shop_param_price',th).length)
{$('.js_shop_param_price, .shop_param_price',th).hide();$('.js_shop_additional_cost_price',th).hide();if($('.js_shop_param_price'+param_code+', .shop_param_price'+param_code,th).length)
{$('.js_shop_param_price'+param_code+', .shop_param_price'+param_code,th).show();$('.js_shop_additional_cost_price'+param_code,th).each(function(){$(this).show();$('#'+$(this).parents('label').attr('for')).attr('summ',$(this).attr('summ'))});var image_id=$('.js_shop_param_price'+param_code+', .shop_param_price'+param_code,th).attr('image_id');if(image_id)
{th.parents('.js_shop, .shop').find('.js_shop_img, .shop-item-big-images a').each(function(){if($(this).attr('image_id')==image_id)
{$(this).show()}
else{$(this).hide()}});if(typeof $.fn.slick==='function'){var $productGallery=$('.shop-product__gallery .gallery__basic .gallery__items');if($productGallery.length){var itemIndex=th.closest('.js_shop').find('.gallery__item[image_id="'+image_id+'"]').first().data('itemIndex');if(itemIndex>-1){$productGallery.slick('slickGoTo',itemIndex)}}}}
if($('.js_shop_param_price'+param_code+', .shop_param_price'+param_code,th).find('.js_shop_no_buy, .shop_no_buy').length)
{$('.js_show_waitlist, .shop_waitlist',th).show();$('.js_shop_buy, .to-cart',th).hide();$('.js_shop_one_click, .shop_one_click',th).hide()}
else{if($('.js_shop_no_buy_good, .shop_no_buy_good',th).length)
{$('.js_shop_waitlist, .shop_waitlist',th).show()}
else{$('.js_shop_waitlist, .shop_waitlist',th).hide()}
$('.js_shop_buy, .to-cart',th).show();$('.js_shop_one_click, .shop_one_click',th).show()}}
else{th.parents('.js_shop, .shop').find('.js_shop_img, .shop_img img, .shop_all_img img').each(function(){if($('.js_shop_param_price[image_id='+$(this).attr('image_id')+'], .shop_param_price[image_id='+$(this).attr('image_id')+']',th).length)
{$(this).hide()}});$('.js_shop_buy, .to-cart',th).hide();$('.js_shop_one_click, .shop_one_click',th).hide();$('.js_shop_waitlist, .shop_waitlist',th).hide()}}
var v_param_code='';var v_param_name='';$(".js_shop_depend_param",th).each(function(){v_param_name=$(this).attr('name');if(v_param_code)
{$('option',this).each(function(){if(!$('.js_shop_param_price'+v_param_code+'['+v_param_name+'='+$(this).attr('value')+']',th).length)
{$(this).hide()}
else{$(this).show()}})}
v_param_code=v_param_code+'['+v_param_name+'='+$(this).val()+']'});cacl_additional_pice(th)}
function empty_param_price(th)
{if(!$('.js_shop_param_price',th).length||$('.js_form_option_selected',th).length)
return;$('.js_shop_param_price',th).each(function(){if(!$(".js_shop_no_buy",this).length){for(var i=0,atts=$(this).get(0).attributes,n=atts.length;i<n;i++){if(atts[i].nodeName.indexOf("param")>-1){$("select[name='"+atts[i].nodeName+"']",th).val(atts[i].nodeValue).change()}}
return!1}})}
function init_shop_buy_form()
{$(".js_shop_form, .shop_form").each(function(){empty_param_price($(this));select_param_price($(this))})}
init_shop_buy_form()