$(document).ready(function () {
    $('#btnrequestdrive').click(function () {
        let user = JSON.parse(sessionStorage.getItem('logged'));

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
            user = JSON.parse(sessionStorage.getItem('logged'));
            if (user.DriveString === 'Accepted' || user.DriveString === 'Created' || user.DriveString === 'Processed') {
                alert(`You already took one ride, finish it, or change your ride status if it's over, then try again.`);
            } else if ((user.DriveString === 'Successful' || user.DriveString === 'Failed') && user.Commented == false) {
                alert('This drive is over, leave comment about your experience');
                let save = $('#lblhome').html();
                $('#lblhome').empty();
                let info = save.split('<');
                save = info[0];//.slice(0, -1);
                //$('#lblhome').html().split("<br/><br/>Do you wish to leave a comment?<br/><button id='btncomyes'>Yes</button>          <button id='btncomno'>No</button>").join("");
                $('#lblhome').append(save);
                $('#lblhome').append('<br/><br/>Do you wish to leave a comment?<br/><button id="btncomyes">Yes</button>          <button id="btncomno">No</button>');
            }
            else {
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
        let startId;

        location = Validation(location);
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
                $.ajax({
                    method: "GET",
                    url: "/api/Musterija",
                    data: { carType: car },
                    dataType: "json",
                    success: function (data) {      //u data se nalazi vozac s odgovarajucim vozilom
                        let DriverCustomerLocation = {
                            start: startID,
                            user: loggedUser.Username,
                            type: car
                        }

                        $.ajax({
                            method: "POST",
                            url: "/api/Voznja",
                            data: JSON.stringify(DriverCustomerLocation),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (data) {

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
                                        $('#lblhome').append(`====Requested drive===== <br />Location: ${response}<br />Car type: ${data.TypeString}<br />Status: ${data.StatusString}<br />Reservation time: ${data.TimeOfReservation}
                                                            <br /><input type="hidden" name="Skriveni" value="${data.Id}" /><button id='btnmodifydrive'>Modify</button><button id='btncanceldrive'>Cancel</button>`);
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
                    },
                    error: function (msg) {
                        alert("Fail - " + msg.responseText);
                    }
                });
            });
        }
    });
    //za menjanje postojece voznje      
    $('#lblhome').on('click', '#btnmodifydrive', function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da pozivas
        let temp = $('#lblhome').find('input:hidden').val();
        id = parseInt(temp);
        let voznja;

        $.when(
            $.ajax({                        //da vratim trenutno stanje ulogovanog 
                method: "GET",
                url: "/api/Registration",
                data: { id: id },
                dataType: "json",
                success: function (data) {
                    voznja = data;
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            }),
        ).then(function () {
            if (voznja.StatusString === 'Created' || voznja.StatusString === 'Accepted' || voznja.StatusString === 'Processed') {      // ako je neki od ovih stanja, moze da modifikuje
                $('#divmodifyrequest').show();
                $('#divhome').hide();
                $('#divprofile').hide();
                $('#divupdate').hide();
                $('#divallcustomers').hide();
                $('#divrequest').hide();
            } else {
                alert('This drive is over, leave comment about your experience');
                let save = $('#lblhome').html();
                $('#lblhome').empty();
                let info = save.split('button');
                save = info[0].slice(0, -1);
                $('#lblhome').append(save);
                $('#lblhome').append('<br/><br/>Do you wish to leave a comment?<br/><button id="btncomyes">Yes</button>          <button id="btncomno">No</button>');
            }
        });
    });

    //ako je kliknuo da nece da ostavi kom
    $('#lblhome').on('click', '#btncomno', function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da
        $('#lblhome').empty();
        $('#divhome').show();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
        $('#divrequest').hide();

        let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

        $.ajax({                        //da izmenim da je komentarisao korisnik
            method: "GET",
            url: "/api/Vozac",
            data: { username: loggedUser.Username },
            dataType: "json",
            success: function (data) {
                let korisnik = {
                    Username: data.Username
                }

                $.ajax({                //menjam na true - komentarisao je
                    method: "PUT",
                    url: "/api/Komentar",
                    data: JSON.stringify(korisnik),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        sessionStorage.setItem('logged', JSON.stringify(response));
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
    });

    //ako je kliknuo da hoce da ostavi komentar
    $('#lblhome').on('click', '#btncomyes', function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da
        $('#divwantcom').show();
        $('#divhome').hide();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
        $('#divrequest').hide();
    });

    $('#btnsndcomm').click(function () {
        let text = $('#txtacomment2').val();
        let grade = $('#gradecmt').val();
        let status = true;

        if (text.length < 5) {
            alert('Please leave more than one word, so we can improve our work, thank you!');
            status = false;
        }

        if (status) {
            let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

            $.ajax({                    //uzimamo voznju za koju stavljamo komentar
                method: "GET",
                url: "/api/LogIn",
                data: { UserCaller: loggedUser.Username },
                dataType: "json",
                success: function (data) {
                    let komentar = {
                        Description: text,
                        UserID: loggedUser.Username,
                        DriveID: data.StartPointID,
                        Grade: grade
                    }

                    $.ajax({                // cuvamo komentar
                        method: "POST",
                        url: "/api/Komentar",
                        data: JSON.stringify(komentar),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response) {
                            let send = {
                                id: data.Id,
                                komId: response.Id
                            }

                            $.ajax({                //cuvam ID komentara u voznju
                                method: "PUT",
                                url: "/api/Smart2",
                                data: JSON.stringify(send),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (response) {
                                    
                                },
                                error: function (msg) {
                                    alert("Fail - " + msg.responseText);
                                }
                            });

                            alert('Comment sent');
                            $('#txtacomment2').val("");
                            $('#gradecmt').val("");
                            $('#divwantcom').hide();
                            $("#lblhome").empty();
                            $('#divhome').show();
                        },
                        error: function (msg) {
                            alert("Fail - " + msg.responseText);
                        }
                    });

                    $.ajax({                        //da izmenim da je komentarisao korisnik
                        method: "GET",
                        url: "/api/Vozac",
                        data: { username: loggedUser.Username },
                        dataType: "json",
                        success: function (data) {
                            let korisnik = {
                                Username: data.Username
                            }
                            $.ajax({                //menjam na true - komentarisao je
                                method: "PUT",
                                url: "/api/Komentar",
                                data: JSON.stringify(korisnik),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (response) {
                                    sessionStorage.setItem('logged', JSON.stringify(response));
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

    //cancel 'created' voznje
    $('#lblhome').on('click', '#btncanceldrive', function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da
        
        let temp = $('#lblhome').find('input:hidden').val();
        id = parseInt(temp);
        let voznja;

        $.when(
            $.ajax({                        //da vratim trenutno stanje ulogovanog 
                method: "GET",
                url: "/api/Registration",
                data: { id: id },
                dataType: "json",
                success: function (data) {
                    voznja = data;
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            }),
        ).then(function () {
            if (voznja.StatusString === 'Created' || voznja.StatusString === 'Accepted') {      // ako je neki od ovih stanja, moze da modifikuje
                $('#divcancelride').show();                         
                $('#divhome').hide();
                $('#divprofile').hide();
                $('#divupdate').hide();
                $('#divallcustomers').hide();
                $('#divrequest').hide();
            } else if (voznja.StatusString === 'Processed') {
                alert('This drive was made by admin, you can"t cancel it');
            }
            else {
                alert('This drive is over, leave comment about your experience');
                let save = $('#lblhome').html();
                $('#lblhome').empty();
                let info = save.split('button');
                save = info[0].slice(0, -1);
                $('#lblhome').append(save);
                $('#lblhome').append('<br/><br/>Do you wish to leave a comment?<br/><button id="btncomyes">Yes</button>          <button id="btncomno">No</button>');
            }
        });
    });

    $('#btnmdfdrive').click(function () {
        ValidationForModification();
    });

    $('#btncnldrive').click(function () {
        let text = $('#txtacomment').val();
        let status = true;

        if (text.length < 5) {
            alert('Please leave more than one word, so we can improve our work, thank you!');
            status = false;
        }

        if (status) {
            let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

            $.ajax({                    //uzimamo voznju koja je declined
                method: "GET",
                url: "/api/Voznja",
                data: { UserCaller: loggedUser.Username },
                dataType: "json",
                success: function (data) {
                    let komentar = {
                        Description: text,
                        UserID: loggedUser.Username,
                        DriveID: data.StartPointID
                    }

                    $.ajax({                // cuvamo komentar
                        method: "POST",
                        url: "/api/Komentar",
                        data: JSON.stringify(komentar),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response) {
                            let send = {
                                id: data.Id,
                                komId: response.Id
                            }

                            $.ajax({                //cuvam ID komentara u voznju
                                method: "PUT",
                                url: "/api/Smart2",
                                data: JSON.stringify(send),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (response) {

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

                    let voznja = {
                        Id: data.Id
                    }

                    $.ajax({                // stavljamo status 'declined'
                        method: "DELETE",
                        url: "/api/Voznja",
                        data: JSON.stringify(voznja),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response) {
                            alert('Requested drive canceled');
                            $('#txtacomment').val("");
                            $('#divcancelride').hide();
                            $("#lblhome").empty();
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
        }
    });
});

function Validation(location) {
    let radnikStatus = true;
    let status = true;
    let ret = "";
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

            ret = l;
        }
    }

    return ret;
}

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
                            $('#lblhome').append(`====Requested drive===== <br />Location: ${location}<br />Car type: ${response.TypeString}<br />Status: ${response.StatusString}<br />Reservation time: ${response.TimeOfReservation}
                                                            <br /><input type="hidden" name="Skriveni" value="${data.Id}" /><button id='btnmodifydrive'>Modify</button><button id='btncanceldrive'>Cancel</button>`);

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

