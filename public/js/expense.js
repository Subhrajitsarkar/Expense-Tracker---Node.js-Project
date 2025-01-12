let currentPage = 1;
const itemsPerPage = 10;

// Function to save an expense
async function saveExpense(event) {
    try {
        event.preventDefault();
        const price = document.getElementById("price").value;
        const description = document.getElementById("description").value;
        const category = document.getElementById("category").value;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const obj = { price, description, category };
        const response = await axios.post("http://localhost:3000/expense/add-expense", obj, { headers: { Authorization: token } });

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

// Function to display premium user options
function showPremiumUserFeatures() {
    document.getElementById("rzp-button1").style.visibility = "hidden";
    document.getElementById("message").innerHTML = "You are a premium user now";

    // Display filters for daily, weekly, monthly
    document.getElementById("premium-filters").style.display = "flex";
    document.getElementById("download-button").style.display = "block";
}

// Function to parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (err) {
        console.error("Error parsing token:", err.message);
        return null;
    }
}

// Function to display expenses
async function displayExpense(filter = "all", page = 1) {
    try {
        const token = localStorage.getItem("token");
        let decodedToken = parseJwt(token);
        let isPremiumUser = decodedToken.ispremiumuser;

        if (isPremiumUser) {
            showPremiumUserFeatures();
        }

        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.get(
            `http://localhost:3000/expense/get-expenses?filter=${filter}&page=${page}&limit=${itemsPerPage}`,
            { headers: { Authorization: token } }
        );

        const { expenses, totalItems } = response.data;

        // Display expenses
        const show = document.getElementById("ulId");
        show.innerHTML = "";
        expenses.forEach((expense) => {
            show.innerHTML += `
                <li>${expense.price} - ${expense.description} - ${expense.category}
                <button onclick="deleteExpense('${expense.id}')">Delete</button>
                </li>`;
        });

        // Render pagination
        renderPagination(totalItems, page);
    } catch (err) {
        console.error("Error fetching expenses:", err.message);
    }
}

// Function to render pagination buttons
function renderPagination(totalItems, currentPage) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) {
        const newPagination = document.createElement("div");
        newPagination.id = "pagination";
        document.body.appendChild(newPagination);
    }

    const pages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= pages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = i === currentPage ? "active" : "";
        button.onclick = () => {
            currentPage = i;
            displayExpense("all", currentPage);
        };
        pagination.appendChild(button);
    }
}

// Function to delete an expense
async function deleteExpense(id) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.delete(`http://localhost:3000/expense/get-expense/${id}`, {
            headers: { Authorization: token },
        });

        if (response.status === 200) {
            displayExpense();
        } else {
            throw new Error(response.data.message || "Failed to delete expense");
        }
    } catch (err) {
        console.error("Error deleting expense:", err.message);
    }
}

// Razorpay integration for premium membership
document.getElementById("rzp-button1").onclick = async function (e) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.get("http://localhost:3000/razorpay/premiummembership", {
            headers: { Authorization: token },
        });

        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async function (paymentResponse) {
                console.log("Payment successful:", paymentResponse);

                await axios.post(
                    "http://localhost:3000/razorpay/updatetransactionstatus",
                    {
                        order_id: options.order_id,
                        payment_id: paymentResponse.razorpay_payment_id,
                    },
                    { headers: { Authorization: token } }
                );

                alert("You are now a premium user!");
                document.getElementById("rzp-button1").style.visibility = "hidden";
                document.getElementById("message").innerHTML = "You are a premium user now";
                localStorage.setItem("token", response.data.token);
                showPremiumUserFeatures();
            },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on("payment.failed", function (response) {
            console.log("Payment Failed:", response);
            alert("Payment failed. Please try again.");
        });
    } catch (err) {
        console.error("Error in Razorpay integration:", err.message);
        alert("Something went wrong. Please try again.");
    }
};

// Function to download expenses as a file
async function downloadExpenses() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const response = await axios.get("http://localhost:3000/expense/download", {
            headers: { Authorization: token },
        });

        const link = document.createElement("a");
        link.href = response.data.fileURL;
        link.download = "expenses.csv";
        link.click();
    } catch (err) {
        console.error("Error downloading expenses:", err.message);
        alert("Failed to download expenses.");
    }
}

// Event listener for page load
window.onload = function () {
    displayExpense();

    // Add event listeners for filter buttons
    document.getElementById("daily-filter").onclick = () => displayExpense("daily", 1);
    document.getElementById("weekly-filter").onclick = () => displayExpense("weekly", 1);
    document.getElementById("monthly-filter").onclick = () => displayExpense("monthly", 1);

    // Add event listener for the download button
    document.getElementById("download-button").onclick = downloadExpenses;
};