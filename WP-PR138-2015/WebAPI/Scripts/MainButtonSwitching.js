$(document).ready(function (status = true) {
    let logUser = JSON.parse(sessionStorage.getItem("logged")); //vadim iz sesije korisnika i parsiram u JSON obj

    $('#tdusername').html(logUser.Username);
    $('#tdname').html(logUser.Name);
    $('#tdlastname').html(logUser.Lastname);
    $('#tdemail').html(logUser.Email);
    $('#tdpw').html(logUser.Password);
    $('#tdjmbg').html(logUser.Jmbg);
    $('#tdphone').html(logUser.PhoneNumber);
    $('#tdgender').html(logUser.GenderString);

    $('#btnhome').click(function () { //home btn
        $('#divhome').show();
        $('#divprofile').hide();
        $('#divupdate').hide();
    });

    $('#btnprofile').click(function () { //pocetni podaci
        $('#divprofile').show();
        $('#divhome').hide();
        $('#divupdate').hide();
    });

    $('#btnChange').click(function () { //update forma
        $('#divprofile').hide();
        $('#divhome').hide();
        $('#divupdate').show();
    });

    $('#btnupdate').click(function () { //izvrsi update
        let name = $("#name").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let lastname = $("#lastname").val();
        let gender = $('#gender').val();
        let identification = $("#jmbg").val();
        let phone = $("#phone").val();
        let status = true;

        if (name === "" || email === "" || password === "" || lastname === "" || identification === "" || phone === "") {
            alert("All fields are required.");
            status = false;
        } else {
            if ((password.length) < 6 || password.length > 25) {
                $("#password").css('background-color', '#F9D3D3');
                $('#password').val("");
                $("#password").attr("placeholder", "Lenght: 6 - 25 characters");
                status = false;
            } else {
                $("#password").css('background-color', "white");
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
                Username: logUser.Username,
                Lastname: lastname,
                GenderString: gender,
                Jmbg: identification,
                PhoneNumber: phone,
            };

            SetStartingProfile(logUser, musterija);

            $.ajax({
                method: "PUT",
                url: "/api/Musterija",
                data: JSON.stringify(musterija),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function () {
                    alert("Entity updated");
                    EmptyAllInputs();
                    $('#divprofile').show();
                    $('#divupdate').hide();
                },
                error: function (msg) {
                    alert("Fail - " + msg.responseText);
                }
            });
        }
    });
});

function SetStartingProfile(logUser, musterija) {
    logUser.Name = musterija.Name;
    logUser.Lastname = musterija.Lastname;
    logUser.Password = musterija.Password;
    logUser.Email = musterija.Email;
    logUser.Jmbg = musterija.Jmbg;
    logUser.GenderString = musterija.GenderString;
    logUser.PhoneNumber = musterija.PhoneNumber;

    //moramo da setujemo i Gender, u odgovarajuci int
    switch (musterija.GenderString) {
        case 'Male':
            {
                logUser.Gender = 0;
            } break;
        case 'Female':
            {
                logUser.Gender = 1;
            }
    }

    $('#tdusername').html(logUser.Username);
    $('#tdname').html(logUser.Name);
    $('#tdlastname').html(logUser.Lastname);
    $('#tdemail').html(logUser.Email);
    $('#tdpw').html(logUser.Password);
    $('#tdjmbg').html(logUser.Jmbg);
    $('#tdphone').html(logUser.PhoneNumber);
    $('#tdgender').html(logUser.GenderString);

    sessionStorage.setItem("logged", JSON.stringify(logUser));
}

//da ispraznim sva polja unutar regstracione forme nakon uspesnog registrovanja
function EmptyAllInputs() {
    $('#password').val("");
    $('#name').val("");
    $('#lastname').val("");
    $('#email').val("");
    $('#jmbg').val("");
    $('#phone').val("");
}