document.addEventListener('DOMContentLoaded', e => {
    document
        .getElementById('submit-msg')
        .addEventListener('submit', e => {
            const conversation = {
                message: document.getElementById('msg').value
            }

            fetch('/message/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(conversation)
            })
                .then(response => { })
                .then(data => {
                    window.location.href = '/';
                })
        })
})