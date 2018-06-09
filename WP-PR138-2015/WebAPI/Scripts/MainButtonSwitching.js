$(document).ready(function () {
    $('#btnhome').click(function () {
        $('#divhome').show();
        $('#divprofile').hide();
        $('#divupdate').hide();
    });

    $('#btnprofile').click(function () {
        $('#divprofile').show();
        $('#divhome').hide();
        $('#divupdate').hide();
    });
});