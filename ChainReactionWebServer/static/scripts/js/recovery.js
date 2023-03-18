requirejs.config({
    baseUrl: "chainreaction-offline/scripts/js",
    waitSeconds: 300,
    paths: {
        "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min"],
        "bootstrap": ["https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min"]
    },
    shim: {
        "bootstrap": ["jquery"]
    }
});

require(["jquery", "bootstrap"], function ($, bootstrap) {
    function check_email() {
        let emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        let emailInput = $("#_email").val();
        if (!emailReg.test(emailInput)) {
            if (!document.getElementById('_emailWarning').hasAttribute('class')) {
                document.getElementById("_emailWarning").setAttribute("class", "tooltip tooltip-bottom-right");
            }
            document.getElementById("_emailWarning").innerHTML = "Please enter a valid email address.";
            $("#_email").focus();
            return false;
        }
        else {
            document.getElementById("_emailWarning").removeAttribute('class');
            document.getElementById("_emailWarning").innerHTML = "";
            return true;
        }
    }
    function validate_form() {
        this.validForm = true;
        this.firstError = null
        let reg = /[^a-zA-Z0-9\.]+/;
        let username = $("#_user").val();
        if (reg.test(username)) {
            this.validForm = false;
            this.firstError = $("#_user");
        }
        if (username.length < 5) {
            this.validForm = false;
            this.firstError = $("#_user");
        }
        if (username.length > 15) {
            this.validForm = false;
            this.firstError = $("#_user");
        }
        if (this.firstError) this.firstError.focus();
        return this.validForm;
    }
    function submit_form() {
        let valid = validate_form();
        if (valid === true) {
            let action = $("#password-reset-form").attr('action');
            let form_data = {
                _user: $("#_user").val(),
                _email: $("#_email").val()
            };
            $.ajax({
                type: "POST",
                beforeSend: () => { $(document.body).addClass("loading"); },
                data: form_data,
                url: action,
                success: function (response) {
                    if (response.success) {
                        $('.modal-header').css({ 'background-color': 'darkgreen', 'color': '#fff' });
                        $('.modal-title').text('Information');
                        $('.modal-body').html('<b>A link for resetting your password is sent to the registered email! Please make sure to check the spam folder of your email.</b>');
                    }
                    else {
                        $('.modal-header').css({ 'background-color': '#ff3333', 'color': '#efffff' });
                        if (response.reason == "invalid request") {
                            $('.modal-title').text('Invalid Request!');
                            $('.modal-body').text('An invalid request was sent. Please retry.');
                        }
                        else {
                            $('.modal-title').text('Request Error!');
                            $('.modal-body').html(`Server rejected your request. Reason: <b>${response.reason}</b>.`);
                        }
                    }
                    $("#myModal").addClass("fade");
                    $("#myModal").modal('show');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    $('.modal-header').css({ 'background-color': '#ff3333', 'color': '#111111' });
                    $('.modal-title').text('Connection Error!');
                    $('.modal-body').text('An error occured while connecting to the server. See console for details.');
                    $("#myModal").addClass("fade");
                    $("#myModal").modal('show');
                },
                complete: () => { $(document.body).removeClass('loading'); }
            });
        }
        return false;
    }
    $(function () {
        $("#_email").on('input', check_email);
        $("#password-reset-form").on('submit', submit_form);
    });
});