$(document).ready(function () {
    $('#btnchangeroles').click(function () {
        $('#divhome').hide();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divadminrequest').hide();

        $('#listallcustomers').empty();
        $('#divallcustomers').show();
        $.ajax({
            method: "GET",
            url: "/api/Musterija",
            dataType: "json",
            success: function (data) {
                
                sessionStorage.setItem("users", JSON.stringify(data));
                $.each(data, function (index, val) {
                    $('#listallcustomers').append(`<li>${val.Username} - ${val.RoleString}<button id='btnchangerole'>Change</button></li>`);
                });

                $.ajax({
                    method: "GET",
                    url: "/api/Vozac",
                    dataType: "json",
                    success: function (data) {

                        let users = JSON.parse(sessionStorage.getItem("users"));    //spojim customere i drivere
                        $.merge(users, data);
                        sessionStorage.setItem("users", JSON.stringify(users));
                        $.each(data, function (index, val) {
                            $('#listallcustomers').append(`<li>${val.Username} - ${val.RoleString}<button class="helper" id='btnchangerole'>Change</button></li>`);
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

        
    });

    

    $("#listallcustomers").delegate("#btnchangerole", "click", function (e) {

        $(this).hide();
        $(".helper").hide();
        $(this).parent().append(`<select id="role">
                            <option selected>Customer</option>
                            <option>Driver</option>
                        </select>`);
        $(this).parent().append(`<button id='btnsavechanges'>Save</button>`) //appendujem na <li>, zato parent
        let index = $(this).parent().index();   //zelim ID trenutnog <li>

        e.stopPropagation(); //da zaustavimo dom
        
        $('#btnsavechanges').click(function () {
            let temp = $('#listallcustomers').find(`li:eq(${index})`).text(); //da pronadjem tekst iz tacno oznacenog <li>
            let info = temp.split('-');
            let user = JSON.parse(sessionStorage.getItem("users"));
            let role = $('#role').val();
            $('.helper').show();
            $.each(user, function (key, value) {
                
                if (value.Username === info[0].substr(0, info[0].length-1)) { //kod username imam razmak, pa skratim
                    $('#listallcustomers').find(`li:eq(${index})`).html(`${value.Username} - ${role}<button class="helper" id='btnchangerole'>Change</button></li>`);

                    let musterija = {
                        Username: value.Username,
                        Role:role
                    }

                    $.ajax({
                        method: "PUT",
                        url: "/api/Vozac",
                        data: JSON.stringify(musterija),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function () {
                           
                        },
                        error: function (msg) {
                            alert("Fail - " + msg.responseText);
                        }
                    });
                }
            });
        });
    });  
});
