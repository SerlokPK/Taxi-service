$(document).ready(function () {
    $('#btnacptreq').click(function () {            //dgume za prikaz svih customera
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
                    alert( msg.responseText);
                }
            }),
        ).then(function () {
            user = JSON.parse(sessionStorage.getItem('logged'));

            if (user.DriveString === 'Accepted' || user.DriveString === 'InProgress') {
                alert(`You already took one ride, finish it, or change your ride status if it's over, then try again.`);
            } else {
                $('#divallreqcreated').show();
                $('#divhome').hide();
                $('#divprofile').hide();
                $('#divupdate').hide();
                $('#divallcustomers').hide();
                $('#divrequest').hide();
                $('#divmodifyrequest').hide();
                $('#divcancelride').hide();
                $('#divridescudr').hide();

                $.ajax({                //vracam sve voznje 
                    method: "GET",
                    url: "/api/Voznja",
                    dataType: "json",
                    success: function (data) {
                        sessionStorage.setItem("voznje", JSON.stringify(data));
                        $('#olforcrtreq').empty();
                        $.each(data, function (index, val) {
                            if (val.StatusString === 'Created') {
                                $.ajax({            //za svaku voznju vracam lokaciju posebno
                                    method: "GET",
                                    url: "/api/Address",
                                    data: { id: val.StartPointID },
                                    dataType: "json",
                                    success: function (response) {
                                        $('#olforcrtreq').append(`<li>Pickup location: ${response} <button id='btnaccrequest'>Accept</button></br>Wanted car: ${val.TypeString}<input type="hidden" id="${val.Id}"></li>`);
                                    },
                                    error: function (msg) {
                                        alert( msg.responseText);
                                    }
                                });
                            }
                        });
                    },
                    error: function (msg) {
                        //alert("Fail - " + msg.responseText);
                    }
                });
            }
        });
    });

    $("#olforcrtreq").delegate("#btnaccrequest", "click", function () {
        let index = $(this).parent().index();   //zelim ID trenutnog <li>
        let temp = $('#olforcrtreq').find(`li:eq(${index})`).html(); //da pronadjem tekst iz tacno oznacenog <li>
        let voznje = JSON.parse(sessionStorage.getItem("voznje"));
        let voznja;
        let status = true;

        let driver = JSON.parse(sessionStorage.getItem('logged'));
        let info = temp.split('"');
        let id = info[5];      //id voznje
        id = parseInt(id);

        $.when(
            $.ajax({                        //da vratim trenutno stanje ulogovanog 
                method: "GET",
                url: "/api/Registration",
                data: { id: id },
                dataType: "json",
                success: function (data) {
                    if (data.StatusString === 'Created') {
                        voznja = data;
                    } else {
                        status = false;
                    }
                    
                },
                error: function (msg) {
                    alert( msg.responseText);
                }
            }),
        ).then(function () {
            driver = JSON.parse(sessionStorage.getItem('logged'));

            if (status) {
                if (voznja.StatusString !== 'Declined') {
                    let send = {
                        Id: id,
                        Driver: driver.Username
                    }

                    $.ajax({        //menjamo statuse voznje, vozaca i musterije
                        method: "PUT",
                        url: "/api/Registration",
                        data: JSON.stringify(send),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            alert('Drive accepted, good luck!');

                            $.ajax({
                                method: "GET",
                                url: "/api/Address",
                                data: { id: data.StartPointID },
                                dataType: "json",
                                success: function (response) {
                                    $("#lblfordriver").empty();
                                    $('#lblfordriver').append(`<br /><br />====Current drive===== <br />Location: ${response}<br />Status: ${data.StatusString}<br />Reservation time: ${data.TimeOfReservation}
                                                            <br /><button id='btnfnsdrv'>Finish</button>`);
                                    $('#divallreqcreated').hide();
                                    ShowForDriver();
                                    $('#divhome').show();
                                },
                                error: function (msg) {
                                    alert( msg.responseText);
                                }
                            });
                        },
                        error: function (msg) {
                            alert( msg.responseText);
                        }
                    });
                } else {
                    alert('Customer declined this drive in meantime, choose another.');
                    $('#divallreqcreated').hide();
                    ShowForDriver();
                    $('#divhome').show();
                }
            } else {
                alert('Drive was changed in meantime, choose another.');
                $('#btnacptreq').trigger('click');
            }
            
        });
    });
    //div za biranje ishoda voznje
    $('#lblfordriver').on('click', '#btnfnsdrv', function () {    //kada se dinamicki pravi, moras preko elementa na koji appendujes da
        $('#divfnsjob').show();
        $('#divhome').hide();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
        $('#divrequest').hide();
        $('#divmodifyrequest').hide();
        $('#divcancelride').hide();
        $('#divallreqcreated').hide();
        $('#divridescudr').hide();
    });

    $('#btnfnsjob').click(function () {
        let option = $('#fnsmethod').val();

        if (option === 'Successful') {                  //kada je izabrano 'successful'
            $('#divsuccdrv').show();
            $('#divfnsjob').hide();
            $('#divhome').hide();
            $('#divprofile').hide();
            $('#divupdate').hide();
            $('#divallcustomers').hide();
            $('#divrequest').hide();
            $('#divmodifyrequest').hide();
            $('#divcancelride').hide();
            $('#divallreqcreated').hide();
            $('#divridescudr').hide();
        } else {                                        //kada je unsuccessful
            $('#divcancelridedrv').show();
            $('#divfnsjob').hide();
            $('#divhome').hide();
            $('#divprofile').hide();
            $('#divupdate').hide();
            $('#divallcustomers').hide();
            $('#divrequest').hide();
            $('#divmodifyrequest').hide();
            $('#divcancelride').hide();
            $('#divallreqcreated').hide();
            $('#divridescudr').hide();
        }
    });

    $('#btnsndcommdrv').click(function () {
        let text = $('#txtacommentdrv').val();
        let status = true;

        if (text.length < 5) {
            alert('Please leave more than one word, so we can understand what happend, thank you!');
            status = false;
        }

        if (status) {
            let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

            $.ajax({                    //uzimamo voznju za koju cuvam komentar
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
                                    alert( msg.responseText);
                                }
                            });

                            alert('Your comment is sent!');
                            $('#divcancelridedrv').hide();
                            $('#txtacommentdrv').val("");
                            $('#lblfordriver').empty()      //voznja obradjena, uklonimo je, ako se refresh, nece je ocitati iz baze
                            ShowForDriver();
                            $('#divhome').show();
                        },
                        error: function (msg) {
                            alert( msg.responseText);
                        }
                    });

                    let send = {
                        Id: data.Id,
                        Status: 6
                    };

                    $.ajax({        //promenjen status na failed
                        method: "PUT",
                        url: "/api/Smart",
                        data: JSON.stringify(send),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            
                        },
                        error: function (msg) {
                            alert( msg.responseText);
                        }
                    });
                },
                error: function (msg) {
                    alert('Drive was canceled in meantime.');
                    $('#divcancelridedrv').hide();
                    $('#txtacommentdrv').val("");
                    $('#lblfordriver').empty()      //voznja obradjena, uklinimo je, ako se refresh, nece je ocitati iz baze
                    ShowForDriver();
                    $('#divhome').show();
                }
            });
        }
    });

    $('#btnsuccfnsjob').click(function () {
        let amount = $('#amount').val();
        let fdest = $('#fdest').val();

        let driver = JSON.parse(sessionStorage.getItem('logged'));
        let final;

        fdest = ValidationForFinalDest(fdest, amount);
        let send = { FullAddress: fdest };

        if (fdest !== "") {
            $.when(
                $.ajax({
                    method: "POST",
                    url: "/api/Address",
                    data: JSON.stringify(send),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        final = data; //ID krajnje lokacije
                    },
                    error: function (msg) {
                        alert( msg.responseText);
                    }
                }),
            ).then(function () {
                $.ajax({            //uzmi voznju
                    method: "GET",
                    url: "/api/Voznja",
                    data: { UserCaller: driver.Username },
                    dataType: "json",
                    success: function (data) {
                        let send = {
                            Payment: amount,
                            FinalPointID: final,
                            Id: data.Id
                        }

                        $.ajax({        //dodaj joj cenu i krajnju lokaciju
                            method: "PUT",
                            url: "/api/LogIn",
                            data: JSON.stringify(send),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (data) {
                                alert('Drive is completed, good job!');
                                ChangeCurrentDest(final,driver.Username);
                                $('#divsuccdrv').hide();
                                $('#amount').val("");
                                $('#fdest').val("");
                                $('#lblfordriver').empty()      //voznja obradjena, uklinimo je, ako se refresh, nece je ocitati iz baze
                                ShowForDriver();
                                $('#divhome').show();
                            },
                            error: function (msg) {
                                alert( msg.responseText);
                            }
                        });
                    },
                    error: function (msg) {
                        alert('Drive was canceled in meantime.');
                        $('#divsuccdrv').hide();
                        $('#amount').val("");
                        $('#fdest').val("");
                        $('#lblfordriver').empty()      //voznja obradjena, uklinimo je, ako se refresh, nece je ocitati iz baze
                        ShowForDriver();
                        $('#divhome').show();
                    }
                });
            });
        }
    });
});

function ValidationForFinalDest(location, amount) {
    let radnikStatus = true;
    let status = true;
    let ret = "";
    location = location.replace(/\s\s+/g, ' '); //da spoji vise razmaka

    if (!location.includes('-') || !location.includes(',')) {
        $("#fdest").css('background-color', '#F9D3D3');
        $('#fdest').val("");
        $("#fdest").attr("placeholder", "Incorect format");
        alert("Format: Address Number, City Postal - PhoneNumber");
    } else {
        $("#fdest").css('background-color', 'white');
        $("#fdest").attr("placeholder", "");

        let info = splitMulti(location, ['-', ',']);
        let temp = info[0].split(' ');

        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#fdest").css('background-color', '#F9D3D3');
            $('#fdest').val("");
            $("#fdest").attr("placeholder", "Incorect format");

            radnikStatus = false;
        }

        temp = info[1].split(' ');
        temp = CheckArray(temp);

        if (temp.length < 2 || isNaN(temp[temp.length - 1]) || !hasNumber(temp) || temp[temp.length - 1] === "") {
            $("#fdest").css('background-color', '#F9D3D3');
            $('#fdest').val("");
            $("#fdest").attr("placeholder", "Incorect format");

            radnikStatus = false;
        }

        temp = info[2].split(' ');
        temp = CheckArray(temp);

        if (temp.length > 1 || isNaN(temp) || info[2] === "") {
            $("#fdest").css('background-color', '#F9D3D3');
            $('#fdest').val("");
            $("#fdest").attr("placeholder", "Incorect format");

            radnikStatus = false;
        }

        if (isNaN(amount) || amount === "") {
            $("#amount").css('background-color', '#F9D3D3');
            $('#amount').val("");
            $("#amount").attr("placeholder", "Must be number");

            status = false;
        } else {
            $("#amount").css('background-color', 'white');
            $("#amount").attr("placeholder", "");
        }

        if (!radnikStatus) {
            alert("Format: Address Number, City Postal - PhoneNumber");
        } else if (!status) {

        } else {
            let l = info[0] + ',' + info[1] + '-' + info[2];
            ret = l;
        }
    }

    return ret;
}

//da promenim trenutnu lokaciju na krajnju iz voznje
function ChangeCurrentDest(final,username) {

    $.when(
        $.ajax({                    //uzimam krajnju lokaciju
            method: "GET",
            url: "/api/Address",
            data: { id: final },
            dataType: "json",
            success: function (floc) {
                $("#lblhome").empty();
                $('#lblhome').append('Current location: ' + floc);
            },
            error: function (msg) {
                alert( msg.responseText);
            },
            async: false
        }),
    ).then(function () {
        let send = {
            LocationID: final,
            Username: username
        }
        $.ajax({        //menjam curr lok na final lok
            method: "PUT",
            url: "/api/Smart5",
            data: JSON.stringify(send),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                
            },
            error: function (msg) {
                alert( msg.responseText);
            }
        });
    });
}

