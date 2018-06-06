$(document).ready(function () {
    $("#register").click(function () {
        var name = $("#name").val();
        var email = $("#email").val();
        var password = $("#password").val();
        var cpassword = $("#cpassword").val();
        var username = $("#username").val();
        var lastname = $("#lastname").val();
        var gender = $('input[name=Gender]:checked').val(); //vezano za radio button
        var identification = $("#jmbg").val();
        var phone = $("#phone").val();
        var type = $('input[name=Role]:checked').val();
        var status = true;

        if (name === "" || email === "" || password === "" || cpassword === "" || username === '' || lastname === "" || identification === "" || phone === "") {
            alert("All fields are required.");
            status = false;
        } else {
            if ((password.length) < 8 || password.length > 25) {
                $("#password").css('background-color', '#F9D3D3');
                $('#password')[0].type = 'text';
                $('#password').val("");
                $("#password").attr("placeholder", "Lenght: 8 - 25 chars");
                //$("#password").val($("#password").attr("placeholder","nesto"))
                status = false;
            } else {
                $("#password").css('background-color', "white");
                $('#password')[0].type = "password";
                $("#password").attr("placeholder", "");

            }

            if (name.length < 3) {
                $("#name").css('background-color', '#F9D3D3');
                status = false;
            } else {
                $("#name").css('background-color', "white");
                
            }

            if (username.length < 3) {
                $("#username").css('background-color', '#F9D3D3');
                status = false;
            } else {
                $("#username").css('background-color', "white");
                
            }

            if (lastname.length < 3) {
                $("#lastname").css('background-color', '#F9D3D3');
                status = false;
            } else {
                $("#lastname").css('background-color', "white");
                
            }

            if (identification.length !== 13) {
                $("#jmbg").css('background-color', '#F9D3D3');
                status = false;
            } else {
                $("#jmbg").css('background-color', "white");
                
            }

            if (phone.length !== 10) {
                $("#phone").css('background-color', '#F9D3D3');
                status = false;
            }
            else {
                $("#phone").css('background-color', "white");
                
            }

            if (password !== cpassword) {
                alert("Your password and confirmed password doesn't match.")
                status = false;
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
                Role: type
            };

            $.ajax({
                method: "POST",
                url: "/api/Registration",
                data: JSON.stringify(musterija),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function () {
                    alert("Succesffully registered");
                    //sessionStorage.setItem("token",vrednost)
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            });
        }
    });
});