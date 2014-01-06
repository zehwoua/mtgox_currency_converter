jQuery(document).ready(function(){

	$.getJSON( "assets/javascripts/currency.json", function( data ) {
        $.each(data, function(i, value) {
            $('#selectCurrency').append($('<option>').text(i).attr({'value': i , 'data-symbol': value.symbol }) );
        });
        
	});


	$('#selectCurrency').change(change_currency);
	

	function change_currency(){
		
		// Get selected dropdown data
		selected = $(this).find('option:selected');
		currency = selected.val();

		// Update Currency symbol
		$("#currency-symbol").html(currency);

		$('.display_info').hide();
		$('.display_loader').addClass('show');

		// Create new socket and connect
		var new_socket = create_socket(currency);
		connect_socket(new_socket);
	}


	 function create_socket(currency){
		if(!currency)
			currency = "USD";

		var url = "wss://websocket.mtgox.com/mtgox?Channel=ticker"
		var socket = MtGox.connect( url + "&Currency=" + currency );

		return socket;
	}

	
	connect_socket(create_socket());


	function connect_socket(socket){

		var c_last = $('.c_last');
		var c_high = $('.c_high');
		var c_low = $('.c_low');
		var c_volume = $('.c_volume');
		var c_price = $('#currency_price');

		socket.on('connect', function () {

			$('#selectCurrency').change(function(){
				close_socket(socket);
			});


			socket.on( 'message', function( data ) {

				// Update no Of message
				update_message_no();

				if($('.display_loader').hasClass('show')){
					$('.display_loader').removeClass('show');
					$('.display_info').show();
				}

				if(!$('#content').is(':visible')){
					$('#content').show();
					$('.first-load').remove();
				}
								
				//Update Values
				c_last.html(data.ticker.last.display);
				c_price.html(data.ticker.last.display);
				c_high.html(data.ticker.high.display);
				c_low.html(data.ticker.low.display);
				c_volume.html(data.ticker.vol.display);

				calculate_amount(data.ticker.last.value);
				
			} );
		});
	}

	function close_socket(socket){
		socket.close();
	}

	function update_message_no(){
		var number_of_message = $("#no_of_message");
		message_no = parseInt(number_of_message.html());
	 	message_no++;
		number_of_message.html(message_no);
	}

	function calculate_amount(last){

		var amount_btc = $("#amount_btc");
		var amount_currency = $("#amount_currency");

		display_calc_currency();

		amount_btc.keyup(display_calc_currency);

		amount_currency.keyup(display_calc_btc);

		function display_calc_btc(){
			currency = parseFloat(amount_currency.val());
			amount_btc.val(currency / last);
		}

		function display_calc_currency(){
			btc = parseFloat(amount_btc.val());
			amount_currency.val(btc * last);
		}
	}
	
});