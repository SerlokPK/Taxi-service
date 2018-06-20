$(document).ready(function (status = true) {
    $('#btnfilter').click(function () {                 //filtriranje po statusu
        let filter = $("#inpfiltsts").val();
        filter = filter.toLowerCase();

        if (filter == 'all') {
            ShowAll2();
        }
        else if (filter !== 'created' && filter !== 'declined' && filter !== 'formed' && filter !== 'processed' && filter !== 'accepted' && filter !== 'failed' && filter !== 'successful' && filter !== 'inprogress') {
            alert('Filter is incorect');
        } else {
            Filter(filter);
        }
    });
    //za popup msg box
    $('#inpfiltsts').mouseover(function () {
        $('.popdiv').show();
    }).mouseout(function () {
        $('.popdiv').hide();
    });

    //za date sort
    $('#btndatesort').click(function () {
        SortByDate(); 
    });
    // za grade sort
    $('#btngradesort').click(function () {
        SortByGrade();
    });
    //za search
    $('#btnsrcdrvshome').click(function () {
        let option = $('#srcdrvshome').val();
        let fromTxt = $('#inpfromsrc').val();
        let toTxt = $('#inptosrc').val();

        if (fromTxt === "" && toTxt === "") {       //oba prazna
            $('#inptosrc').val("");
            $('#inpfromsrc').val("");

            alert('You must at least fill one of inputs');
        } else if (fromTxt !== "" && toTxt !== "") {    //oba puna
            SearchDrives(option, fromTxt, toTxt);
        } else if (fromTxt !== "" && toTxt === "") {             //prvi pun

        } else if (fromTxt === "" && toTxt !== "") {        //drugi pun

        }      
    });
});

function SearchDrives(option, fromTxt, toTxt) {
    switch (option) {
        case 'Date': {
            let sts1 = ValidateDate(fromTxt);
            let sts2 = ValidateDate(toTxt);

            if (sts1 && sts2) {
                // TO DO POSALJI DATUME, RAZDVOJ IH, NAPRAVI TAMO DATETIME, SEARCHUJ I VRATI PODATKE

            } else {
                $('#inptosrc').val("");
                $('#inpfromsrc').val("");
                alert('Incorect format, try again - Format: dd mm yyyy');
            }
        }
    }
}

function ValidateDate(data) {
    let date = data.split(' ');
    let status = true;

    if (date.length === 1 && (isNan(date[0]) || date[0].length > 2)) {
        status = false;
    } else if (date.length === 2 && (isNan(date[0]) || isNan(date[2]) || date[0].length > 2 || date[1].length > 2)) {
        status = false;
    } else if (date.length === 3 && (isNaN(date[0]) || isNaN(date[1]) || isNaN(date[2]) || date[0].length > 2 || date[1].length > 2 || date[2].length !== 4)) {
        status = false;
    } else if (date.length > 3) {
        status = false;
    }
    
    return status;
}

function SearchDateByBoth(option,fromTxt,toTxt) {
    let loggedUser = JSON.parse(sessionStorage.getItem('logged'));
    let send = {
        option: option,
        from: fromTxt,
        to: toTxt
    }

    $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovog vozaca
        method: "GET",
        url: "/api/Smart4",
        data: JSON.stringify(send),
        dataType: "json",
        success: function (response) {
            $("#lbldrives").empty();
            $('#lbldrives').append('=================Drives=================');

            $.each(response, function (index, value) {
                let startLoc;
                let endLoc;
                let comments = [];
                if (loggedUser.RoleString === 'Admin') {
                    if (loggedUser.Username === value.AdminID) {
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
                            if (comments.length > 0) {
                                if (value.DriverID != null) {
                                    $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                            }

                        });
                    }
                } else if (loggedUser.RoleString === 'Driver') {
                    if (loggedUser.Username === value.DriverID) {
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
                                async: false                //stavljamo da bi poziv sacekao da se zavrsi i onda lepo ispisao
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
                            if (comments.length > 0) {
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
                            }

                        });
                    }
                } else {
                    if (loggedUser.Username === value.UserCallerID) {
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
                            if (comments.length > 0) {
                                if (value.AdminID != null) {
                                    $('#lbldrives').append(`<br />Admin: ${value.AdminID}`);
                                }

                                if (value.DriverID != null) {
                                    $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                            }

                        });
                    }
                }

            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}

function SortByGrade() {
    let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

    $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovog vozaca
        method: "GET",
        url: "/api/Smart3",
        data: { sortType: 'Grade' },
        dataType: "json",
        success: function (response) {
            $("#lbldrives").empty();
            $('#lbldrives').append('=================Drives=================');

            $.each(response, function (index, value) {
                let startLoc;
                let endLoc;
                let comments = [];
                if (loggedUser.RoleString === 'Admin') {
                    if (loggedUser.Username === value.AdminID) {
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
                            if (comments.length > 0) {
                                if (value.DriverID != null) {
                                    $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                            }
                            
                        });
                    }
                } else if (loggedUser.RoleString === 'Driver') {
                    if (loggedUser.Username === value.DriverID) {
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
                                async: false                //stavljamo da bi poziv sacekao da se zavrsi i onda lepo ispisao
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
                            if (comments.length > 0) {
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
                            }
                            
                        });
                    }
                } else {
                    if (loggedUser.Username === value.UserCallerID) {
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
                            if (comments.length > 0) {
                                if (value.AdminID != null) {
                                    $('#lbldrives').append(`<br />Admin: ${value.AdminID}`);
                                }

                                if (value.DriverID != null) {
                                    $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                            }
                            
                        });
                    }
                }

            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}

function SortByDate() {
    let loggedUser = JSON.parse(sessionStorage.getItem('logged'));

    $.ajax({                    //uzimam sve voznje, ali cu priokazati samo od ovog vozaca
        method: "GET",
        url: "/api/Smart3",
        data: { sortType: 'Date' },
        dataType: "json",
        success: function (response) {
            $("#lbldrives").empty();
            $('#lbldrives').append('=================Drives=================');

            $.each(response, function (index, value) {
                let startLoc;
                let endLoc;
                let comments = [];
                if (loggedUser.RoleString === 'Admin') {
                    if (loggedUser.Username === value.AdminID) {
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
                                $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                } else if (loggedUser.RoleString === 'Driver') {
                    if (loggedUser.Username === value.DriverID) {
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
                                async: false                //stavljamo da bi poziv sacekao da se zavrsi i onda lepo ispisao
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
                } else {
                    if (loggedUser.Username === value.UserCallerID) {
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

                            if (value.DriverID != null) {
                                $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                }

            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}

function Filter(filter) {
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
                if (loggedUser.RoleString === 'Admin') {
                    if (value.StatusString.toLowerCase() == filter && loggedUser.Username === value.AdminID) {
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

                            if (value.DriverID != null) {
                                $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                } else if (loggedUser.RoleString === 'Driver') {
                    if (value.StatusString.toLowerCase() === filter && loggedUser.Username === value.DriverID) {
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
                } else {
                    if (value.StatusString.toLowerCase() === filter && loggedUser.Username === value.UserCallerID) {
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
                            if (value.AdminID != null) {
                                $('#lbldrives').append(`<br />Admin: ${value.AdminID}`);
                            }

                            if (value.DriverID != null) {
                                $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                }

            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}

function ShowAll2() {
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
                if (loggedUser.RoleString === 'Admin') {
                    if (loggedUser.Username === value.AdminID) {
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

                            if (value.DriverID != null) {
                                $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                } else if (loggedUser.RoleString === 'Driver') {
                    if (loggedUser.Username === value.DriverID) {
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
                } else {
                    if (loggedUser.Username === value.UserCallerID) {
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
                            if (value.AdminID != null) {
                                $('#lbldrives').append(`<br />Admin: ${value.AdminID}`);
                            }

                            if (value.DriverID != null) {
                                $('#lbldrives').append(`<br />Driver: ${value.DriverID}`);
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
                }

            });
            $('#divridescudr').show();
        },
        error: function (msg) {
            //alert("Fail - " + msg.responseText);
        }
    });
}