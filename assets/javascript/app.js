$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBxDNKOCEjDG2FzG8vpUgmTsAzsa0umdHs",
        authDomain: "mheins-train-scheduler.firebaseapp.com",
        databaseURL: "https://mheins-train-scheduler.firebaseio.com",
        projectId: "mheins-train-scheduler",
        storageBucket: "",
        messagingSenderId: "475274557546"
    };
    firebase.initializeApp(config);

    // Assign the reference to the database to a variable named 'database'
    var database = firebase.database();

    // Initialize Global Variables
    var sv;
    var name;
    var destination;
    var firstTrainTime;
    var frequency;

    var nextArrival;
    var minutesAway;


    // Add Train
    $("#add-new").on("click", function () {
        // Don't refresh the page!
        event.preventDefault();

        // Grab data input
        name = $("#train-name-input").val().trim();
        destination = $("#destination-input").val().trim();
        firstTrainTime = $("#first-train-time-input").val().trim();
        frequency = $("#frequency-input").val().trim();

        // Check that data was grabbed correctly
        console.log(name);
        console.log(destination);
        console.log(firstTrainTime);
        console.log(frequency);

        // Send data to firebase
        database.ref('/CurrentTrains').push({
            name: name,
            destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        //Clear input fields
        clearInputs();
    });

    function clearInputs() {
        $('#train-name-input').val("");
        $('#destination-input').val("");
        $('#first-train-time-input').val("");
        $('#frequency-input').val("");
    }

    function calcNextArrival() {
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("HH:mm"));
        console.log("FIRST TIME: " + sv.firstTrainTime);
        var firstTimeConverted = moment(sv.firstTrainTime, "HH:mm");
        console.log("FIRST TIME CONVERTED: " + firstTimeConverted.format("HH:mm"));
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        //Calculate Next Arrival and minutes based on if time is in the future
        if (moment(currentTime).isBefore(firstTimeConverted)) {
            // if first train time is in future
            console.log("before");
            nextArrival = moment(sv.firstTrainTime, "HH:mm");
            // Minute Until Train, since time is in future minutes will be negative. Multiply by -1 to make positive and add 1.
            minutesAway = (diffTime * -1) + 1;
            console.log("MINUTES TILL TRAIN: " + minutesAway);
        } else {
            // if first train time is in past
            // Time apart (remainder)
            var tRemainder = diffTime % sv.frequency;
            console.log("TIME Remaining: " + tRemainder);
            // Minute Until Train
            minutesAway = sv.frequency - tRemainder;
            console.log("MINUTES TILL TRAIN: " + minutesAway);
            // Next Train
            nextArrival = moment().add(minutesAway, "minutes");
            console.log("ARRIVAL TIME: " + moment(nextArrival).format("hh:mm A"));
        }

    }

    // Load data from firebase add data to employee table
    database.ref('/CurrentTrains').orderByChild("dateAdded").on("child_added", function (snapshot) {
        // Store data in variable sv
        sv = snapshot.val();

        // Check that data was loaded correctly
        console.log(sv);

        //Calculate months worked
        calcNextArrival();

        //Create Rows for employee table
        var tTr = $("<tr>");

        var tTd = $("<td>");
        tTd.append(sv.name);
        tTr.append(tTd);

        tTd = $("<td>");
        tTd.append(sv.destination);
        tTr.append(tTd);

        tTd = $("<td>");
        tTd.append(sv.frequency);
        tTr.append(tTd);

        tTd = $("<td>");
        tTd.append(moment(nextArrival).format("hh:mm A"));
        tTr.append(tTd);

        tTd = $("<td>");
        tTd.append(minutesAway);
        tTr.append(tTd);

        //Append New rows to employee tables body
        $("#train-table-body").append(tTr);
    });

    /***
     ScheduledExecutorService executorService = Executors.newScheduledThreadPool(3);
     executorService.schedule(task1,5, TimeUnit.MINUTES);

     function task1() {
    console.log("Schedule");
} ***/

});
