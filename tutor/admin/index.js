const urlParams = new URLSearchParams(window.location.search);
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const week = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const topics = [
    "Introductory Programming",
    "Data Structures and Algorithms",
    "Discrete Mathematics and Introductory CS Theory",
    "Differential and Integral Calculus",
    "Matrices and Linear Algebra",
    "Probability and Statistics",
    "Systems Programming in Unix",
    "Computer Architecture",
    "Databases and Storage Technologies",
    "Operating Systems",
    "Theoretical Algorithms",
    "Computer and Wireless Networking",
    "Distributed Systems",
    "Computer and Network Security",
    "Machine Learning",
    "Blockchains and Decentralization",
    "Other",
];

function populateDate(year, month, date, hour, day, minute) {
    minute = String(minute);
    if (minute.length < 2) {
        minute = "0" + minute;
    }
    // Convert 24-hour time to 12-hour time.
    var am_pm = " AM";
    if (hour == 0) {
        hour = 12;
    } else if (hour == 12) {
        am_pm = " PM";
    } else if (hour > 12) {
        hour -= 12;
        am_pm = " PM";
    }
    let time = hour + ":" + minute + am_pm;
    let long_title = day + ", " + months[month - 1] + " " + date + ", " + year +
        " at " + time;
    document.getElementById("datetime").textContent = long_title;
}

$(document).ready(function () {
    var admin_pw = "";
    var currentStatus = "";
    var currentSession = null;
    var rescheduleSession = null;
    var lastSessionIndex = -1;
    var lastDay = -1;
    var autoSetSession = false;
    var rescheduleMode = false;

    function showDetails(session) {
        currentSession = session;
        if (!autoSetSession) {
            clearStatus();
            autoSetSession = false;
        }
        populateDate(
            session["year"],
            session["month"],
            session["date"],
            session["hour"],
            week[session["day"]],
            session["minute"],
        );
        $("#status-text").prop("textContent", "Status: " + session["status"]);
        currentStatus = session["status"];
        if (currentStatus == "unavailable") {
            $("#change-availability").prop("textContent", "Make available");
            // Details is filled with a string containing the unavailable reason
            // if status = unavailable.
            var reason = session["details"];
            if (reason == "") {
                reason = "None";
            }
            $("#reason").prop("textContent", "Reason: " + reason);
            $("#reason-field").css("display", "none");
        } else {
            $("#change-availability").prop("textContent", "Make unavailable");
            $("#reason").prop("textContent", "");
            $("#reason-field").css("display", "");
            let details = JSON.parse(session["details"]);
            if (details.length > 0) {
                $("#occupied-info").css("display", "");
                $("#reschedule-toggle").css("display", "");
            } else {
                $("#occupied-info").css("display", "none");
                $("#reschedule-toggle").css("display", "none");
            }
            let registrants = document.getElementById("registrants");
            // Clear registrant list
            registrants.innerHTML = "";
            for (var i = 0; i < details.length; i++) {
                let registrantDetails = JSON.parse(details[i]);
                let registrant = document.createElement("div");
                let name = document.createElement("p");
                name.setAttribute("class", "registrant-name");
                name.textContent =
                    registrantDetails["first"] + " " +
                    registrantDetails["last"] + " (" +
                    registrantDetails["email"] + ") ";
                registrant.appendChild(name);
                let paid = document.createElement("p");
                registrant.appendChild(paid);
                paid.setAttribute("class", "paid");
                if (registrantDetails["paid"]) {
                    paid.textContent = "Paid";
                    paid.setAttribute("style", "color:lightgreen");
                } else {
                    paid.textContent = "Unpaid";
                    paid.setAttribute("style", "color:red");
                    // Make a widget to mark registration as paid.
                    let payWidget = document.createElement("div");
                    payWidget.setAttribute("class", "pay-widget");
                    // Variable `i` not vulnerable to XSS attacks -- it is
                    // internally generated and only ever a plain number.
                    payWidget.innerHTML = `
                    <label class="amount-label" for="amount-`+i+`">Amount $</label>
                    <input class="amount" id="amount-`+i+`" type="text" size="6" />
                    <input class="payment-method" id="zelle-`+i+`" type="radio"
                      name="registrant-`+i+`" value="0" />
                    <label for="zelle-`+i+`">ACH</label>
                    <input class="payment-method" id="cash-`+i+`" type="radio"
                      name="registrant-`+i+`" value="1" />
                    <label for="cash-`+i+`">Cash</label>
                    <input class="payment-method" id="check-`+i+`" type="radio"
                      name="registrant-`+i+`" value="2" />
                    <label for="check-`+i+`">Check</label>
                    <p class="button confirm-payment">Confirm payment</p>
                `;
                    registrant.appendChild(payWidget);
                }
                registrants.appendChild(registrant);
                $(".confirm-payment").click(function() {
                    let widget = $(this).parents().eq(0);
                    let amount = widget.find("input").eq(0).prop("value");
                    if (amount == "" || isNaN(amount)) {
                        status("Please enter a number in the amount field.", "red");
                        return;
                    }
                    var method = -1;
                    for (var i = 0; i < 2; i++) {
                        if (widget.find("input").eq(i + 1).prop("checked")) {
                            method = i;
                            break;
                        }
                    }
                    if (method == -1) {
                        status("Please choose a payment method.", "red")
                        return;
                    }
                    // Server guarantees to always return group members in the
                    // same order. We have to reply with the position in that
                    // order to indicate which member paid.
                    let payerIndex = widget.parents().eq(0).index();
                    confirmPayment(payerIndex, amount, method);
                });
            }
            if (details.length > 0) {
                let registrantDetails = JSON.parse(details[0]);
                if (registrantDetails["remote"]) {
                    $("#type").prop("textContent", "Meeting type: Remote");
                } else {
                    $("#type").prop("textContent", "Meeting type: In person");
                }
                var topic = topics[registrantDetails["topic"] - 1];
                if (topic == "Other") {
                    topic += "(" + registrantDetails["other"] + ")";
                }
                $("#topic").prop("textContent", "Topic: " + topic);
                $("#description").prop("textContent", "Description: " + registrantDetails["description"]);
                var languages = registrantDetails["languages"];
                if (languages == "") {
                    languages = "None";
                }
                $("#languages").prop("textContent", "Languages: " + languages);
            }
        }
        $("#details").css("display", "");
    }

    function selectNewTime(session) {
        rescheduleSession = session;
        status("Press Confirm to select new time.", "cyan");
        selectedNewTime = true;
        populateDate(
            session["year"],
            session["month"],
            session["date"],
            session["hour"],
            week[session["day"]],
            session["minute"],
        );
    }
    
    var dayInView = new Date();
    var schedule;
    function updateScheduleUI(json, dateOffset, setPassword) {
        let schedule_obj = JSON.parse(json);
        if (schedule_obj["success"]) {
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
                    entry.textContent = sessions[s]["time"].trim()
                    // Redeclare as new variables so we use the values of
                    // `sessions`, `day`, and `s` at the time for each entry.
                    let constSessions = sessions;
                    let constS = s;
                    let constDay = day;
                    entry.onclick = function() {
                        lastDay = constDay;
                        lastSessionIndex = constS;
                        if (rescheduleMode) {
                            selectNewTime(constSessions[constS]);
                        } else {
                            showDetails(constSessions[constS]);
                        }
                    };
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
            $("#login").css("display", "none");
            $("#calendar").css("display", "");
        } else {
            // Reset the day to what we had
            dayInView.setDate(dayInView.getDate() - dateOffset);
            if (setPassword) {
                $("#password-input").prop("value", "");
                status("Incorrect password!", "red");
            } else {
                status("An error occurred updating the schedule.", "red");
            }
            return false;
        }
        return true;
    }

    function clickCurrentEntry() {
        $("#schedule-table-body tr").eq(lastSessionIndex).find("td").eq(lastDay).click();
    }
    
    function refreshSchedule(dateOffset, setPassword, autoClick) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    updateScheduleUI(xmlHttp.responseText, dateOffset, setPassword);
                    if (autoClick) {
                        autoSetSession = true;
                        clickCurrentEntry();
                    }
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
            "/ops/tutor/get_schedule_admin?admin_pw=" + encodeURIComponent(admin_pw) + "&year=" + year + "&month=" + month + "&day=" + day
            , true
        );
        xmlHttp.send(null);
    }

    function makeSelectedSlotAvailable() {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let outcome = JSON.parse(xmlHttp.responseText);
                    if (outcome["success"]) {
                        refreshSchedule(0, false, true);
                        status("Successfully marked slot available.", "lightgreen");
                    } else {
                        status(
                            "Failed to mark slot available: "
                                + outcome["reason"],
                            "red"
                        );
                    }
                } else {
                    status(
                        "Failed to mark slot available: HTTP status code " +
                            xmlHttp.status,
                        "red"
                    );
                }
            }
        };
        if (currentSession == null) {
            return false;
        }
        xmlHttp.open(
            "POST",
            "/ops/tutor/make_available?admin_pw=" + encodeURIComponent(admin_pw) +
                "&year=" + currentSession["year"] +
                "&month=" + currentSession["month"] +
                "&day=" + currentSession["date"] +
                "&hour=" + currentSession["hour"]
            , true
        );
        xmlHttp.send(null);
        return true;
    }

    function makeSelectedSlotUnavailable() {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let outcome = JSON.parse(xmlHttp.responseText);
                    if (outcome["success"]) {
                        refreshSchedule(0, false, true);
                        status("Successfully marked slot unavailable.", "lightgreen");
                    } else {
                        status(
                            "Failed to mark slot unavailable: "
                                + outcome["reason"],
                            "red"
                        );
                    }
                } else {
                    status(
                        "Failed to mark slot unavailable: HTTP status code " +
                            xmlHttp.status,
                        "red"
                    );
                }
            }
        };
        if (currentSession == null) {
            return false;
        }
        xmlHttp.open(
            "POST",
            "/ops/tutor/make_unavailable?admin_pw=" + encodeURIComponent(admin_pw) +
                "&year=" + currentSession["year"] +
                "&month=" + currentSession["month"] +
                "&day=" + currentSession["date"] +
                "&hour=" + currentSession["hour"] +
                "&reason=" + encodeURIComponent($("#reason-field").prop("value"))
            , true
        );
        xmlHttp.send(null);
        return true;        
    }

    function confirmPayment(payerIndex, amount, method) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let outcome = JSON.parse(xmlHttp.responseText);
                    if (outcome["success"]) {
                        autoSetSession = true;
                        refreshSchedule(0, false, true);
                        status("Successfully sent payment confirmation.", "lightgreen");
                    } else {
                        status(
                            "Failed to send payment confirmation: "
                                + outcome["reason"],
                            "red"
                        );
                    }
                } else {
                    status(
                        "Failed to send payment confirmation: HTTP status code " +
                            xmlHttp.status,
                        "red"
                    );
                }
            }
        };
        if (currentSession == null) {
            return false;
        }
        xmlHttp.open(
            "POST",
            "/ops/tutor/mark_paid?admin_pw=" + encodeURIComponent(admin_pw) +
                "&year=" + currentSession["year"] +
                "&month=" + currentSession["month"] +
                "&day=" + currentSession["date"] +
                "&hour=" + currentSession["hour"] +
                "&index=" + payerIndex +
                "&paid=true" +
                "&payment_method=" + method +
                "&amount=" + amount
            , true
        );
        xmlHttp.send(null);
        return true;
    }

    function status(msg, color) {
        $(".status").text(msg);
        $(".status").css("color", color);
    }

    function clearStatus() {
        $(".status").text("");
    }


    $("#forward").click(function () {
        clearStatus();
        dayInView.setDate(dayInView.getDate() + 7);
        refreshSchedule(7, false);
    });
    $("#backward").click(function () {
        clearStatus();        
        dayInView.setDate(dayInView.getDate() - 7);
        refreshSchedule(-7, false);
    });
    $("#refresh").click(function () {
        clearStatus();
        refreshSchedule(0, false);
    });
    $("#password-submit").click(function () {
        clearStatus();        
        admin_pw = $("#password-input").prop("value");
        refreshSchedule(0, true);
    });
    $("#change-availability").click(function() {
        if (currentStatus == "unavailable") {
            if (!makeSelectedSlotAvailable()) {
                status("Error: no current session to make available.", "red");
            }
        } else {
            if (!makeSelectedSlotUnavailable()) {
                status("Error: no current session to make unavailable.", "red");
            }
        }
    });
    function setRescheduleMode(mode) {
        if (mode) {
            selectedNewTime = false;
            $("#reschedule-toggle").text("Cancel ↺");
            $("#reschedule-confirm").css("display", "");
            status("Select a new time and press Confirm.", "cyan");
        } else {
            $("#reschedule-toggle").text("Reschedule Session");
            $("#reschedule-confirm").css("display", "none");
            autoSetSession = true;
            populateDate(
                currentSession["year"],
                currentSession["month"],
                currentSession["date"],
                currentSession["hour"],
                week[currentSession["day"]],
                currentSession["minute"],
            );
            clearStatus();
        }
        rescheduleMode = mode;
    }
    $("#reschedule-toggle").click(function() {
        setRescheduleMode(!rescheduleMode);
    });
    $("#reschedule-confirm").click(function() {
        if (!selectedNewTime) {
            status("Select a new time before confirming reschedule.", "red");
        } else {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        let outcome = JSON.parse(xmlHttp.responseText);
                        if (outcome["success"]) {
                            autoSetSession = true;
                            currentSesssion = rescheduleSession;
                            refreshSchedule(0, false, true);
                            setRescheduleMode(false);
                            status("Reschedule successful.", "lightgreen");
                        } else {
                            status(
                                "Reschedule failed: " +
                                    outcome["reason"],
                                "red"
                            );
                        }
                    } else {
                        status(
                            "Reschedule failed: HTTP status code " +
                                xmlHttp.status,
                            "red"
                        );
                    }
                }
            };
            if (currentSession == null) {
                return false;
            }
            xmlHttp.open(
                "POST",
                "/ops/tutor/reschedule_admin?admin_pw=" + encodeURIComponent(admin_pw) +
                    "&from_year=" + currentSession["year"] +
                    "&from_month=" + currentSession["month"] +
                    "&from_day=" + currentSession["date"] +
                    "&from_hour=" + currentSession["hour"] +
                    "&to_year=" + rescheduleSession["year"] +
                    "&to_month=" + rescheduleSession["month"] +
                    "&to_day=" + rescheduleSession["date"] +
                    "&to_hour=" + rescheduleSession["hour"]
                    , true
            );
            xmlHttp.send(null);
            return true;
            
        }
    });
    $("#calendar").css("display", "none");
    $("#details").css("display", "none");
    $("#reschedule-confirm").css("display", "none");
});
