async function signup(event) {
    try {
        event.preventDefault()
        console.log(event.target.email.value);

        let signupDetails = {
            name: event.target.name.value,
            email: event.target.email.value,
            password: event.target.password.value
        }
        console.log(signupDetails);
        let response = await axios.post('http://localhost:3000/user/signup', signupDetails)
        if (response.status === 201)
            window.location.href = '../Login/login.html'
        //window.location.href is used to navigate the browser to a new URL.
        //Here, the user is redirected to '../Login/login.html', which is presumably the login page.
        else
            throw new Error('Failed to login')
    }
    catch (err) {
        document.body.innerHTML += `<div>${err}</div>`
    }
}