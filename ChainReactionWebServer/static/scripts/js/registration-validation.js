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
    function check_password() {
        let p1 = $("#_pass").val();
        let p2 = $("#_passAgain").val();
        if (p1 !== p2) {
            if (!document.getElementById("_passwordWarning").hasAttribute("class")) {
                document.getElementById("_passwordWarning").setAttribute("class", "tooltip tooltip-bottom-right");
            }
            document.getElementById("_passwordWarning").innerHTML = "These passwords don't match.";
            $("#_passAgain").val(p2);
            $("#_passAgain").focus();
            return false;
        }
        else {
            document.getElementById("_passwordWarning").removeAttribute('class');
            document.getElementById("_passwordWarning").innerHTML = "";
            $("#_passAgain").val(p2);
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
        let password = $("#_pass").val();
        if (password.length < 5) {
            this.validForm = false;
            if (!this.firstError) this.firstError = $("#_pass");
        }
        let valid = check_password();
        if (valid === false) {
            if (!this.firstError) this.firstError = $("#_passAgain");
            this.validForm = false;
        }
        valid = check_email();
        if (valid === false) {
            if (!this.firstError) this.firstError = $("#_email");
            this.validForm = false;
        }
        if (this.firstError) this.firstError.focus();
        return this.validForm;
    }
    function submit_form() {
        let valid = validate_form();
        if (valid === true) {
            let action = $("#registration-form").attr('action');
            let form_data = {
                _user: $("#_user").val(),
                _pass: $("#_pass").val(),
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
                        $('.modal-title').text('Registration Successful!');
                        $('.modal-body').html('<b>Your account is successfully created!</b><p>Sign in with your account and start playing!</p>');
                        $('#_closeBtnSecondary').css('visibility', 'hidden');
                        $('#_closeBtnPrimary').css('display', 'none');
                        $('#_signin').css('display', 'block');
                        $('#myModal').modal({ backdrop: 'static', keyboard: false });
                    }
                    else {
                        $('.modal-header').css({ 'background-color': '#ff3333', 'color': '#efffff' });
                        if (response.reason == "user exists") {
                            $('.modal-header').css({ 'background-color': '#ff9900' });
                            $('.modal-title').text('Information');
                            $('.modal-body').html('<strong>Username already exists. Please try a different one.</strong>');
                            $('#_user_tooltip').html("Username already exists.");
                            $('#_user').focus();
                        }
                        else if (response.reason == "invalid request") {
                            $('.modal-title').text('Invalid Request!');
                            $('.modal-body').text('An invalid request was sent. Please retry.');
                        }
                        else if (response.reason == "invalid email") {
                            $('.modal-title').text('Invalid email ID!');
                            $('.modal-body').text('The email address is not valid. Please retry.');
                        }
                        else {
                            $('.modal-title').text('Registration Error!');
                            $('.modal-body').html(`Server rejected your sign-up request for the following reason: <b>${response.reason}</b>.`);
                        }
                    }
                    $("#myModal").addClass('fade');
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
        $("#_passAgain").on('input', check_password);
        $("#_email").on('input', check_email);
        $("#_user").on('input', () => { $("#_user_tooltip").html("Only letters, numbers and period, atleast 5 and at max 15 characters long."); });
        $("#registration-form").on('submit', submit_form);
    });
});