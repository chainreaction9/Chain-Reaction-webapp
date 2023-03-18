requirejs.config({
    baseUrl: "chainreaction-offline/scripts/js",
    waitSeconds: 300,
    paths: {
        "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min"],
        "bootstrap": ["https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min"]
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
        return valid;
    }
    $(function () {
        $("#custom-token-form").on('submit', submit_form);
    });
});