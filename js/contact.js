$(function() {

    $('#resetContact').click(function(event) {
  
        /* Remove any alerts */ 
        $('.alert').remove();
    
    });
    
});

function storeData() {
    
    /* Called on successful validation of all form fields */

    /* In a real application, this would be sent to the server.  Put in session storage for now */
    var objDetails = new Object;
    objDetails.name = document.getElementById('conName').value;
    objDetails.dob = document.getElementById('conDOB').value;
    objDetails.email = document.getElementById('conEmail').value;
    objDetails.phone = document.getElementById('conTel').value;
    objDetails.enquiry = document.getElementById('conEnquiry').value;
    
    sessionStorage.setItem(sessionStorage.length, JSON.stringify(objDetails));
    
    /* Display a message saying data has been received */
    $("<div id='alertTY' class='alert alert-info'><span class='glyphicon glyphicon-check'>" + 
      "</span> Thank you for your query, we will respond as soon as possible!</div>").insertAfter("#formContact");
    
}