async function login(event) {
    try {
        event.preventDefault();
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;

        let obj = { email, password };
        let response = await axios.post('http://localhost:3000/user/login', obj);

        if (response.status === 200) {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token)
            window.location.href = '/expense';
        } else {
            throw new Error(response.data.message);
        }
    } catch (err) {
        console.error('Error in login:', err.message);
        document.body.innerHTML += `<div>${err.message}</div>`;
    }
}