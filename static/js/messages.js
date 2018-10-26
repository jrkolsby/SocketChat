const renderMessage = (content, username, thisUser) => (
    "<div class='message" + 
    (username == thisUser ? " personal" : "") + 
    "'><span>" + username + "</span>" + content + "</div>"
);

const messagePacket = (username, content, token) => ({
    type: "MESSAGE",
    payload: {
        username,
        content,
        token 
    }
});

let updateMessages = (username) => {
    $('.chat .message').each(function() {
        if ($(this).children('span')
                   .html() == username) {
            $(this).addClass('personal') 
        } 
    }) 
}

$(document).ready(() => {
    let state = {
        login: false,
        username: "",
        usertoken: "" 
    }

    var socket = io.connect('http://localhost:5000')

    $('html, body').scrollTop($('.chat').height())

    socket.on('connect', () => {
        console.log('User has connected');
    })

    socket.on('message', (packet) => {
        switch (packet.type) {
            case "MESSAGE":
                const message = packet.payload
                $('.chat').append(renderMessage(
                    message.content,
                    message.username,
                    state.username
                )) 

                break;
            default:
                break;
        
        }
        $('html, body').scrollTop($('.chat').height())
    })

    $('div.message span').on('click', (e) => {
        
        window.location = "/user/" + $(e.target).html();
    })

    $('button.send').on('click', () => {
        socket.send(messagePacket(state.username, 
                                  $('input.message').val(),
                                  state.usertoken))
        $('input.message').val("")
    })

    $('a.signup').on('click', () => {
        var user = $('input.user').val()
        var pass = $('input.pass').val() 

        $.ajax({
            type: "POST",
            url: "/signup",
            data: { user, pass },
            success: (response) => {
                switch (response.type) {
                    case "SUCCESS":
                        state.username = user
                        state.usertoken = response.payload
                        $('div.login').fadeOut()
                        break;
                    case "ERROR":
                        alert(response.payload)
                        break;
                    default:
                        break;            
                }
            }
        })
    })

    $('button.login').on('click', () => {
        var user = $('input.user').val()
        var pass = $('input.pass').val() 

        $.ajax({
            type: "POST",
            url: "/login",
            data: { user, pass },
            success: (response) => {
                switch (response.type) {
                    case "SUCCESS":
                        state.username = user
                        state.usertoken = response.payload
                        $('div.modal.login').fadeOut()
                        updateMessages(state.username)
                        break;
                    case "ERROR":
                        alert(response.payload)
                        break;
                    default:
                        break;
                
                }
            }
        })
    })

});
