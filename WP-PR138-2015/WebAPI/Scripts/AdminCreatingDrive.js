$(document).ready(function (status = true) {
    $('#btnadmincrt').click(function () {       //admin kreira voznju
        $('#oladmalldrivers').empty();
        let drivers = [];

        $.when(
            $.ajax({                        //uzmem listu svih vozaca koje cu prikazati
                method: "GET",
                url: "/api/Vozac",
                dataType: "json",
                success: function (data) {
                    $.each(data, function (index, value) {
                        if (value.DriveString !== 'InProgress' && value.DriveString !== 'Formed') {
                            
                            drivers.push(value);
                            sessionStorage.setItem('drivers', JSON.stringify(drivers));
                        }
                    });
                },
                error: function (msg) {
                    alert( msg.responseText);
                }
            }),
        ).then(function () {
            let options = '<option value=""><strong>Drivers</strong></option>';
            let drivers = JSON.parse(sessionStorage.getItem('drivers'));
            $(drivers).each(function (index, value) {
                if (value.Car.TypeString == 'RegularCar') {
                    options += '<option value="' + value.Username + '">' + value.Username + '</option>';
                }
            });
            $('#driversadm').html(options);

            $('#divadminrequest').show();
            $('#divhome').hide();
            $('#divprofile').hide();
            $('#divupdate').hide();
            $('#divallcustomers').hide();
            $('#divallreqcreatedadm').hide();
            $('#divallridesadm').hide();
            $('#divridescudr').hide();
        });
    });

    $("#typeofcaradm").change(function () {     //popunjavanje drop down liste u zavisnosti od tipa auta
        let car = $(this).val();
        let options = '<option value=""><strong>Drivers</strong></option>';
        let drivers = [];

        $.when(
            $.ajax({                        //uzmem listu svih vozaca koje cu prikazati
                method: "GET",
                url: "/api/Vozac",
                dataType: "json",
                success: function (data) {
                    $.each(data, function (index, value) {
                        if (value.DriveString !== 'InProgress' && value.DriveString !== 'Formed') {

                            drivers.push(value);
                            sessionStorage.setItem('drivers', JSON.stringify(drivers));
                        } else {
                            sessionStorage.setItem('drivers', JSON.stringify(drivers));
                        }
                    });
                },
                error: function (msg) {
                    alert( msg.responseText);
                }
            }),
        ).then(function () {
            let options = '<option value=""><strong>Drivers</strong></option>';
            let drivers = JSON.parse(sessionStorage.getItem('drivers'));
            $(drivers).each(function (index, value) {
                if (value.Car.TypeString == car) {
                    options += '<option value="' + value.Username + '">' + value.Username + '</option>';
                }
            });
            $('#driversadm').html(options);
        });
    });

    $('#btncreatedrvadm').click(function () {
        let location = $('#curlocadm').val();
        let car = $('#typeofcaradm').val();                     //tip automobila
        let driver = $('#driversadm').val();
        let loggedUser = JSON.parse(sessionStorage.getItem('logged'));
        let startId;

        location = Validation(location, driver);
        let send = { FullAddress: location };

        $.when(
            $.ajax({                        //uzmem listu svih vozaca koje cu prikazati
                method: "GET",
                url: "/api/Vozac",
                dataType: "json",
                success: function (data) {
                    $.each(data, function (index, value) {
                        if (value.Username == driver && (value.DriveString === 'InProgress' || value.DriveString === 'Formed')) {
                            alert('This driver is already taken, choose another');
                            location = "";
                        }
                    });
                },
                error: function (msg) {
                    alert( msg.responseText);
                }
            }),
        ).then(function () {
            if (location !== "") {
                $.when(
                    $.ajax({
                        method: "POST",
                        url: "/api/Address",
                        data: JSON.stringify(send),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            startID = data //moram cuvati ID pocetne lokacije, kako bih stavio u 'voznju'
                        },
                        error: function (msg) {
                            alert( msg.responseText);
                        }
                    }),
                ).then(function () {
                    let DriverTypeLocation = {
                        start: startID,
                        user: driver,
                        type: car,
                        admin: loggedUser.Username,
                        driverStatus: 8,                //enumi statusa voznje
                        adminStatus: 3
                    }

                    $.ajax({
                        method: "POST",
                        url: "/api/Smart",
                        data: JSON.stringify(DriverTypeLocation),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            $('#curlocadm').val("");
                            alert("Drive succesffully formed!");
                            $('#divadminrequest').hide();

                            $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovog admina
                                method: "GET",
                                url: "/api/Voznja",
                                dataType: "json",
                                success: function (response) {
                                    $("#lblhome").empty();
                                    $('#lblhome').append('================Drives=====================');
                                    let startLoc;
                                    let endLoc;
                                    let comments = [];

                                    $.each(response, function (index, value) {
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
                                                                    alert( msg.responseText);
                                                                }
                                                            });
                                                        }
                                                    },
                                                    error: function (msg) {
                                                        alert( msg.responseText);
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
                                                        alert( msg.responseText);
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
                                    $('#divridescudr').show();
                                },
                                error: function (msg) {
                                    alert( msg.responseText);
                                }
                            });

                        },
                        error: function (msg) {
                            alert("Request ready, click again to send.");
                        }
                    });
                });
            }
        });
    });
});

function Validation(location, type) {
    let radnikStatus = true;
    let status = true;
    let ret = "";
    location = location.replace(/\s\s+/g, ' '); //da spoji vise razmaka

    if (!location.includes('-') || !location.includes(',')) {
        $("#curlocadm").css('background-color', '#F9D3D3');
        $('#curlocadm').val("");
        $("#curlocadm").attr("placeholder", "Incorect format");
        alert("Format: Address Number, City Postal - PhoneNumber");
    } else {
        $("#curlocadm").css('background-color', 'white');
        $("#curlocadm").attr("placeholder", "");

        let info = splitMulti(location, ['-', ',']);
        let temp = info[0].split(' ');

        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#curlocadm").css('background-color', '#F9D3D3');
            $('#curlocadm').val("");
            $("#curlocadm").attr("placeholder", "Incorect format");

            radnikStatus = false;
        }

        temp = info[1].split(' ');
        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#curlocadm").css('background-color', '#F9D3D3');
            $('#curlocadm').val("");
            $("#curlocadm").attr("placeholder", "Incorect format");

            radnikStatus = false;
        }

        temp = info[2].split(' ');
        temp = CheckArray(temp);

        if (temp.length > 1 || isNaN(temp) || info[2] === "") {
            $("#curlocadm").css('background-color', '#F9D3D3');
            $('#curlocadm').val("");
            $("#curlocadm").attr("placeholder", "Incorect format");

            radnikStatus = false;
        }

        if (type == '') {
            alert('You must choose driver!');
            status = false;
        }

        if (!radnikStatus) {
            alert("Format: Address Number, City Postal - PhoneNumber");
        } else if (!status) {

        }
        else {
            let l = info[0] + ',' + info[1] + '-' + info[2];

            ret = l;
        }
    }

    return ret;
}