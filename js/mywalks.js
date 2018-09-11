$(function() {

    var i;
    
	/* Get user name, put in session storage and display on page */
    var userName = prompt("Please enter your name");
  
    if (userName == null) {
      
        // If user clicked cancel, use a default
        userName ="Default User";
        
    } else if (userName == "") {
        userName ="Default User";
    }
  
    sessionStorage.setItem('userName', userName);
    $("<div class='alert alert-info'><span class='glyphicon glyphicon-user'></span> " + userName + "</div>").appendTo('#userName')

    var today = new Object();
  
    /* Default date and time form fields to now */
    today = getToday();
    document.getElementById('walkDate').value = today.date;
    document.getElementById('walkTime').value = today.time;

    var retObj = new Object();
  
    /* Read stored walks from local storage and add to table */
    for (i=0; i<localStorage.length; i++) {
  
        retObj = JSON.parse(localStorage.getItem(localStorage.key(i)));
    
        /* Only show the user their own walks */
        if (retObj.user.toLowerCase() == userName.toLowerCase()) {
    
            $("<tr id='" + localStorage.key(i) + 
					    "'><td>" + convertDate(retObj.date) + 
					    "</td><td>" + retObj.time + 
					    "</td><td>" + retObj.details + 
					    "</td><td>" + retObj.dur + 
 	            "</td><td>" + retObj.weather + 
					    "</td><td><button class='buttonDel btn btn-info btn-sm'>" +
					    "<span class='glyphicon glyphicon-trash'></span> Delete</button></td></tr>").appendTo("#walkTable");   
					   
        } 
		      
    }
	
    $('#clearWalks').click(function(event) {
  
        /* Remove only this user's walks from local storage and remove all the rows from table */
        for (i=localStorage.length-1; i>=0; i--) {
    
            retObj = JSON.parse(localStorage.getItem(localStorage.key(i)));
      
            if (retObj.user.toLowerCase() == userName.toLowerCase()) {
          
                localStorage.removeItem(localStorage.key(i));
            
            }
		}

        $('#walkTable tbody tr').remove();
    
    });
  
    $('#walkTable').on('click', '.buttonDel', function() {
	
	    /* Get the clicked row */
		var row = $(this).closest('tr');
		/* Get the row index, remove the item from localStorage object then delete the table row */
		var index = row.attr('id');
		localStorage.removeItem(index);
		row.remove();
			      
    });
  
});

function getToday() {

    /* Wrangle current date and time into format expected by inputs
       there MUST be an easier way to do this! */
    var d = new Date();
    var result = new Object();
  
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var hour = d.getHours();
    var minutes = d.getMinutes();

    if (day < 10) {
        day = "0" + day;
    }
  
    if (month < 10) {
        month = "0" + month;
    } 
  
    if (hour < 10) {
        hour = "0" + hour;
    }
    
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    result.date = d.getFullYear() + "-" + month + "-" + day;
    result.time = hour + ":" + minutes;
  
    return result;
  
}

function convertDate(storedDate) {

    /* Convert date into display format */  
    var d = new Date(storedDate);
  
    var day = d.getDate();
    var month = d.getMonth() + 1;

    if (day < 10) {
        day = "0" + day;
    }
  
    if (month < 10) {
        month = "0" + month;
    } 
  
    return (day + "/" + month + "/" + d.getFullYear());
  
}

function addNewWalk() {

    /* Called once all form fields validated */
    
    /* Set key to be current time */
    var walkObj = new Object(); 
    var d = new Date();
    var key = (d.getTime()).toString();
   
    /* Get values from inputs */
    walkObj.user = sessionStorage.getItem('userName');
	walkObj.date = document.getElementById('walkDate').value;
	walkObj.time = document.getElementById('walkTime').value;
	walkObj.details = document.getElementById('walkDesc').value;
	walkObj.dur = document.getElementById('walkDur').value;
	walkObj.weather = document.querySelector('input[name="walkWeather"]:checked').value;
 
    /* Stringify and store in localStorage */
    var walkJSON = JSON.stringify(walkObj);
    localStorage.setItem(key, walkJSON);   

    /* Add to table */
    $("<tr id='" + key + 
      "'><td>" + convertDate(walkObj.date) + 
      "</td><td>" + walkObj.time + 
      "</td><td>" + walkObj.details + 
      "</td><td>" + walkObj.dur + 
 	    "</td><td>" + walkObj.weather + 
      "</td><td><button class='buttonDel btn btn-info btn-sm'>" +
      "<span class='glyphicon glyphicon-trash'></span> Delete</button></td></tr>").appendTo("#walkTable");  
  
}