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
    function submit_request() {
        let token = $("#_token").val();
        if (!token) return;
        let action = $("#_resendKey").attr('data-action');
        if (!action) return;
        $.ajax({
            type: "POST",
            beforeSend: () => { $(document.body).addClass("loading"); },
            url: action,
            data: { token: token },
            success: function (response) {
                if (response.success) {
                    $('.modal-header').css({ 'background-color': 'darkgreen', 'color': '#fff' });
                    $('.modal-title').text('Information');
                    $('.modal-body').html('<strong>A new activation key is sent to your email.</strong> The email can take few minutes to arrive. If you do not find it, please check the spam folder of your email.');
                }
                else {
                    $('.modal-header').css({ 'background-color': '#ff3333', 'color': '#efffff' });
                    if (response.reason == "invalid request") {
                        $('.modal-title').text('Request Error!');
                        $('.modal-body').text('An invalid request was sent. Please retry.');
                    }
                    else if (response.reason == "already sent") {
                        $('.modal-title').text('Information');
                        $('.modal-body').html('<strong>A new activation key was already sent to you by email.</strong> The email can take few minutes to arrive. If you do not find it, please check the spam folder of your email.');
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
    $(function () {
        $("#logoutBtn").on('click', function (clickEvent) {
            let token = $('#_token').val();
            if (!token) token = '';
            window.location.href = `/chainreaction-online/logout?token=${token}`; //Logout user
        });
        $("#_resendKey").on('click', submit_request);
    });
});