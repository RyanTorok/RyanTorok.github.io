const week = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

$(document).ready(function () {
    $("#js-warning").css("display", "none");
    var dayInView = new Date();
    var schedule;
    
    function updateScheduleUI(json, dateOffset) {
        let schedule_obj = JSON.parse(json);
        if (schedule_obj["success"]) {
            // Clear alerts
            document.getElementById("alerts").innerHTML = "";
            $(".schedule-row").remove();
            schedule = schedule_obj["schedule"];
            var rows = [];
            for (var day = 0; day < 7; day++) {
                let daySchedule = schedule[day];
                // Set the day in the header
                $(".day").eq(day).text(daySchedule["day"]);
                var sessions = daySchedule["sessions"];
                for (var s = 0; s < sessions.length; s++) {
                    // If we don't have a row for this session yet, create it.
                    if (s >= rows.length) {
                        let row = document.createElement("tr");
                        row.className = "schedule-row";
                        row.setAttribute("id", "session-" + s);
                        document.getElementById("schedule-table-body").appendChild(row);
                        rows[s] = row;
                    }
                    // Insert 7 dummy td entries that can be populated
                    var entry = document.createElement("td");
                    entry.setAttribute("id", "session-" + day + "-" + s);
                    if (day == 0 || day == 6) {
                        entry.className = "schedule-entry weekend " + sessions[s]["status"];
                    } else {
                        entry.className = "schedule-entry weekday " + sessions[s]["status"];
                    }
                    // Add alerts for unavailable slots
                    if (sessions[s]["status"] == "unavailable") {
                        let reason = sessions[s]["details"];
                        if (reason.length > 0) {
                            let alert = document.createElement("p");
                            alert.setAttribute("class", "alert");
                            alert.textContent = "Scheduling alert: " + reason;
                            document.getElementById("alerts").appendChild(alert);
                        }
                    }
                    entry.textContent = sessions[s]["time"].trim()
                    for (var i = rows[s].children.length; i < day; i++) {
                        // Dummy td entries as padding
                        var pad = document.createElement("td");
                        pad.setAttribute("id", "session-" + i + "-" + s);
                        pad.className = "schedule-pad";
                        rows[s].appendChild(pad);
                    }
                    rows[s].appendChild(entry);
                }
            }
            // JQuery class selectors aren't "retroactive", so we have to
            // reapply this rule every time we update the schedule table.
            $(".vacant").click(function() {
                let a = $(this).attr("id").split("-");
                let col = a[1];
                let row = a[2];
                let session = schedule[col]["sessions"][row];
                console.log(schedule);
                window.location.href = "/tutor/registration?year=" + session["year"] +
                    "&month=" + session["month"] +
                    "&date=" + session["date"] +
                    "&hour=" + session["hour"] +
                    "&minute=" + session["minute"] +
                    "&day=" + week[session["day"]];
            });
        } else {
            // Reset the day to what we had
            dayInView.setDate(dayInView.getDate() - dateOffset);
        }
    }
    
    function refreshSchedule(dateOffset) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    updateScheduleUI(xmlHttp.responseText, dateOffset);
                } else {
                    dayInView.setDate(dayInView.getDate() - dateOffset);
                }
            }
        };
        // Initialize schedule with the right week.
        // The server is smart enough to find the start of the week
        // whenever we supply any date within the week.
        let year = dayInView.getFullYear();
        // Server expects 1-indexed (calendar) month
        let month = dayInView.getMonth() + 1;
        let day = dayInView.getDate();
        xmlHttp.open(
            "GET",
            "/tutor/get_schedule?year=" + year + "&month=" + month + "&day=" + day
            , true
        );
        xmlHttp.send(null);
    }

    function populateAlerts() {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let obj = JSON.parse(xmlHttp.responseText);
                    for (var i = 0; i < obj.length; i++) {
                        var alert_text = document.createElement("p");
                        alert_text.className = "alert-text";
                        alert_text.textContent = "Scheduling alert: " + obj[i];
                        $("#alerts").addChild(alert_text);
                    }
                } else {
                    // TODO set error field
                }
            }
        };
        xmlHttp.open(
            "GET",
            "/tutor/alerts"
            , true
        );
        xmlHttp.send(null);
    }

    $("#book-button").click(function () {
        $(".barMenu").eq(5).click();
    });

    $("#forward").click(function () {
        dayInView.setDate(dayInView.getDate() + 7);
        refreshSchedule(7);
    });

    $("#backward").click(function () {
        dayInView.setDate(dayInView.getDate() - 7);
        refreshSchedule(-7);
    });

    $("#refresh").click(function () {
        refreshSchedule(0);
    });

    refreshSchedule(0);

    if (window.location.hash == "#schedule") {
        $(".barMenu").eq(5).click();
    }
});
