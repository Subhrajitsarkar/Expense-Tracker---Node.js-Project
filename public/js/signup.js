async function signup(event) {
    try {
        event.preventDefault()

        let signupDetails = {
            name: event.target.name.value,
            email: event.target.email.value,
            password: event.target.password.value
        }
        let response = await axios.post('http://localhost:3000/user/signup', signupDetails)

        if (response.status === 201)
            window.location.href = '/login';
        //window.location.href is used to navigate the browser to a new URL.
        //Here, the user is redirected to '../Login/login.html', which is presumably the login page.
        else
            throw new Error('Failed to login')
    }
    catch (err) {
        console.error('Error in signup:', err.message);
        document.body.innerHTML += `<div>${err}</div>`
    }
}