/**********************************************
* Name: Mike Thweatt
* Class: CS290
* Due Date: 08-13-17
* Description: Activity Tracker - Final Project
***********************************************/

//Add new item to database
document.getElementById('newList').addEventListener('click', function addItem(event){
	event.preventDefault();
	if(document.getElementById("name").value == ""){
		alert("Please enter a value for the Activity Name");
	} else {
		var newActivity = {
			name: document.getElementById("name").value,
			reps: document.getElementById("reps").value,
			weight: document.getElementById("weight").value,
			date: document.getElementById("date").value,
			lbs: document.getElementById("lbs").value
		};
		
		//Edit existing entry
		if(document.getElementById("newList").value == "Edit Activity"){
			//Add id to object
			newActivity.id = document.getElementById("editID").value
			
			var req = new XMLHttpRequest(); //Create new request
			req.open("POST", "/edit", true); //Open asynchronous request
			req.setRequestHeader('Content-Type', 'application/json');
			
			req.addEventListener('load', function(){
				if(req.status >= 200 && req.status < 400){
					var response = JSON.parse(req.responseText);
					if (response.success == true)
						buildTable();
					else
						alert("Error while editing activity");
					
				} else {
					//Display any errors
					alert("Error in network request: " + req.statusText);
				}
			});
			//Send request
			req.send(JSON.stringify(newActivity));
			
		
		//Add new entry
		} else {
			var req = new XMLHttpRequest(); //Create new request
			req.open("POST", "/insert", true); //Open asynchronous request
			req.setRequestHeader('Content-Type', 'application/json');
			
			req.addEventListener('load', function(){
				if(req.status >= 200 && req.status < 400){
					var response = JSON.parse(req.responseText);
					if (response.success == true)
						buildTable();
					else
						alert("Error while adding new activity");
					
				} else {
					//Display any errors
					alert("Error in network request: " + req.statusText);
				}
			});
			//Send request
			req.send(JSON.stringify(newActivity));
		}
	}
});

//Delete an item from the database (runs off delete buttons in table rows)
function deleteID(id){
	event.preventDefault();
	var deleteActivity = {id: id};
	
	var req = new XMLHttpRequest(); //Create new request
	req.open("POST", "/delete", true); //Open asynchronous request
	req.setRequestHeader('Content-Type', 'application/json');
	
	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			var response = JSON.parse(req.responseText);
			if (response.success == true)
				buildTable();
			else
				alert("Error while deleting activity # " + id);
		} else {
			//Display any errors
			alert("Error while deleting the activity: " + req.statusText);
		}
	});
	//Send request
	req.send(JSON.stringify(deleteActivity));
};

//Edit an item from the database (runs off edit buttons in table rows)
//Returns a single DB entry to put the details back into the form
function editID(id){
	event.preventDefault();
	var editActivity = {id: id};
	
	var req = new XMLHttpRequest(); //Create new request
	req.open("POST", "/query", true); //Open asynchronous get request
	req.setRequestHeader('Content-Type', 'application/json');
	
	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			var response = JSON.parse(req.responseText);
			var activity = JSON.parse(response.results);
			if (response.success == true){
				//Fill in the form with the details
				formFill(activity);
			} else {
				alert("Error while getting edit details for activity # " + id);
			}
		} else {
			//Display any errors
			alert("Error while deleting the activity: " + req.statusText);
		}
	});
	//Send request
	req.send(JSON.stringify(editActivity));
};

//Puts the details from a query back into the form
function formFill(activity){
	//Fill in activity details to form
	document.getElementById("name").value = activity[0].name;
	document.getElementById("reps").value = activity[0].reps;
	document.getElementById("weight").value = activity[0].weight;
	document.getElementById("date").value = activity[0].date.slice(0,10);
	document.getElementById("lbs").value = activity[0].lbs;
	//Fill in the id number for reference
	document.getElementById("editID").value = activity[0].id;
	//Update the button to reflect 'edit'
	document.getElementById("newList").value = "Edit Activity"
};

//Delete & rebuild table
document.getElementById('newTable').addEventListener('click', function newTable(event){
	event.preventDefault();
	var req = new XMLHttpRequest(); //Create new request
	req.open("GET", "/Reset-Table", true); //Open asynchronous request
	
	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			activitiesSpan("Your table has been created");
		} else {
			//Display any errors
			alert("Error in Create Table Request: " + req.statusText);
		}
	});
	req.send(null);
});

//Build and display table
function buildTable(){
	var req = new XMLHttpRequest(); //Create new request
	req.open("POST", "/get-table", true); //Open asynchronous request
	req.setRequestHeader('Content-Type', 'application/json');
	
	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			var response = JSON.parse(req.responseText);
			var table = JSON.parse(response.results);
			if (table.length > 0){
				drawTable(table);
			} else	{
				activitiesSpan("There are currently no activities to display");
			}
		} else {
			//Display any errors
			alert("Error in Build Table Request: " + req.statusText);
		}
	});
	req.send();
};

//Create a span for activity log verbiage
function activitiesSpan(text){
	//Delete 'no activities' text if it exists
	var currentSpan = document.getElementById('noActivities');
	if(currentSpan)
			currentSpan.parentNode.removeChild(currentSpan);
	
	//Delete table if it exists
	var currentTable = document.getElementById('activityTable');
	if(currentTable)
		currentTable.parentNode.removeChild(currentTable);
	
	var newSpan = document.createElement("span");	
	newSpan.id = "noActivities";
	newSpan.textContent = text;
	document.getElementById('resultsText').appendChild(newSpan);
};

//Create and display the activity log table
function drawTable(table){
	//Delete 'no activities' text if it exists
	var currentSpan = document.getElementById('noActivities');
	if(currentSpan)
			currentSpan.parentNode.removeChild(currentSpan);
	//Delete table if it exists
	var currentTable = document.getElementById('activityTable');
	if(currentTable)
		currentTable.parentNode.removeChild(currentTable);
	
	//Create new table element
	var newTable = document.createElement("table");
	newTable.id = "activityTable";
    //Header row
	var newRow = document.createElement("tr");
	//Append row to table
	newTable.appendChild(newRow);
	//Create header cells
	var newItem = document.createElement("th");
	newItem.textContent = "Activity";
	newRow.appendChild(newItem);
	var newItem = document.createElement("th");
	newItem.textContent = "# of Reps";
	newRow.appendChild(newItem);
	var newItem = document.createElement("th");
	newItem.textContent = "Weight";
	newRow.appendChild(newItem);
	var newItem = document.createElement("th");
	newItem.textContent = "Date";
	newRow.appendChild(newItem);
	var newItem = document.createElement("th");
	newItem.textContent = "LBS";
	newRow.appendChild(newItem);
	var newItem = document.createElement("th");
	newItem.textContent = "";
	newRow.appendChild(newItem);
	var newItem = document.createElement("th");
	newItem.textContent = "";
	newRow.appendChild(newItem);
	
	
	//Loop through activities
	for (i = 0; i < table.length; i++){
		//Create new row element
		var newRow = document.createElement("tr");
			//Append row to table
			newTable.appendChild(newRow);
			
			//Create 'cells' for the row
			//Activity name
			var newCell = document.createElement("td");
				newCell.textContent = table[i].name;
				newRow.appendChild(newCell);
			
			//# of reps
			var newCell = document.createElement("td");
				newCell.textContent = table[i].reps;
				newRow.appendChild(newCell);
			
			//Weight
			var newCell = document.createElement("td");
				newCell.textContent = table[i].weight;
				newRow.appendChild(newCell);
			
			//Date
			var newCell = document.createElement("td");
				newCell.textContent = table[i].date.slice(0,10);
				newRow.appendChild(newCell);
			
			//LBS
			var newCell = document.createElement("td");
				newCell.textContent = table[i].lbs;
				newRow.appendChild(newCell);
			
			//Edit button
			var newCell = document.createElement("td");
				var newButton = document.createElement("input");
					newButton.type = "submit";
					newButton.value = "Edit";
					newButton.id = table[i].id;
					newButton.addEventListener('click', function(event){
						editID(this.id);
					});
					newCell.appendChild(newButton);
				newRow.appendChild(newCell);
				
			//Delete Button
			var newCell = document.createElement("td");
				//Button
				var newButton = document.createElement("input");
					newButton.type = "submit";
					newButton.value = "Delete";
					newButton.id = table[i].id;
					newButton.addEventListener('click', function(event){
						deleteID(this.id);
					});
					newCell.appendChild(newButton);
				newRow.appendChild(newCell);
	}
	
    document.getElementById('resultsText').appendChild(newTable);
};

//Reset the "add activity" button when the form is reset
document.getElementById('resetForm').addEventListener('click', function addItem(event){
	document.getElementById('newList').value = "Enter Activity"
	document.getElementById('editID').value = "";
});

//Build table when page first loads
buildTable();