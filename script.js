let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const formEl = document.getElementById('transaction-form');
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');
const listEl = document.getElementById('transaction-list');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function generateId() {
  return Math.floor(Math.random() * 100000000);
}

function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

function updateSummary() {
  const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  balanceEl.innerText = formatRupees(total);
  incomeEl.innerText = formatRupees(income);
  expenseEl.innerText = formatRupees(expense);
}

function renderTransactions() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;

  listEl.innerHTML = '';

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (filteredTransactions.length === 0) {
    listEl.innerHTML = '<li class="empty-message">No transactions found.</li>';
    return;
  }

  filteredTransactions.forEach(transaction => {
    const li = document.createElement('li');
    li.classList.add('transaction-item', transaction.type);

    const sign = transaction.type === 'income' ? '+' : '-';

    li.innerHTML = `
      <div class="item-details">
        <span class="item-description">${transaction.description}</span>
        <span class="item-meta">${transaction.category} &bull; ${formatDate(transaction.createdAt)}</span>
      </div>
      <div class="item-right">
        <span class="item-amount">${sign}${formatRupees(transaction.amount)}</span>
        <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
      </div>
    `;

    listEl.appendChild(li);
  });
}

function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const type = typeEl.value;
  const category = categoryEl.value;

  if (!description || isNaN(amount) || amount <= 0 || !category) {
    return;
  }

  const transaction = {
    id: generateId(),
    description: description,
    amount: amount,
    type: type,
    category: category,
    createdAt: new Date().toISOString()
  };

  transactions.unshift(transaction);
  saveTransactions();
  updateSummary();
  renderTransactions();

  formEl.reset();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  updateSummary();
  renderTransactions();
}

formEl.addEventListener('submit', addTransaction);
searchInput.addEventListener('input', renderTransactions);
filterCategory.addEventListener('change', renderTransactions);

function init() {
  updateSummary();
  renderTransactions();
}

init();
