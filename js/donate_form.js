
function freekassa_go(){
	var formData = {};
	formData['sum'] = $('.control > [name=summ]').val();
	formData['email'] = $('.control > [name=email]').val();
	$.ajax({
		type: 'POST',
		url: 'https://donate.prometheuskzn.ru/',
		cache: false,
		contentType: false,
		processData:false,
		data: JSON.stringify(formData),
		dataType : 'json',
		success: function(data)
		{
			$.each(data, function(i, val)
			{
				if(i == 'e')
				{
					alert(val);
				}
				if(i == 's')
					location.href=val;
			});
		}
	});
}