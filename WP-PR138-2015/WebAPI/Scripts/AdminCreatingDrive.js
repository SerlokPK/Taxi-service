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
                        if (value.DriveString !== 'InProgress') {
                            //$('#oladmalldrivers').append(`<li>Driver: ${value.Username} - Car type: ${value.TypeString}   <button id='btnassigndrv'>Assign</button></li>`);
                            drivers.push(value);
                            sessionStorage.setItem('drivers', JSON.stringify(drivers));
                        }
                    });
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
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
        });
    });

    $("#typeofcaradm").change(function () {     //popunjavanje drop down liste u zavisnosti od tipa auta
        let car = $(this).val();
        let options = '<option value=""><strong>Drivers</strong></option>';
        let drivers = JSON.parse(sessionStorage.getItem('drivers'));

        $(drivers).each(function (index, value) {
            if (value.Car.TypeString == car) {
                options += '<option value="' + value.Username + '">' + value.Username + '</option>';
            }
        });

        $('#driversadm').html(options);
    });

    $('#btncreatedrvadm').click(function () {
        let location = $('#curlocadm').val();
        let car = $('#typeofcaradm').val();                     //tip automobila
        let driver = $('#driversadm');
        let loggedUser = JSON.parse(sessionStorage.getItem('logged'));
        let startId;

        location = Validation(location,driver);
        let send = { FullAddress: location };

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
                        alert("Fail - " + msg.responseText);
                    }
                }),
            ).then(function () {
                let DriverTypeLocation = {
                    start: startID,
                    user: driver,
                    type: car,
                    admin: loggedUser.Username
                }

                $.ajax({
                    method: "POST",
                    url: "/api/Smart",
                    data: JSON.stringify(DriverCustomerLocation),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        $('#curlocadm').val("");
                        alert("Drive succesffully formed!");
                        $('#divadminrequest').hide();

                        $.ajax({
                            method: "GET",
                            url: "/api/Voznja",
                            dataType: "json",
                            success: function (response) {
                                $("#lblhome").empty();
                                $('#lblhome').append('=====Drives=====');
                                let startLoc;
                                let endLoc;

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
                                                },
                                                error: function (msg) {
                                                    alert("Fail - " + msg.responseText);
                                                }
                                            }),

                                            $.ajax({                    //za svaku voznju vracam krajnju lokaciju posebno
                                                method: "GET",
                                                url: "/api/Address",
                                                data: { id: value.FinalPointID },
                                                dataType: "json",
                                                success: function (loc) {
                                                    endLoc = loc;
                                                },
                                                error: function (msg) {
                                                    alert("Fail - " + msg.responseText);
                                                }
                                            }), //TO DO IZVUCI KOMENTARE ZA OVE VOZNJE I ISPISI INFO O NJIMA
                                        ).then(function () {
                                            $('#lblhome').append(`<br />Driver: ${value.DriverID} - Car type: ${value.TypeString}`);
                                            if (value.UserCallerID != null) {
                                                $('#lblhome').append(`<br />Customer: ${value.UserCallerID}`);
                                            }
                                            $('#lblhome').append(`<br />From: ${startLoc} - To: ${endLoc}`);
                                            $('#lblhome').append(`<br />Status: ${value.StatusString} - Reservation time: ${value.TimeOfReservation} <br /> `);
                                            $('#lblhome').append(`<br />Payment: ${value.Payment}`);
                                        });
                                    }
                                });
                                $('#divhome').show();
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
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

function Validation(location,type) {
    let radnikStatus = true;
    let status = true;
    let ret = "";
    location = location.replace(/\s\s+/g, ' '); //da spoji vise razmaka

    if (!location.includes('-') || !location.includes(',')) {
        $("#curlocadm").css('background-color', '#F9D3D3');
        $('#curlocadm').val("");
        $("#curlocadm").attr("placeholder", "Incorect format");
        alert("Format: Address Number, City Postal - PhoneNumber");
        status = false;
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

            status = false;
            radnikStatus = false;
        }

        temp = info[1].split(' ');
        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#curlocadm").css('background-color', '#F9D3D3');
            $('#curlocadm').val("");
            $("#curlocadm").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        temp = info[2].split(' ');
        temp = CheckArray(temp);

        if (temp.length > 1 || isNaN(temp)) {
            $("#curlocadm").css('background-color', '#F9D3D3');
            $('#curlocadm').val("");
            $("#curlocadm").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        if (type == 'Drivers') {
            alert('You must choose driver!');
        }

        if (!radnikStatus) {
            alert("Format: Address Number, City Postal - PhoneNumber");
        } else {
            let l = info[0] + ',' + info[1] + '-' + info[2];

            ret = l;
        }
    }

    return ret;
}