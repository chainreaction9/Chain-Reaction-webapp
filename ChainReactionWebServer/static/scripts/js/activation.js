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
        let token = $("#_token").val();
        if (token.length < 5) {
            this.validForm = false;
            if (!this.firstError) this.firstError = $("#_token");
        }
        if (this.firstError) this.firstError.focus();
        return this.validForm;
    }
    function submit_form() {
        let valid = validate_form();
        if (valid === true) {
            let action = $("#custom-token-form").attr('action');
            let form_data = {
                _user: $("#_user").val(),
                _activation_key: $("#_token").val()
            };
            $.ajax({
                type: "POST",
                beforeSend: () => { $(document.body).addClass("loading"); },
                data: form_data,
                url: action,
                success: function (response) {
                    if (response.success) {
                        $('.modal-header').css({ 'background-color': 'darkgreen', 'color': '#fff' });
                        $('.modal-title').text('Account Activation Successful');
                        $('.modal-body').html('<b>Your account was successfully activated!</b><p>Sign in with your account and start playing!</p>');
                        $('#_closeBtnSecondary').css('visibility', 'hidden');
                        $('#_closeBtnPrimary').css('display', 'none');
                        $('#_signin').css('display', 'block');
                        $('#myModal').modal({ backdrop: 'static', keyboard: false });
                    }
                    else {
                        $('.modal-header').css({ 'background-color': '#ff3333', 'color': '#efffff' });
                        if (response.reason == "invalid request") {
                            $('.modal-title').text('Request Error!');
                            $('.modal-body').text('An invalid request was sent. Please retry.');
                        }
                        else if (response.reason == "invalid key") {
                            $('.modal-title').text('Invalid Activation Key!');
                            $('.modal-body').text('The activation key is not valid. Please retry.');
                        }
                        else {
                            $('.modal-title').text('Request Error!');
                            $('.modal-body').html(`Server rejected your activation request. Reason: <b>${response.reason}</b>.`);
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
        $("#custom-token-form").on('submit', submit_form);
    });
});