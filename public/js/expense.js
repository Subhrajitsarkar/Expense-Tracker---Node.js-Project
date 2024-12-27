async function saveExpense(event) {
    event.preventDefault()
    let price = document.getElementById('price').value;
    let description = document.getElementById('description').value
    let category = document.getElementById('category').value
    let obj = { price, description, category }
    await axios.post('http://localhost:3000/expense/add-expense', obj)
    document.getElementById('formId').reset()
    displayExpense()
}

async function displayExpense() {
    let response = await axios.get('http://localhost:3000/expense/get-expenses')
    let expenseDetails = response.data;
    let show = document.getElementById('ulId')
    show.innerHTML = ''
    expenseDetails.forEach((expense) => {
        show.innerHTML += `<li>${expense.price} - ${expense.description} - ${expense.category}
        <button onclick="deleteExpense('${expense.id}')">Delete expense</button></li>`
    })
}

async function deleteExpense(id) {
    await axios.delete(`http://localhost:3000/expense/get-expense/${id}`)
    displayExpense()
}
window.onload = displayExpense