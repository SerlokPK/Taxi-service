$(document).ready(function () {
    $('#btnrequestdrive').click(function () {
        let user = JSON.parse(sessionStorage.getItem('logged'));

        $.ajax({                    //u slucaju da postoji voznja s ovim userom, ne moze da trazi novu dok se ne zavrsi/ obrise
            method: "GET",
            url: "/api/Voznja",
            data: { UserCaller: user.Username },
            dataType: "json",
            success: function (data) {
                alert("You requested drive already, either cancel one that is in progress or be patient.");
            },
            error: function (msg) {
                $('#divrequest').show();
                $('#divhome').hide();
                $('#divprofile').hide();
                $('#divupdate').hide();
                $('#divallcustomers').hide();
                $('#divmodifyrequest').hide();
            }
        });
    });

    $('#btncreatedrive').click(function () {
        let location = $('#curloc').val();
        let car = $('#typeofcar').val(); //tip automobila
        let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

        let status = Validation(location);

        if (status) {
            $.ajax({
                method: "GET",
                url: "/api/Musterija",
                data: { carType: car },
                dataType: "json",
                success: function (data) {      //u data se nalazi vozac s odgovarajucim vozilom
                    let DriverCustomerLocation = {
                        start: JSON.parse(sessionStorage.getItem('startLocation')),
                        user: loggedUser.Username,
                        driver: data,
                        type: car
                    }

                    $.ajax({
                        method: "POST",
                        url: "/api/Voznja",
                        data: JSON.stringify(DriverCustomerLocation),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            //sessionStorage.setItem("voznja", JSON.stringify(data));     //cuvam da proverim da li je korisnik vec zahtevao voznju
                            $('#curloc').val("");
                            alert("Drive succesffully requested!");
                            $('#divrequest').hide();

                            $.ajax({
                                method: "GET",
                                url: "/api/Address",
                                data: { id: data.StartPointID },
                                dataType: "json",
                                success: function (response) {
                                    $("#lblhome").empty();
                                    $('#lblhome').append(`====Requested drive===== <br />Location: ${response}<br />Driver: ${data.DriverID}<br />Status: ${data.StatusString}<br />Reservation time: ${data.TimeOfReservation}
                                                            <br /><button id='btnmodifydrive'>Modify</button><button id='btncanceldrive'>Cancel</button>`);
                                    $('#divhome').show();
                                },
                                error: function (msg) {
                                    alert("Fail - " + msg.responseText);
                                }
                            });

                        },
                        error: function (msg) {
                            alert("Fail - " + msg.responseText);
                        }
                    });
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            });
        }

    });
    //za menjanje postojece voznje      
    $('#lblhome').on('click','#btnmodifydrive',function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da
        $('#divmodifyrequest').show();                          //pozivas
        $('#divhome').hide();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
        $('#divrequest').hide();
    });

    $('#lblhome').on('click', '#btncanceldrive', function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da
        $('#divcancelride').show();                          //pozivas
        $('#divhome').hide();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide(); 
        $('#divrequest').hide();
    });

    $('#btnmdfdrive').click(function () {
        ValidationForModification();
    });

    $('#btncnldrive').click(function () {
        let text = $('#txtacomment').val();


    });
});

function ValidationForModification() {
    let status = true;
    let radnikStatus = true;
    let location = $('#modloc').val();
    let car = $('#modtypeofcar').val(); //tip automobila
    let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

    location = location.replace(/\s\s+/g, ' '); //da spoji vise razmaka

    if (!location.includes('-') || !location.includes(',')) {
        $("#modloc").css('background-color', '#F9D3D3');
        $('#modloc').val("");
        $("#modloc").attr("placeholder", "Incorect format");
        alert("Format: Address Number, City Postal - PhoneNumber");
        status = false;
    } else {
        $("#modloc").css('background-color', 'white');
        $("#modloc").attr("placeholder", "");

        let info = splitMulti(location, ['-', ',']);
        let temp = info[0].split(' ');

        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#modloc").css('background-color', '#F9D3D3');
            $('#modloc').val("");
            $("#modloc").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        temp = info[1].split(' ');
        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#modloc").css('background-color', '#F9D3D3');
            $('#modloc').val("");
            $("#modloc").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        temp = info[2].split(' ');
        temp = CheckArray(temp);

        if (temp.length > 1 || isNaN(temp)) {
            $("#modloc").css('background-color', '#F9D3D3');
            $('#modloc').val("");
            $("#modloc").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        if (!radnikStatus) {
            alert("Format: Address Number, City Postal - PhoneNumber");
        } else {
            let l = info[0] + ',' + info[1] + '-' + info[2];
            let send = { FullAddress: l };

            $.ajax({                //vraca voznju koju zelim da update
                method: "GET",
                url: "/api/Voznja",
                data: { UserCaller: loggedUser.Username },
                dataType: "json",
                success: function (data) {
                    let voznja = {
                        id: data.Id,        //id voznje
                        location: location, //naziv nove pocetne lokacije
                        type: car
                    }

                    $.ajax({                //ovde update voznju
                        method: "PUT",
                        url: "/api/Voznja",
                        data: JSON.stringify(voznja),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response) {
                            alert("Drive updated");
                            $('#divmodifyrequest').hide();
                            $('#modloc').val("");
                            $("#lblhome").empty();
                            $('#lblhome').append(`====Requested drive===== <br />Location: ${location}<br />Driver: ${response.DriverID}<br />Status: ${response.StatusString}<br />Reservation time: ${response.TimeOfReservation}
                                                            <br /><button id='btnmodifydrive'>Modify</button><button id='btncanceldrive'>Cancel</button>`);

                            $('#divhome').show();
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
    }
}

function Validation(location) {
    let radnikStatus = true;
    let status = true;
    location = location.replace(/\s\s+/g, ' '); //da spoji vise razmaka

    if (!location.includes('-') || !location.includes(',')) {
        $("#curloc").css('background-color', '#F9D3D3');
        $('#curloc').val("");
        $("#curloc").attr("placeholder", "Incorect format");
        alert("Format: Address Number, City Postal - PhoneNumber");
        status = false;
    } else {
        $("#curloc").css('background-color', 'white');
        $("#curloc").attr("placeholder", "");

        let info = splitMulti(location, ['-', ',']);
        let temp = info[0].split(' ');

        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#curloc").css('background-color', '#F9D3D3');
            $('#curloc').val("");
            $("#curloc").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        temp = info[1].split(' ');
        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#curloc").css('background-color', '#F9D3D3');
            $('#curloc').val("");
            $("#curloc").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        temp = info[2].split(' ');
        temp = CheckArray(temp);

        if (temp.length > 1 || isNaN(temp)) {
            $("#curloc").css('background-color', '#F9D3D3');
            $('#curloc').val("");
            $("#curloc").attr("placeholder", "Incorect format");

            status = false;
            radnikStatus = false;
        }

        if (!radnikStatus) {
            alert("Format: Address Number, City Postal - PhoneNumber");
        } else {
            let l = info[0] + ',' + info[1] + '-' + info[2];
            let send = { FullAddress: l };

            $.when(                     //kad se izvrsi post, posalji nazad status, u suprotnom previse brzo radi, imam null za locationID
                $.ajax({
                    method: "POST",
                    url: "/api/Address",
                    data: JSON.stringify(send),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        sessionStorage.setItem("startLocation", JSON.stringify(data)) //moram cuvati ID pocetne lokacije, kako bih stavio u 'voznju'
                    },
                    error: function (msg) {
                        alert("Fail - " + msg.responseText);
                    }
                }),
            ).then(function () {
                return status;
            });
        }
    }

    return status;
}

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

