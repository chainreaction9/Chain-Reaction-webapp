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
        if (this.firstError) this.firstError.focus();
        return this.validForm;
    }
    function submit_form() {
        let valid = validate_form();
        return valid;
    }
    $(function () {
        $("#_passAgain").on('input', check_password);
        $("#password-reset-form").on('submit', submit_form);
    });
});