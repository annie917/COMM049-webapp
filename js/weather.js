$(function() {

    var forecast = [];
    var i;
    var degC = "&#xb0;C"; // degrees C symbol

    /* Get weather forecast from Yahoo API (with naughty synchronous XMLHttpRequest) */
    try{
  
	    var xhr = new XMLHttpRequest();
        var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast" + 
                  "%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22fleet%2C%20" + 
                  "united-kingdom%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2" + 
                  "Falltableswithkeys&callback=";
        
	    xhr.open("GET", url, false);
	    xhr.send();
	  
	    if (xhr.status == 200) {  //Success!
	
		    var bigForecast = JSON.parse(xhr.responseText);
	
	        /* Populate array with real data */
	        forecast = populateYahooWeather(bigForecast);
	
	    } else {
		
		    /* Status not success, populate with sample data and display warning */
			forecast = populateSampleWeather();
			
			$("<section class='alert alert-warning'>Weather data unavailable.  Sample graphics shown for demonstration." + 
			  "</section>").insertAfter("#weatherLink");
			
		}
    }
    
    catch(err) {
    
		/* Exception in API call, populate with sample data and display warning */
		forecast = populateSampleWeather();
			
		$("<section class='alert alert-warning'>Weather data unavailable.  Sample graphics shown for demonstration." + 
		  "</section>").insertAfter("#weatherLink");
    }
    
    finally {
    
		for (i = 0; i < forecast.length; i++) {
		
			/* Display weather information on weather.html */
			document.getElementById("day" + i ).src = forecast[i].image;
			document.getElementById("dayText" + i).innerHTML = forecast[i].text;
			document.getElementById("dayTemp" + i).innerHTML = forecast[i].temp + degC;
			document.getElementById("dayName" + i).innerHTML = getDayOfWeek(i);
		}
		
	}
	
});

function getDayOfWeek(i) {

    /* Returns the day of the week name for i days after today */
    var today = new Date;
    var d = new Date;
 	var weekday = new Array(7);
 
	d.setDate(today.getDate() + i);
	
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	return weekday[d.getDay()];

}

function convertTemp(tempF) {

    /* Converts farenheit to celsius and rounds to nearest integer */	
	var tempC = (tempF - 32) / 1.8;
	return Math.round(tempC);
	
}

function populateSampleWeather() {

    var fourDayFc = [];

    /* Populate weather with sample data, in case of API failure */
    fourDayFc[0] = new Object;
    fourDayFc[0].image = "svg/cloud.svg"
	fourDayFc[0].text = "Cloudy";
	fourDayFc[0].temp = 8;
	
    fourDayFc[1] = new Object;
    fourDayFc[1].image = "svg/sun.svg"
	fourDayFc[1].text = "Sunny";
	fourDayFc[1].temp = 6;
	
    fourDayFc[2] = new Object;
    fourDayFc[2].image = "svg/rain.svg"
	fourDayFc[2].text = "Rainy";
	fourDayFc[2].temp = 10;
	
    fourDayFc[3] = new Object;
    fourDayFc[3].image = "svg/snow.svg"
	fourDayFc[3].text = "Snowy";
	fourDayFc[3].temp = 2;
	
	return fourDayFc;

}

function populateYahooWeather(bigForecast){

	/* Function called on successful completion of API call to extract required
	   data from response */
    var fourDayFc = [];
    var i;
 
    /* Work out if it is night, for selecting right graphic for today's weather */
    var night = isNight(bigForecast.query.results.channel.astronomy.sunrise, 
                        bigForecast.query.results.channel.astronomy.sunset);
    
    /* Get textual weather type for today */
    var weatherType = getWeatherType(bigForecast.query.results.channel.item.condition.code);
    
	/* Populate weather for today */
	fourDayFc[0] = new Object();
	fourDayFc[0].temp = convertTemp(bigForecast.query.results.channel.item.condition.temp);
	fourDayFc[0].image = getWeatherSvg(night, weatherType);
	fourDayFc[0].text = weatherType;

	/* Populate other days with subsequent day's forecast */
	for (i = 1; i < 4; i++) {

	    night = false;
	    weatherType = getWeatherType(bigForecast.query.results.channel.item.forecast[i].code);
		fourDayFc[i] = new Object();
		fourDayFc[i].temp = convertTemp(bigForecast.query.results.channel.item.forecast[i].high);
		fourDayFc[i].image = getWeatherSvg(night, weatherType);
		fourDayFc[i].text = weatherType;
		
	}
		 
	return fourDayFc;

}

function isNight(sunrise, sunset) {
	
    /* Returns true if before sunrise or after sunset, to allow correct
       weather image svg selection */
       
    var d = new Date();
    var now = new Date();
    var night = false;
    
    d = dateFromTimeString(sunrise);
    
    if (now < d) {
    	night = true;
    }
    
    else {
    	d = dateFromTimeString(sunset);
    	
    	if (now > d) {
    		night = true;
    	}
    }
 
    return night;
    
}

function dateFromTimeString(timeString) {

    /* Returns a date object with today's date and time set to
       timeString.  For converting Yahoo sunset and sunrise strings
       into useful format */
       
    var d = new Date();
    
    /* Find the colon */
    var colonIndex = timeString.indexOf(":");
    
    /* Get "am" or "pm" */
    var amOrPm = timeString.slice(-2);
    
    /* Slice out the hours and minutes and pad if necessary */
    var hours = timeString.slice(0,colonIndex);
    var minutes = timeString.slice(colonIndex+1);
    minutes = minutes.slice(0, minutes.length-3);
    
    if (amOrPm == "pm") {
    	hours = (parseInt(hours) + 12).toString();
    }
    
    if (hours < 10) {
     	hours = "0" + hours;
     }
    
    if (minutes < 10) {
    	minutes = "0" + minutes;
    }
    
    /* Put hours and minutes in date object and return */
    d.setHours(hours);
    d.setMinutes(minutes);
  
    return d;  
	
}

function getWeatherType(weatherCode) {
	
    var weatherType;
    
	/* Switch on weather code and set weather type */
	switch (weatherCode) { 

        /* Calling all these rain! */
		case "0": //	tornado
		case "1": //	tropical storm
		case "2": //	hurricane
		case "3": //	severe thunderstorms
		case "4": //	thunderstorms
		case "5": //	mixed rain and snow
		case "6": //	mixed rain and sleet
		case "8": //	freezing drizzle
		case "9": //	drizzle
		case "10": //	freezing rain
		case "11": //	showers
		case "12": //	showers
		case "18": //	sleet
		case "37": //	isolated thunderstorms
		case "38": //	scattered thunderstorms
		case "39": //	scattered thunderstorms
		case "40": //	scattered showers
		case "45": //	thundershowers
		case "47": //	isolated thundershowers
		case "35": //	mixed rain and hail
		    weatherType = "Rainy";
			break;
		/* Snow */
		case "7": //	mixed snow and sleet
		case "13": //	snow flurries
		case "14": //	light snow showers
		case "15": //	blowing snow
		case "16": //	snow
		case "17": //	hail
		case "41": //	heavy snow
		case "42": //	scattered snow showers
		case "43": //	heavy snow
		case "46": //	snow showers
		    weatherType = "Snowy";
			break;
        /* Clouds */
		case "20": //	foggy
		case "26": //	cloudy
		case "27": //	mostly cloudy (night)
		case "28": //	mostly cloudy (day)
		case "29": //	partly cloudy (night)
		case "30": //	partly cloudy (day)
		case "44": //	partly cloudy
		    weatherType = "Cloudy";
			break;
		/* Clear night */
		case "31": //	clear (night)
		case "33": //	fair (night)
		    weatherType = "Clear";
			break;
		/* Sunny day */
		case "19": //	dust
		case "21": //	haze
		case "22": //	smoky
		case "23": //	blustery
		case "24": //	windy
		case "25": //	cold
		case "32": //	sunny
		case "34": //	fair (day)
		case "36": //	hot
		case "3200": //	not available
		default:
		    weatherType = "Sunny";
			break;
				
	}
	
	return weatherType;
	
}

function getWeatherSvg(night, weatherType) {

    var weatherSvg;
    
	/* Return the name of the appropriate svg file */
	
	if (night == true) {
		
		switch (weatherType) {
			case "Sunny": //Shouldn't happen, but just in case
			case "Clear":
			default:
			    weatherSvg = "svg/moon.svg";
			    break;
			case "Cloudy":
				weatherSvg = "svg/nightcloud.svg";
				break;
			case "Rainy":
				weatherSvg = "svg/nightrain.svg";
				break;
			case "Snowy":
				weatherSvg = "svg/nightsnow.svg";
				break;
		}
		
	} else {
		
		switch (weatherType) {
			case "Sunny": 
			case "Clear": //Shouldn't happen, but just in case
			default:
			    weatherSvg = "svg/sun.svg";
			    break;
			case "Cloudy":
				weatherSvg = "svg/cloud.svg";
				break;
			case "Rainy":
				weatherSvg = "svg/rain.svg";
				break;
			case "Snowy":
				weatherSvg = "svg/snow.svg";
				break;
		}		
	}
	
	return weatherSvg;
}
