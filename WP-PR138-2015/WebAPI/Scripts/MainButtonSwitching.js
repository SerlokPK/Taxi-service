$(document).ready(function (status = true) {
    if (sessionStorage.getItem("logged") === null) {
        window.location.href = "/HTML/Registration.html";
    }

    let logUser = JSON.parse(sessionStorage.getItem("logged")); //vadim iz sesije korisnika i parsiram u JSON obj

    if (logUser.RoleString === 'Admin') {
        $('#btnchangeroles').show();
        $('#btnadmincrt').show();
        $('#btnacptreqadm').show();
        $('#btnalldrvs').show();
        //$('#spansrcnmlst').hide();
        let loggedUser = JSON.parse(sessionStorage.getItem("logged"));

        $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovog admina
            method: "GET",
            url: "/api/Voznja",
            dataType: "json",
            success: function (response) {
                $("#lblhome").empty();
                $('#lblhome').append('================Drives=====================');

                $.each(response, function (index, value) {
                    let startLoc;
                    let endLoc;
                    let comments = [];
                    if (value.AdminID != null && value.AdminID == loggedUser.Username) {
                        $.when(
                            $.ajax({                    //za svaku voznju vracam pocetnu lokaciju posebno
                                method: "GET",
                                url: "/api/Address",
                                data: { id: value.StartPointID },
                                dataType: "json",
                                success: function (loc) {
                                    startLoc = loc;

                                    if (value.FinalPointID != null) {
                                        $.ajax({                    //za svaku voznju vracam krajnju lokaciju posebno, ako postoji
                                            method: "GET",
                                            url: "/api/Address",
                                            data: { id: value.FinalPointID },
                                            dataType: "json",
                                            success: function (floc) {
                                                endLoc = floc;
                                            },
                                            error: function (msg) {
                                                alert("Fail - " + msg.responseText);
                                            }
                                        });
                                    }
                                },
                                error: function (msg) {
                                    alert("Fail - " + msg.responseText);
                                }
                            }),

                            $.ajax({                    //za svaku voznju vracam komentare, ukoliko su npr kom i vozac i musterija
                                method: "GET",
                                url: "/api/Smart2",
                                data: { startLocation: value.StartPointID },
                                dataType: "json",
                                success: function (loc) {
                                    comments = loc;
                                },
                                error: function (msg) {
                                    alert("Fail - " + msg.responseText);
                                }
                            }),
                        ).then(function () {
                            $('#lblhome').append(`<br />Driver: ${value.DriverID} - Car type: ${value.TypeString}`);
                            if (value.UserCallerID != null) {
                                $('#lblhome').append(`<br />Customer: ${value.UserCallerID}`);
                            }
                            $('#lblhome').append(`<br />From: ${startLoc} - To: ${endLoc}`);
                            $('#lblhome').append(`<br />Status: ${value.StatusString} - Reservation time: ${value.TimeOfReservation}`);
                            if (value.Payment != null) {
                                $('#lblhome').append(`<br />Payment: ${value.Payment}`);
                            }
                            if (comments.length > 0) {
                                $.each(comments, function (index, value) {
                                    $('#lblhome').append(`<br />Comment posted by: ${value.UserID} - Time: ${value.PostingTime}`);
                                    $('#lblhome').append(`<br />Grade for this ride: ${value.Grade}`);
                                    $('#lblhome').append(`<br /><br /><textarea readonly rows="8" cols="35">${value.Description}</textarea>`);
                                });
                            }
                            $('#lblhome').append('<br />===========================================');
                        });
                    }
                });
                $('#divhome').show();
            },
            error: function (msg) {
                //alert("Fail - " + msg.responseText);
            }
        });
    }

    if (logUser.RoleString === 'Customer') {
        $('#btnrequestdrive').show();
        let user = JSON.parse(sessionStorage.getItem('logged'));
        $("#lblhome").empty();
        $.when(
            $.ajax({                        //da vratim trenutno stanje ulogovanog 
                method: "GET",
                url: "/api/Vozac",
                data: { username: user.Username },
                dataType: "json",
                success: function (data) {
                    sessionStorage.setItem('logged', JSON.stringify(data));
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            }),
        ).then(function () {
            let user = JSON.parse(sessionStorage.getItem('logged'));

            if (user.DriveString === 'Accepted' || user.DriveString === 'Created' || user.DriveString === 'Processed') {
                $.ajax({
                    method: "GET",
                    url: "/api/Voznja",
                    data: { UserCaller: user.Username },
                    dataType: "json",
                    success: function (data) {

                        $.ajax({
                            method: "GET",
                            url: "/api/Address",
                            data: { id: data.StartPointID },
                            dataType: "json",
                            success: function (response) {
                                $("#lblhome").empty();
                                $('#lblhome').append(`====Requested drive===== <br />Location: ${response}<br />Car type: ${data.TypeString}<br />Status: ${data.StatusString}<br />Reservation time: ${data.TimeOfReservation}
                                                <br /><input type="hidden" name="Skriveni" value="${data.Id}" /><button id='btnmodifydrive'>Modify</button><button id='btncanceldrive'>Cancel</button>`);
                                $('#divhome').show();
                            },
                            error: function (msg) {
                                //alert("Fail - " + msg.responseText);
                            }
                        });
                    },
                    error: function (msg) {
                        //alert('Error - ' + msg.responseText);
                    }
                });
            }
        });

        ShowForCustomer();
    }

    $('#tdusername').html(logUser.Username);
    $('#tdname').html(logUser.Name);
    $('#tdlastname').html(logUser.Lastname);
    $('#tdemail').html(logUser.Email);
    $('#tdpw').html(logUser.Password);
    $('#tdjmbg').html(logUser.Jmbg);
    $('#tdphone').html(logUser.PhoneNumber);
    $('#tdgender').html(logUser.GenderString);

    if (logUser.RoleString === 'Driver') {      //ako je vozac, popunim location
        $.ajax({
            method: "GET",
            url: "/api/Address",
            data: { id: logUser.LocationID },
            dataType: "json",
            success: function (data) {
                $('#tdlocation').html(data);
                $("#lblhome").empty();
                $('#lblhome').append('Current location: ' + data);
            },
            error: function (msg) {
                alert("Fail - " + msg.responseText);
            }
        });

        let user = JSON.parse(sessionStorage.getItem('logged'));

        $.when(
            $.ajax({                        //da vratim trenutno stanje ulogovanog 
                method: "GET",
                url: "/api/Komentar",
                data: { username: user.Username },
                dataType: "json",
                success: function (data) {
                    sessionStorage.setItem('logged', JSON.stringify(data));
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            }),
        ).then(function () {
            user = JSON.parse(sessionStorage.getItem('logged'));

            if (user.DriveString === 'Accepted' || user.DriveString === 'InProgress') {
                $.ajax({
                    method: "GET",
                    url: "/api/Voznja",
                    data: { UserCaller: logUser.Username },
                    dataType: "json",
                    success: function (data) {
                        $.ajax({
                            method: "GET",
                            url: "/api/Address",
                            data: { id: data.StartPointID },
                            dataType: "json",
                            success: function (response) {
                                $("#lblfordriver").empty();
                                $('#lblfordriver').append(`<br/><br/>====Current drive===== <br />Location: ${response}<br />Status: ${data.StatusString}<br />Reservation time: ${data.TimeOfReservation}
                                                            <br /><button id='btnfnsdrv'>Finish</button>`);
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
                            }
                        });

                    },
                    error: function (msg) {
                        alert('Error - ' + msg.responseText);
                    }
                });
            }
        });

        ShowForDriver();
        $('#btnacptreq').show();
    }

    $('#btnhome').click(function () { //home btn
        $('#divhome').show();
        $('#divridescudr').show();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
        $('#divrequest').hide();
        $('#divmodifyrequest').hide();
        $('#divcancelride').hide();
        $('#divallreqcreated').hide();
        $('#divfnsjob').hide();
        $('#divsuccdrv').hide();
        $('#divcancelridedrv').hide();
        $('#divadminrequest').hide();
        $('#divallreqcreatedadm').hide();
        $('#divallridesadm').hide();
    });

    $('#btnprofile').click(function () { //pocetni podaci
        $('#divprofile').show();
        if (logUser.RoleString === 'Driver') {
            $('#trlocationdef').show();
        }
        $('#divhome').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
        $('#divrequest').hide();
        $('#divmodifyrequest').hide();
        $('#divcancelride').hide();
        $('#divallreqcreated').hide();
        $('#divfnsjob').hide();
        $('#divsuccdrv').hide();
        $('#divcancelridedrv').hide();
        $('#divadminrequest').hide();
        $('#divallreqcreatedadm').hide();
        $('#divridescudr').hide();
        $('#divallridesadm').hide();
    });

    $('#btnChange').click(function () { //update forma
        $('#divprofile').hide();
        $('#divhome').hide();
        $('#divupdate').show();
        if (logUser.RoleString === 'Driver') {      //ako je vozac, prikazem location
            $('#trlocationupd').show();
        }
        $('#divallcustomers').hide();
        $('#divrequest').hide();
        $('#divmodifyrequest').hide();
        $('#divcancelride').hide();
        $('#divallreqcreated').hide();
        $('#divfnsjob').hide();
        $('#divsuccdrv').hide();
        $('#divcancelridedrv').hide();
        $('#divadminrequest').hide();
        $('#divallreqcreatedadm').hide();
        $('#divridescudr').hide();
        $('#divallridesadm').hide();
    });

    $('#btnlogoff').click(function () {
        sessionStorage.removeItem('logged');
        window.location.href = "/HTML/Registration.html";
    });

    $('#btnupdate').click(function () { //izvrsi update
        let name = $("#name").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let lastname = $("#lastname").val();
        let gender = $('#gender').val();
        let identification = $("#jmbg").val();
        let phone = $("#phone").val();
        let status = true;

        if (name === "" || email === "" || password === "" || lastname === "" || identification === "" || phone === "") {
            alert("All fields are required.");
            status = false;
        } else {
            if ((password.length) < 6 || password.length > 25) {
                $("#password").css('background-color', '#F9D3D3');
                $('#password').val("");
                $("#password").attr("placeholder", "Lenght: 6 - 25 characters");
                status = false;
            } else {
                $("#password").css('background-color', "white");
                $("#password").attr("placeholder", "");
            }

            if (name.length < 3) {
                $("#name").css('background-color', '#F9D3D3');
                status = false;
                $('#name').val("");
                $("#name").attr("placeholder", "Name should have at least 3 characters");
            } else {
                $("#name").css('background-color', "white");
                $("#name").attr("placeholder", "");
            }

            if (lastname.length < 3) {
                $("#lastname").css('background-color', '#F9D3D3');
                status = false;
                $('#lastname').val("");
                $("#lastname").attr("placeholder", "Lastname should have at least 3 characters");
            } else {
                $("#lastname").css('background-color', "white");
                $("#lastname").attr("placeholder", "");
            }

            if (identification.length !== 13 || isNaN(identification)) {
                $("#jmbg").css('background-color', '#F9D3D3');
                status = false;
                $('#jmbg').val("");
                $("#jmbg").attr("placeholder", "Identification number must have 13 characters");
            } else {
                $("#jmbg").css('background-color', "white");
                $("#jmbg").attr("placeholder", "");
            }

            if (phone.length !== 10 || isNaN(phone)) {
                $("#phone").css('background-color', '#F9D3D3');
                status = false;
                $('#phone').val("");
                $("#phone").attr("placeholder", "Phone number must have 10 numbers");
            }
            else {
                $("#phone").css('background-color', "white");
                $("#phone").attr("placeholder", "");
            }

            let info = [];
            info = email.split('.');

            if (!email.includes('@') || !email.includes('.') || info[1].length < 2 || !info[0].includes('@')) {
                $("#email").css('background-color', '#F9D3D3');
                $('#email').val("");
                $("#email").attr("placeholder", "Incorect format");
                status = false;
            } else {
                $("#email").css('background-color', 'white');
                $("#email").attr("placeholder", "");
            }

            if (logUser.RoleString === 'Driver') {      //ako je vozac, update location
                let location = $('#location').val();

                if (location === "") {
                    alert("All fields are required.");
                    status = false;
                } else {
                    //if (/^[A-Z0-9]+$/i.test(location)) { da mogu samo brojevi

                    //}
                    let radnikStatus = true;
                    location = location.replace(/\s\s+/g, ' '); //da spoji vise razmaka
                    info = location.split('-');

                    if (!location.includes('-') || !location.includes(',') || !info[0].includes(',')) {
                        $("#location").css('background-color', '#F9D3D3');
                        $('#location').val("");
                        $("#location").attr("placeholder", "Incorect format");
                        alert("Format: Address Number, City Postal - PhoneNumber");
                        status = false;
                    } else {
                        $("#location").css('background-color', 'white');
                        $("#location").attr("placeholder", "");

                        info = splitMulti(location, ['-', ',']);
                        let temp = info[0].split(' ');

                        temp = CheckArray(temp);

                        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
                            $("#location").css('background-color', '#F9D3D3');
                            $('#location').val("");
                            $("#location").attr("placeholder", "Incorect format");

                            status = false;
                            radnikStatus = false;
                        }

                        temp = info[1].split(' ');
                        temp = CheckArray(temp);

                        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
                            $("#location").css('background-color', '#F9D3D3');
                            $('#location').val("");
                            $("#location").attr("placeholder", "Incorect format");

                            status = false;
                            radnikStatus = false;
                        }

                        temp = info[2].split(' ');
                        temp = CheckArray(temp);

                        if (temp.length > 1 || isNaN(temp) || info[2] === "") {
                            $("#location").css('background-color', '#F9D3D3');
                            $('#location').val("");
                            $("#location").attr("placeholder", "Incorect format");

                            status = false;
                            radnikStatus = false;
                        }

                        if (!radnikStatus) {
                            alert("Format: Address Number, City Postal - PhoneNumber");
                        } else {
                            sessionStorage.setItem("location", JSON.stringify(info));
                        }
                    }
                }
            }
        }

        if (status) {
            let location = JSON.parse(sessionStorage.getItem("location"));

            let musterija = {
                Name: name,
                Email: email,
                Password: password,
                Username: logUser.Username,
                Lastname: lastname,
                Role: logUser.Role,
                RoleString: logUser.RoleString,
                GenderString: gender,
                Jmbg: identification,
                PhoneNumber: phone,
                Gender: logUser.Gender,
            };

            SetStartingProfile(logUser, musterija);
            if (logUser.RoleString === 'Driver') {
                SetLocation(location, logUser.LocationID);
            }

            $.ajax({
                method: "PUT",
                url: "/api/Musterija",
                data: JSON.stringify(musterija),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function () {
                    alert("Entity updated");
                    EmptyAllInputs();
                    if (logUser.RoleString === 'Driver') {
                        $("#lblhome").empty();
                        $('#lblhome').append('Current location: ' + location);
                    }

                    $('#divprofile').show();
                    $('#divupdate').hide();
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            });
        }
    });
});

function CheckArray(array) {
    var result = array.filter(function (elem) {
        return elem !== "";
    });
    return result;
}

function hasNumber(myString) {
    for (i = 0; i < myString.length - 1; ++i) {
        if (/\d/.test(myString[i])) {
            return false;
        }
    }
    return true;
}

function splitMulti(str, tokens) {
    var tempChar = tokens[0]; // We can use the first token as a temporary join character
    for (var i = 1; i < tokens.length; i++) {
        str = str.split(tokens[i]).join(tempChar);
    }
    str = str.split(tempChar);
    return str;
}

function SetLocation(locat, locID) {

    let l = locat[0] + ',' + locat[1] + '-' + locat[2];
    $('#tdlocation').html(l);
    let temp = {
        id: locID,
        address: l
    }

    $.ajax({
        method: "PUT",
        url: "/api/Address",
        data: JSON.stringify(temp),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            //alert("Location updated");
        },
        error: function (msg) {
            //alert("Error with PUT location - " + msg.responseText);
        }
    });
}

function SetStartingProfile(logUser, musterija) {
    logUser.Name = musterija.Name;
    logUser.Lastname = musterija.Lastname;
    logUser.Password = musterija.Password;
    logUser.Email = musterija.Email;
    logUser.Jmbg = musterija.Jmbg;
    logUser.GenderString = musterija.GenderString;
    logUser.PhoneNumber = musterija.PhoneNumber;

    //moramo da setujemo i Gender, u odgovarajuci int
    switch (musterija.GenderString) {
        case 'Male':
            {
                logUser.Gender = 0;
                musterija.Gender = 0;
            } break;
        case 'Female':
            {
                musterija.Gender = 1;
                logUser.Gender = 1;
            }
    }

    $('#tdusername').html(logUser.Username);
    $('#tdname').html(logUser.Name);
    $('#tdlastname').html(logUser.Lastname);
    $('#tdemail').html(logUser.Email);
    $('#tdpw').html(logUser.Password);
    $('#tdjmbg').html(logUser.Jmbg);
    $('#tdphone').html(logUser.PhoneNumber);
    $('#tdgender').html(logUser.GenderString);

    sessionStorage.setItem("logged", JSON.stringify(logUser));
}

//da ispraznim sva polja unutar regstracione forme nakon uspesnog registrovanja
function EmptyAllInputs() {
    $('#password').val("");
    $('#name').val("");
    $('#lastname').val("");
    $('#email').val("");
    $('#jmbg').val("");
    $('#phone').val("");
    $('#location').val("");
}

function ShowForCustomer() {
    let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

    $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovu musteirju
        method: "GET",
        url: "/api/Voznja",
        dataType: "json",
        success: function (response) {
            $("#lbldrives").empty();
            $('#lbldrives').append('=================Drives=================');

            $.each(response, function (index, value) {
                let startLoc;
                let endLoc;
                let comments = [];
                if (value.UserCallerID != null && value.UserCallerID == loggedUser.Username) {
                    $.when(
                        $.ajax({                    //za svaku voznju vracam pocetnu lokaciju posebno
                            method: "GET",
                            url: "/api/Address",
                            data: { id: value.StartPointID },
                            dataType: "json",
                            success: function (loc) {
                                startLoc = loc;

                                if (value.FinalPointID != null) {
                                    $.ajax({                    //za svaku voznju vracam krajnju lokaciju posebno, ako postoji
                                        method: "GET",
                                        url: "/api/Address",
                                        data: { id: value.FinalPointID },
                                        dataType: "json",
                                        success: function (floc) {
                                            endLoc = floc;
                                        },
                                        error: function (msg) {
                                            alert("Fail - " + msg.responseText);
                                        }
                                        
                                    });
                                }
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
                            },
                            async: false
                        }),

                        $.ajax({                    //za svaku voznju vracam komentare, ukoliko su npr kom i vozac i musterija
                            method: "GET",
                            url: "/api/Smart2",
                            data: { startLocation: value.StartPointID },
                            dataType: "json",
                            success: function (loc) {
                                comments = loc;
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
                            }
                        }),
                    ).then(function () {
                        if (value.DriverID != null) {
                            $('#lbldrives').append(`<br />Driver: ${value.DriverID} - Car type: ${value.TypeString}`);
                        }

                        if (value.AdminID != null) {
                            $('#lbldrives').append(`<br />Admin: ${value.AdminID}`);
                        }
                        $('#lbldrives').append(`<br />From: ${startLoc} - To: ${endLoc}`);
                        $('#lbldrives').append(`<br />Status: ${value.StatusString} - Reservation time: ${value.TimeOfReservation}`);
                        if (value.Payment != null) {
                            $('#lbldrives').append(`<br />Payment: ${value.Payment}`);
                        }
                        if (comments.length > 0) {
                            $.each(comments, function (index, value) {
                                $('#lbldrives').append(`<br />Comment posted by: ${value.UserID} - Time: ${value.PostingTime}`);
                                $('#lbldrives').append(`<br />Grade for this ride: ${value.Grade}`);
                                $('#lbldrives').append(`<br /><br /><textarea readonly rows="8" cols="35">${value.Description}</textarea>`);
                            });
                        }
                        $('#lbldrives').append('<br />===========================================');
                    });
                }
            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}

function ShowForDriver() {
    let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

    $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovog vozaca
        method: "GET",
        url: "/api/Voznja",
        dataType: "json",
        success: function (response) {
            $("#lbldrives").empty();
            $('#lbldrives').append('=================Drives=================');

            $.each(response, function (index, value) {
                let startLoc;
                let endLoc;
                let comments = [];
                if (value.DriverID != null && value.DriverID == loggedUser.Username) {
                    $.when(
                        $.ajax({                    //za svaku voznju vracam pocetnu lokaciju posebno
                            method: "GET",
                            url: "/api/Address",
                            data: { id: value.StartPointID },
                            dataType: "json",
                            success: function (loc) {
                                startLoc = loc;

                                if (value.FinalPointID != null) {
                                    $.ajax({                    //za svaku voznju vracam krajnju lokaciju posebno, ako postoji
                                        method: "GET",
                                        url: "/api/Address",
                                        data: { id: value.FinalPointID },
                                        dataType: "json",
                                        success: function (floc) {
                                            endLoc = floc;
                                        },
                                        error: function (msg) {
                                            alert("Fail - " + msg.responseText);
                                        }
                                    });
                                }
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
                            },
                            async: false
                        }),

                        $.ajax({                    //za svaku voznju vracam komentare, ukoliko su npr kom i vozac i musterija
                            method: "GET",
                            url: "/api/Smart2",
                            data: { startLocation: value.StartPointID },
                            dataType: "json",
                            success: function (loc) {
                                comments = loc;
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
                            }
                        }),
                    ).then(function () {
                        if (value.AdminID != null) {
                            $('#lbldrives').append(`<br />Admin: ${value.AdminID}`);
                        }

                        if (value.UserCallerID != null) {
                            $('#lbldrives').append(`<br />Customer: ${value.UserCallerID}`);
                        }
                        $('#lbldrives').append(`<br />From: ${startLoc} - To: ${endLoc}`);
                        $('#lbldrives').append(`<br />Status: ${value.StatusString} - Reservation time: ${value.TimeOfReservation}`);
                        if (value.Payment != null) {
                            $('#lbldrives').append(`<br />Payment: ${value.Payment}`);
                        }
                        if (comments.length > 0) {
                            $.each(comments, function (index, value) {
                                $('#lbldrives').append(`<br />Comment posted by: ${value.UserID} - Time: ${value.PostingTime}`);
                                $('#lbldrives').append(`<br />Grade for this ride: ${value.Grade}`);
                                $('#lbldrives').append(`<br /><br /><textarea readonly rows="8" cols="35">${value.Description}</textarea>`);
                            });
                        }
                        $('#lbldrives').append('<br />===========================================');
                    });
                }
            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}