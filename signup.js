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
        else
            throw new Error('Failed to login')
    }
    catch (err) {
        document.body.innerHTML += `<div>${err}</div>`
    }
}