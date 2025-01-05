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

async function displayExpense() {
    try {
        const token = localStorage.getItem("token");
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
        console.log('Buy Premium button clicked');

        const token = localStorage.getItem('token');
        console.log('Token:', token);

        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.get('http://localhost:3000/premiummembership', {
            headers: { "Authorization": token }
        });

        console.log('Response:', response); // Log the response

        const options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function (paymentResponse) {
                console.log('Payment successful:', paymentResponse); // Log payment success

                await axios.post('http://localhost:3000/updatetransactionstatus',
                    {
                        order_id: options.order_id,
                        payment_id: paymentResponse.razorpay_payment_id,
                    },
                    { headers: { "Authorization": token } }
                );
                alert('You are now a premium user!');
            },
        };

        console.log('Options:', options); // Log the options

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

window.onload = function () {
    displayExpense();
};