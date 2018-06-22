$(document).ready(function () {
    $("#register").click(function () { //registrovanje
        let name = $("#name").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let cpassword = $("#cpassword").val();
        let username = $("#username").val();
        let lastname = $("#lastname").val();
        let gender = $('input[name=Gender]:checked').val(); //vezano za radio button
        let identification = $("#jmbg").val();
        let phone = $("#phone").val();
        let status = true;

        if (name === "" || email === "" || password === "" || cpassword === "" || username === '' || lastname === "" || identification === "" || phone === "") {
            alert("All fields are required.");
            status = false;
        } else {
            if ((password.length) < 6 || password.length > 25) {
                $("#password").css('background-color', '#F9D3D3');
                $('#password')[0].type = 'text';
                $('#password').val("");
                $("#password").attr("placeholder", "Lenght: 6 - 25 characters");
                status = false;
            } else {
                $("#password").css('background-color', "white");
                $('#password')[0].type = "password";
                $("#password").attr("placeholder", "");
            }

            if (name.length < 3) {
                $("#name").css('background-color', '#F9D3D3');
                status = false;
                $('#name').val("");
                $("#name").attr("placeholder", "Name should have at least 3 characters");
            } else {
                $("#name").css('background-color', "white");
                $("#name").attr("placeholder", "");
            }

            if (username.length < 3) {
                $("#username").css('background-color', '#F9D3D3');
                status = false;
                $('#username').val("");
                $("#username").attr("placeholder", "Username should have at least 3 characters");
            } else {
                $("#username").css('background-color', "white");
                $("#username").attr("placeholder", "");
            }

            if (lastname.length < 3) {
                $("#lastname").css('background-color', '#F9D3D3');
                status = false;
                $('#lastname').val("");
                $("#lastname").attr("placeholder", "Lastname should have at least 3 characters");
            } else {
                $("#lastname").css('background-color', "white");
                $("#lastname").attr("placeholder", "");
            }

            if (identification.length !== 13 || isNaN(identification)) {
                $("#jmbg").css('background-color', '#F9D3D3');
                status = false;
                $('#jmbg').val("");
                $("#jmbg").attr("placeholder", "Identification number must have 13 characters");
            } else {
                $("#jmbg").css('background-color', "white");
                $("#jmbg").attr("placeholder", "");
            }

            if (phone.length !== 10 || isNaN(phone)) {
                $("#phone").css('background-color', '#F9D3D3');
                status = false;
                $('#phone').val("");
                $("#phone").attr("placeholder", "Phone number must have 10 numbers");
            }
            else {
                $("#phone").css('background-color', "white");
                $("#phone").attr("placeholder", "");
            }

            if (password !== cpassword) {
                status = false;
                $("#password").css('background-color', '#F9D3D3');
                $('#password').val("");
                $('#cpassword')[0].type = 'text';
                $("#cpassword").css('background-color', '#F9D3D3');
                $('#cpassword').val("");
                $("#cpassword").attr("placeholder", "Mismatch in password");
            } else {
                if (status) {
                    $("#password").css('background-color', "white");
                    $("#cpassword").css('background-color', "white");
                    $('#cpassword')[0].type = 'password';
                    $("#phone").attr("placeholder", "");
                }
                
            }

            let info = [];
            info = email.split('.');

            if (!email.includes('@') || !email.includes('.') || info[1].length < 2) {
                $("#email").css('background-color', '#F9D3D3');
                $('#email').val("");
                $("#email").attr("placeholder", "Incorect format");
                status = false;
            } else {
                $("#email").css('background-color', 'white');
                $("#email").attr("placeholder", "");
            }
        }

        if (status) {
            let musterija = {
                Name: name,
                Email: email,
                Password: password,
                Username: username,
                Lastname: lastname,
                Gender: gender,
                Jmbg: identification,
                PhoneNumber: phone,
            };

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
        }
    });

    //logovanje
    $("#login").click(function () { 
        let username = $("#usernameLog").val();
        let password = $("#passwordLog").val();
        let status = true;

        if (password === "" || username === '') {
            alert("All fields are required.");
            status = false;
        } else {

            $.ajax({
                method: "POST",
                url: "/api/LogIn",
                data: JSON.stringify({ Username: username, Password: password}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    sessionStorage.setItem("logged", JSON.stringify(response)); //cuvam ulogovanu musteriju kao string
                    //console.log("Ovo pise -" + sessionStorage["logged"]);
                    alert("Succesffully logged in");
                    window.location.href = "/HTML/index.html"; //kada se uspesno ulogujem, idem na main stranicu
                },
                error: function (msg) {
                    alert("Error - " + msg.responseText);
                }
            });
        }
    });

    $("#btnsign").click(function () {
        $("#logDiv").hide();
        $("#regDiv").show();
    });

    $("#btnlog").click(function () {
        $("#logDiv").show();
        $("#regDiv").hide();
    });
});

//da ispraznim sva polja unutar regstracione forme nakon uspesnog registrovanja
function EmptyAllInputs() {
    var name = $("#name").val("");
    var email = $("#email").val("");
    var password = $("#password").val("");
    var cpassword = $("#cpassword").val("");
    var username = $("#username").val("");
    var lastname = $("#lastname").val("");
    var identification = $("#jmbg").val("");
    var phone = $("#phone").val("");
}