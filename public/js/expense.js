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

window.onload = displayExpense;


document.getElementById('rzp-button1').onclick = async function (e) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });

        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async function (paymentResponse) {
                await axios.post('http://localhost:3000/purchase/updatetransactionstatus',
                    {
                        order_id: options.order_id,
                        payment_id: paymentResponse.razorpay_payment_id,
                    },
                    { headers: { "Authorization": token } }
                );
                alert('You are now a premium user!');
            },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open(); // Open Razorpay payment interface
    } catch (err) {
        console.error("Error in Razorpay integration:", err.message);
    }
};