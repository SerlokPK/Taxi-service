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

    $('#inpfiltsts').mouseover(function () {
        $('#inpforall').show();
    }).mouseout(function () {
        $('#inpforall').hide();
    });
});


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
//TO DO NAPRAVI DA NA KLIK ALL VRACA SVE VOZNJE ZA ODGOVARAJUCU OSOBU
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