$(document).ready(function () {
    $('#btnrequestdrive').click(function () {
        $('#divrequest').show();
        $('#divhome').hide();
        $('#divprofile').hide();
        $('#divupdate').hide();
        $('#divallcustomers').hide();
    });

    $('#btncreatedrive').click(function () {
        let location = $('#curloc').val();
        let car = $('#typeofcar').val();

        $.ajax({
            method: "POST",
            url: "/api/Musterija",
            data: {carType: car},
            dataType: "json",
            success: function (data) {
                $.ajax({
                    method: "POST",
                    url: "/api/Registration",
                    data: JSON.stringify(musterija),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function () {
                        alert("Succesffully registered");
                        EmptyAllInputs();
                        $("#logDiv").show();
                        $("#regDiv").hide();
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
});

