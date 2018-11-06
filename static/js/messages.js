$(document).ready(() => {

    const renderMessage = (id, content, username, thisUser) => (
        $('.chat').append(
            "<div ref='" + id + "' class='message" + 
            (username == thisUser ? " personal" : "") + 
            "'><span>" + username + "</span>" + content + "</div>"
        ).on('click', messageClick)
    );

    const votePacket = (messageID, username, token) => ({
        type: "VOTE",
        payload: {
            messageID,
            username, 
            token 
        }
    })

    const messagePacket = (content, username, token) => ({
        type: "MESSAGE",
        payload: {
            username,
            content,
            token 
        }
    });

    const updateVotes = (id, votes) => {
        $('.chat .message[ref=' + id + ']').children('span.votes').html(votes)
    }

    const updateMessages = (username) => {
        $('.chat .message').each(function() {
            if ($(this).children('span')
                       .html() == username) {
                $(this).addClass('personal') 
            } 
        }) 
    }

    const hideModal = (modal) => {
        modal.fadeOut()
    }

    const showModal = (modal) => {
        modal.fadeIn()
    }

    const messageClick = (m) => {
        const message = $(m.target);
        
        if (message.hasClass('personal')) {
            return;    
        } else {
            console.log('sent vote packet!!')
            socket.send(votePacket(message.attr('ref'),
                                   state.username,
                                   state.usertoken))
        }
    }

    let state = {
        login: false,
        username: "",
        usertoken: "" 
    }

    const voteModal = $('div.modal.vote').hide()
    const loginModal = $('div.modal.login').hide()
    const signupModal = $('div.modal.signup').hide()

    loginModal.children('a.signup').on('click', () => {
        showModal(signupModal)
        hideModal(loginModal) 
    });

    showModal(loginModal)
        
    signupModal.children('button').on('click', () => {
        var user = signupModal.children('input.user').val()
        var pass = signupModal.children('input.pass').val() 

        $.ajax({
            type: "POST",
            url: "/signup",
            data: { user, pass },
            success: (response) => {
                switch (response.type) {
                    case "SUCCESS":
                        state.username = user
                        state.usertoken = response.payload
                        hideModal(signupModal)
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

    loginModal.children('button').on('click', () => {
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
                        updateMessages(state.username)
                        hideModal(loginModal)
                        break;

                    case "ERROR":
                        alert(response.payload)
                        break;

                    default:
                        break;
                
                }
            }
        });
    });

    var socket = io.connect('http://localhost:5000')

    $('html, body').scrollTop($('.chat').height())

    socket.on('connect', () => {
        console.log('User has connected');
    })

    $('.chat .message').on('click', messageClick)
    
    socket.on('message', (packet) => {
        switch (packet.type) {
            case "VOTE":
                const vote = packet.payload
                updateVotes(vote.id, 
                            vote.count)
                break;

            case "MESSAGE":
                const message = packet.payload
                renderMessage(
                    message.id,
                    message.content,
                    message.username,
                    state.username
                )

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
        socket.send(messagePacket($('input.message').val(),
                                  state.username,
                                  state.usertoken))
        $('input.message').val("")
    })

});
