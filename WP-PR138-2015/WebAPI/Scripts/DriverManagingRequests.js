$(document).ready(function () {
    $('#btnacptreq').click(function () {            //dgume za prikaz svih customera
        let user = JSON.parse(sessionStorage.getItem('logged'));

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

            $.ajax({                //vracam sve voznje
                method: "GET",
                url: "/api/Voznja",
                dataType: "json",
                success: function (data) {
                    sessionStorage.setItem("voznje", JSON.stringify(data));
                    $('#olforcrtreq').empty();
                    $.each(data, function (index, val) {
                        $.ajax({            //za svaku voznju vracam lokaciju posebno
                            method: "GET",
                            url: "/api/Address",
                            data: { id: val.StartPointID },
                            dataType: "json",
                            success: function (response) {
                                $('#olforcrtreq').append(`<li>Pickup location: ${response} <button id='btnaccrequest'>Accept</button></br>Wanted car: ${val.TypeString}<input type="hidden" id="${val.Id}"></li>`);
                            },
                            error: function (msg) {
                                alert("Fail - " + msg.responseText);
                            }
                        });
                    });
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            });
        }
    });

    $("#olforcrtreq").delegate("#btnaccrequest", "click", function () {
        let index = $(this).parent().index();   //zelim ID trenutnog <li>
        let temp = $('#olforcrtreq').find(`li:eq(${index})`).html(); //da pronadjem tekst iz tacno oznacenog <li>
        let voznje = JSON.parse(sessionStorage.getItem("voznje"));

        let driver = JSON.parse(sessionStorage.getItem('logged'));

        let info = temp.split('"');
        let id = info[5];      //id voznje

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
                        $('#lblfordriver').append(`====Accepted drive===== <br />Location: ${response}<br />Status: ${data.StatusString}<br />Reservation time: ${data.TimeOfReservation}
                                                            <br /><button id='btnfnsdrv'>Finish</button>`);
                        $('#divallreqcreated').hide();
                        $('#divhome').show();
                    },
                    error: function (msg) {
                        alert("Fail - " + msg.responseText);
                    }
                });                
            },
            error: function (msg) {
                alert("Fail - " + msg.responseText);
                $('#divallreqcreated').hide();
                $('#divhome').show();
            }
        });
    }); 
});