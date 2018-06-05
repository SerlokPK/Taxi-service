$(document).ready(function () {
    $("#register").click(function () {
        var name = $("#name").val();
        var email = $("#email").val();
        var password = $("#password").val();
        var cpassword = $("#cpassword").val();
        var username = $("#username").val();
        var lastname = $("#lastname").val();
        var gender = $('input[name=gender]:checked').val(); //vezano za radio button
        var identification = $("#jmbg").val();
        var phone = $("#phone").val();
        var type = $('input[name=type]:checked').val();

        if (name === "" || email === "" || password === "" || cpassword === "" || username === '' || lastname === "" || identification === "" || phone === "") {
            alert("Please fill all fields...!!!!!!");
        } else if ((password.length) < 8 || password.length > 16) {
            alert("Password should atleast 8 character in length...!!!!!!");
        } else if (name.length < 3) {
            alert("Password should atleast 8 character in length...!!!!!!");
        } else if (username.length < 3) {
            alert("Password should atleast 8 character in length...!!!!!!");
        } else if (lastname.length < 3) {
            alert("Password should atleast 8 character in length...!!!!!!");
        } else if (identification.length !== 13) {
            alert("Password should atleast 8 character in length...!!!!!!");
        } else if (phone.length !== 10) {
            alert("Password should atleast 8 character in length...!!!!!!");
        }
        else if (!(password).match(cpassword)) {
            alert("Your passwords don't match. Try again?");
        } else {
            $.post("register.php", {
                name1: name,
                email1: email,
                password1: password
            }, function (data) {
                if (data === 'You have Successfully Registered.....') {
                    $("form")[0].reset();
                }
                alert(data);
            });
        }
    });
});