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

const locations = new Map();
locations.set("Sunday", "Boston University, Center for Computing and Data Sciences");
locations.set("Monday", "Harvard University, Science and Engineering Complex");
locations.set("Tuesday", "MIT, Stata Center");
locations.set("Wednesday", "Northeastern University, West Village H");
locations.set("Thursday", "Harard University, Science and Engineering Complex");
locations.set("Friday", "MIT, Stata Center");
locations.set("Saturday", "Boston College, 245 Beacon Street");

$(document).ready(function() {
    $("#js-warning").css("display", "none");
    $(".loader").css("display", "none");
    let existing = urlParams.get("existing");
    var year, month, date, hour, day, minute;
    if (existing) {
        $("#session-info").css("display", "none");
    } else {
        $("#login").css("display", "none");
        $("#cancel").css("display", "none");
        year = urlParams.get("year");
        month = urlParams.get("month");
        date = urlParams.get("date");
        hour = urlParams.get("hour");
        day = urlParams.get("day");
        minute = urlParams.get("minute");
        populateDate(year, month, date, hour, day, minute);
    }

    // Disambiguates whether the first row of name/email fields is an already
    // registered student (which can be updated) or a new student.
    var alreadyRegistered = 0;
    var owner = null;
    
    var credential_count = 0;

    function setRemoveVisible() {
        if ($(".remove").length <= 1) {
            $(".remove").css("display", "none");
        } else {
            // Only show remove buttons for new students
            $(".credentials").each(function() {
                if ($(this).children().eq(2).children().eq(1).prop("disabled")) {
                    $(this).children().eq(1).children().eq(3).css("display", "none");
                } else {
                    $(this).children().eq(1).children().eq(3).css("display", "");
                }
            });
        }
    }

    function addStudentRow(fixed) {
        let num = credential_count++;
        let html = `
            <div class="credentials" id="credentials-` + num + `">
              <div class\"credential-entry\">
                <label for="first-` + num + `">First Name</label>
                <input class="first" id="first-` + num + `" type="text" maxlength="24"/>
              </div>
              <div class\"credential-entry\">
                <label for="last-` + num + `">Last Name</label>
                <input class="last" id="last-` + num + `" type="text" maxlength="24"/>
                <p class="confirmed" id="confirmed-` + num + `"></p>
                <p class="remove button" id="remove-` + num + `">Remove</p>
              </div>
              <div class\"credential-entry\">
                <label for="email-` + num + `">Email</label>
                <input class="email" id="email-` + num + `" type="email" maxlength="48"/>
              </div>
            </div>
        `;
        $("#credentials-block").append(html);
        $("#remove-" + num).click(function() {
            $(this).parents().eq(1).remove();
            setRemoveVisible();
        });
        setRemoveVisible();
        return num;
    }

    // Set up "Add another student" click handler
    $("#add-student").click(function() {
        addStudentRow(false);
    });
    
    $("#back").click(function() {
        window.location.href = "/tutor#schedule"
    });


    addStudentRow(false);

    function populateDate(year, month, date, hour, day, minute) {
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
        let short_title = year + "-" + String(month).padStart(2, '0') + "-" +
            String(date).padStart(2, '0') + " at " + time;
        document.title = short_title;
        document.getElementById("datetime").textContent = long_title;
        document.getElementById("in-person-label").textContent = "In Person (" +
            locations.get(day) + ")";
    }

    function setConfirmed(success, index) {
        var cf = $("#confirmed-" + index);
        if (success) {
            cf.text("Confirmed");
            cf.css("color", "lightgreen");
        } else {
            cf.text("Unconfirmed");
            cf.css("color", "red");
        }
    }

    function populate(json) {
        var obj = JSON.parse(json);
        if (obj["success"]) {
            obj = obj["registration"];
            year = obj["year"];
            month = obj["month"];
            date = obj["date"];
            day = obj["day"];
            hour = obj["hour"];
            minute = obj["minute"];
            populateDate(
                obj["year"],
                obj["month"],
                obj["date"],
                obj["hour"],
                week[obj["day"]],
                obj["minute"] + "",
            );
            document.getElementById("first-0").value = obj["first"];
            document.getElementById("last-0").value = obj["last"];
            document.getElementById("email-0").value = obj["email"];
            $("#email-0").prop("disabled", true);
            document.getElementById("remote").checked = obj["remote"];
            document.getElementById("in-person").checked = !obj["remote"];
            document.getElementById("topic").value=obj["topic"];
            document.getElementById("other").value = obj["other"];
            document.getElementById("description").value = obj["description"];
            document.getElementById("languages").value = obj["languages"];
            setConfirmed(obj["confirmed"], 0);
            // Add other students on this registration if we have them.
            let others = obj["other_students"];
            alreadyRegistered = 1;
            // This can be called multiple times to reset which entries are
            // fixed so the user can't accidentally double-add a new student,
            // so we have to remove any rows we already had.
            for (var i = $(".credentials").length - 1; i >= 1; i--) {
                $(".credentials").eq(i).remove();
            }
            others.forEach(function(s) {
                let count = addStudentRow(true);
                let ids = ["first", "last", "email"];
                for (var i = 0; i < ids.length; i++) {
                    let field = $("#" + ids[i] + "-" + count);
                    field.prop("value", s[ids[i]]);
                    field.prop("disabled", true);
                    setConfirmed(s["confirmed"], count);
                }
                alreadyRegistered++;
            });
            $("#session-info").css("display", "");
            $("#login").css("display", "none");
            setRemoveVisible();
            clearStatus();
        } else {
            status(
                "Unable to retrieve your registration information from the \
                 server: " +
                    obj["reason"], "red");
        }
    }

    function status(msg, color) {
        $(".status").text(msg);
        $(".status").css("color", color);
    }

    function clearStatus() {
        $(".status").text("");
    }

    function updateSuccess(newRegs, total) {
        var msg;
        if (newRegs == total && total == 1) {
            msg = "Registration successful. Please check the email you \
                   provided for a confirmation email. You must confirm your \
                   registration within 10 minutes or you will forefit your \
                   chosen time slot.";
            $("#submit").css("display", "none");
        }
        else if (newRegs == total) {
            msg = "Registration successful. Please check the emails you \
                   provided for a confirmation email. Each student must \
                   confirm your registration within 10 minutes or they \
                   will be dropped from your group. If no students \
                   confirm, you will forefit your chosen time slot.";
            $("#submit").css("display", "none");
        } else if (newRegs > 0) {
            msg = "Update successful. Please inform the new student(s) you added \
                   to this registration to check the email you provided for a \
                   confirmation email. New students must confirm their \
                   reservation within 10 minutes or they will be dropped from \
                   your group.";
            // If we add new students to an existing reservation, we want to
            // reload the credentials UI so the user cannot accidentally add the
            // new student twice (e.g. by clicking the submit button again).
            //
            // This isn't a problem for entirely new reservations, because the
            // access code isn't available to the page and the user can't
            // successfully issue another request -- they'll get an error
            // message if they click submit again.
            submitAC();
        } else {
            msg = "Update successful.";
        }
        status(msg, "lightgreen");
    }

    // Ensure the user can't issue two submissions simultaneously, which could
    // allow duplicate adds when adding new students to an existing reservation.
    var canSubmit = true;

    $("#submit").click(function() {
        if (!canSubmit) {
            return;
        }
        canSubmit = false;
        let newRegistrations = 0;
        // Check inputs
        var classes = [".first", ".last", ".email"];
        var names = ["a first name", "a last name", "an email"];
        var success = true;
        for (var c = 0; c < classes.length; c++) {
            let cls = classes[c];
            var row = 1;
            $(cls).each(function() {
                if ($(this).prop("value").length == 0) {
                    status(
                        "Please enter " + names[c] + " for student #" + row + ".",
                        "red"
                    );
                    $(this).focus();
                    success = false;
                    return;
                }
                row += 1;
            });
            if (!success) {
                break;
            }
        }
        if (!success) {
            return;
        }
        if (!$("#in-person").prop("checked") && !$("#remote").prop("checked")) {
            status("Please indicate whether you are scheduling an in-person \
                    or remote session.", "red");
            $("#in-person").focus();
            return;
        }
        if ($("#topic").prop("value") == 0) {
            status("Please select a topic from the list.", "red");
            $("#topic").focus();
            return;
        }
        if ($("#topic").prop("value") == $("#opt-other").prop("value")
            && $("#other").prop("value").length == 0
           ) {
            status("Since you chose 'Other', please specify what you would \
                    to cover.", "red");
            $("#other").focus();
            return;
        }
        if ($("#description").prop("value").length == 0) {
            status(
                "Please provide a description of your goals for our session.",
                "red",
            );
            $("#description").focus();
            return;
        }
        var success = true;
        let n_rows = $("#credentials-block").children().length;
        var complete = [alreadyRegistered == 0, alreadyRegistered >= n_rows];
        for (var i = 0; i < n_rows; i++) {
            if (i == 0 && alreadyRegistered != 0) {
                // We loaded an existing registration, so we just need to update
                // it, not create a new registration.
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {
                    if (xmlHttp.readyState == 4) {
                        if (xmlHttp.status == 200) {
                            let json = JSON.parse(xmlHttp.responseText);
                            if (json["success"]) {
                                if (complete[1] && success) {
                                    updateSuccess(n_rows - alreadyRegistered, n_rows);
                                }
                            } else {
                                status(
                                    "Request error: " + json["reason"],
                                    "red",
                                );
                                success = false;
                            }
                            complete[0] = true;
                            if (complete[1]) {
                                $("#loader").css("display", "none");
                                canSubmit = true;
                            }
                        } else {
                            status(
                                "Sorry, we encountered an error processing your request.",
                                "red",
                            );
                            success = false;
                        }
                    }
                };
                // Row numbers may not be sequential if the user clicked remove
                // button(s), so we can't use hard-coded ids of the fields.
                // We do this instead.
                let jq_row = $("#credentials-block div").eq(i);
                let jq_first = jq_row.children().eq(0).children().eq(1).prop("value");
                let jq_last = jq_row.children().eq(1).children().eq(1).prop("value");
                xmlHttp.open(
                    "POST",
                    "/ops/tutor/update?" +
                        "owner=" + owner +
                        "&first=" + encodeURIComponent(jq_first) +
                        "&last=" + encodeURIComponent(jq_last) +
                        "&remote=" + $("#remote").prop("checked") +
                        "&topic=" + $("#topic").prop("value") +
                        "&other=" + encodeURIComponent($("#other").prop("value")) +
                        "&description=" + encodeURIComponent($("#description").prop("value")) +
                        "&languages=" + encodeURIComponent($("#languages").prop("value")) +
                        // TODO currently unused features
                        "&zelle_id=0" +
                        "&payment_mode=0"
                    , true
                );
                clearStatus();
                $("#loader").css("display", "");
                xmlHttp.send(null);
            }
        }
        if (n_rows > alreadyRegistered) {
            // We batch all new students in a single request, which is a
            // performance optimization for updates and actually required for
            // new schedulings, because we don't have an access code.
            var newRegXmlHttp = new XMLHttpRequest();
            newRegXmlHttp.onreadystatechange = function() { 
                if (newRegXmlHttp.readyState == 4) {
                    if (newRegXmlHttp.status == 200) {
                        let json = JSON.parse(newRegXmlHttp.responseText);
                        if (json["success"]) {
                            if (complete[0] && success) {
                                updateSuccess(n_rows - alreadyRegistered, n_rows);
                            }
                        } else {
                            status(
                                "Request error: " + json["reason"],
                                "red",
                            );
                            success = false;
                        }
                        complete[1] = true;
                        if (complete[0]) {
                            $("#loader").css("display", "none");
                            canSubmit = true;
                        }
                    } else {
                        status(
                            "Sorry, we encountered an error processing your request.",
                            "red",
                        );
                        success = false;
                    }
                }
            };
            // Row numbers may not be sequential if the user clicked remove
            // button(s), so we can't use hard-coded ids of the fields.  We do
            // this instead.

            var req = "/ops/tutor/schedule?";
            if (owner != null) {
                req += "owner=" + owner + "&";
            }
            for(var i = alreadyRegistered; i < n_rows; i++)  {
                let jq_row = $("#credentials-block div").eq(i);
                let jq_first = jq_row.children().eq(0).children().eq(1).prop("value");
                let jq_last = jq_row.children().eq(1).children().eq(1).prop("value");
                let jq_email = jq_row.children().eq(2).children().eq(1).prop("value");
            
                req += "first=" + encodeURIComponent(jq_first) +
                    "&last=" + encodeURIComponent(jq_last) +
                    "&email=" + encodeURIComponent(jq_email) + "&";
            }
            newRegXmlHttp.open(
                "POST",
                req + 
                    "year=" + year +
                    "&month=" + month +
                    "&day=" + date +
                    "&hour=" + hour +
                    "&remote=" + $("#remote").prop("checked") +
                    "&topic=" + $("#topic").prop("value") +
                    "&other=" + encodeURIComponent($("#other").prop("value")) +
                    "&description=" + encodeURIComponent($("#description").prop("value")) +
                    "&languages=" + encodeURIComponent($("#languages").prop("value")) +
                    // TODO currently unused features
                    "&zelle_id=0" +
                    "&payment_mode=0"
                , true
            );
            clearStatus();
            $("#loader").css("display", "");
            newRegXmlHttp.send(null);
        }
        
    });

    function submitAC() {
        // All filled up. Submit!
        owner = "";
        $(".ac-input").each(function() {
            owner += $(this).prop("value");
        });
        owner = owner.toUpperCase();
        clearStatus();
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4) {
                $("#ac-loader").css("display", "none");
                if (xmlHttp.status == 200) {
                    populate(xmlHttp.responseText);
                    document.getElementById("submit").textContent = "Update ✓";
                    $("#cancel").css("display", "");
                } else {
                    status(
                        "Unable to retrieve your registration information \
                             from the server.", "red"
                    )
                }
            }
        };
        xmlHttp.open(
            "POST",
            "/ops/tutor/view?owner=" + owner,
            true
        );
        clearStatus();
        $("#ac-loader").css("display", "");
        xmlHttp.send(null);
    }

    Array.prototype.forEach.call(
        document.getElementsByClassName("ac-input"),
        function(field) {
            field.addEventListener("input", function(event) {
                let fields = $(this).parents().eq(0).children();
                if (
                    fields.eq(0).prop("value").length == 4 &&
                        fields.eq(1).prop("value").length == 4 &&
                        fields.eq(2).prop("value").length == 4 &&
                        fields.eq(3).prop("value").length == 4
                ) {
                    submitAC();
                } else if (
                    $(this).index() < 3 &&
                        $(this).prop("value").length == 4
                ) {
                    $(this).parents().eq(0).children().eq($(this).index() + 1).focus();
                }
            });
        });

    $("#ac-submit").click(submitAC);
    
    $("#cancel").click(function () {
        if (!canSubmit) {
            return;
        }
        canSubmit = false;
        if (owner == null) {
            // This should be unreachable unless the HTML is manually modified
            // but this is a nice safety catch-all.
            return;
        }
        var msg = "Are you sure you want to cancel your reservation?";
        if (alreadyRegistered > 1) {
            msg += " (This will not cancel your other group members' registrations.)";
        }
        if (confirm(msg)) {
            status("Processing your request. This usually takes a few seconds. \
                Please wait...", "gold");
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4) {
                    $("#loader").css("display", "none");
                    if (xmlHttp.status == 200) {
                        var msg = "Cancellation successful.";
                        if (alreadyRegistered > 1) {
                            msg += " Only your registration was \
                                cancelled. If your entire group wishes to \
                                cancel, each student must do so separately.";
                        }
                        msg += " Click the button at the top to go back to the calendar.";
                        status(msg, "lightgreen");
                        canSubmit = true;
                    } else {
                        status(
                            "Unable to retrieve your registration information \
                             from the server.", "red"
                        )
                    }
                }
            };
            xmlHttp.open(
                "POST",
                "/ops/tutor/cancel?owner=" + owner,
                true
            );
            clearStatus();
            $("#loader").css("display", "");
            xmlHttp.send(null);
        }
    });                        
});
