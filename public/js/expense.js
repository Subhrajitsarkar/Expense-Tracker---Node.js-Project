async function saveExpense(event) {
    try {
        event.preventDefault();
        const price = document.getElementById("price").value;
        const description = document.getElementById("description").value;
        const category = document.getElementById("category").value;

        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }
        const obj = { price, description, category };

        // If { headers: { Authorization: token } } is omitted:-
        // 1)The authenticate middleware cannot retrieve the token.
        // 2)The middleware will fail to verify the user's identity.
        // 3)The server responds with a 401 Unauthorized error.
        const response = await axios.post("http://localhost:3000/expense/add-expense", obj, { headers: { Authorization: token }, });

        if (response.status === 201) {
            document.getElementById("formId").reset();
            displayExpense();
        } else {
            throw new Error(response.data.message || "Failed to add expense");
        }
    } catch (err) {
        console.error("Error saving expense:", err.message);
    }
}

function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = 'hidden'
    document.getElementById('message').innerHTML = 'YOu are a premium user now'
}

//copy from stackoverflow
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (err) {
        console.error("Error parsing token:", err.message);
        return null;
    }
}

async function displayExpense() {
    try {
        const token = localStorage.getItem("token");
        let decodedToken = parseJwt(token)
        let ispremiumuser = decodedToken.ispremiumuser
        // let isadmin = localStorage.getItem('isadmin');
        if (ispremiumuser) {
            showPremiumuserMessage()
        }
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }
        const response = await axios.get("http://localhost:3000/expense/get-expenses", { headers: { Authorization: token }, });

        const expenseDetails = response.data;
        const show = document.getElementById("ulId");
        show.innerHTML = "";

        expenseDetails.forEach((expense) => {
            show.innerHTML += `
                <li>${expense.price} - ${expense.description} - ${expense.category}
                <button onclick="deleteExpense('${expense.id}')">Delete</button>
                </li>`;
        });
    } catch (err) {
        console.error("Error fetching expenses:", err.message);
    }
}

async function deleteExpense(id) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.delete(`http://localhost:3000/expense/get-expense/${id}`, { headers: { Authorization: token }, });

        if (response.status === 200) {
            displayExpense();
        } else {
            throw new Error(response.data.message || "Failed to delete expense");
        }
    } catch (err) {
        console.error("Error deleting expense:", err.message);
    }
}

document.getElementById('rzp-button1').onclick = async function (e) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }
        const response = await axios.get('http://localhost:3000/razorpay/premiummembership', { headers: { Authorization: token } });

        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async function (paymentResponse) {
                console.log('Payment successful:', paymentResponse); // Log payment success

                await axios.post('http://localhost:3000/razorpay/updatetransactionstatus',
                    {
                        order_id: options.order_id,
                        payment_id: paymentResponse.razorpay_payment_id,
                    },
                    { headers: { Authorization: token } }
                );
                alert('You are now a premium user!');
                document.getElementById('rzp-button1').style.visibility = 'hidden'
                document.getElementById('message').innerHTML = 'YOu are a premium user now'
                localStorage.setItem('token', response.data.token)
                showLeaderboard()
            },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open(); // Open Razorpay payment interface
        e.preventDefault();

        rzp1.on('payment.failed', function (response) {
            console.log('Payment Failed:', response); // Log payment failure
            alert('Something went wrong with the payment. Please try again!');
        });
    } catch (err) {
        console.error("Error in Razorpay integration:", err.message);
        alert('Something went wrong. Please try again.');
    }
};

function showLeaderboard() {
    const inputElement = document.createElement("input");
    inputElement.type = "button";
    inputElement.value = "Show Leaderboard";
    inputElement.onclick = async () => {
        const token = localStorage.getItem("token");
        const userLeaderBoardArray = await axios.get("http://localhost:3000/premium/showLeaderBoard", {
            headers: { Authorization: token }
        });
        console.log(userLeaderBoardArray);

        var leaderboardElem = document.getElementById("leaderboard");
        leaderboardElem.innerHTML += `<h1> Leader Board </h1>`;
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expenses - ${userDetails.totalExpenses}</li>`;
        });
    };

    document.getElementById("message").appendChild(inputElement);
}


window.onload = function () {
    displayExpense();
};