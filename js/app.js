// ===== STATE =====
// The current customer's order: an array of { name, price, qty } objects
const currentOrder = [];

// Totals for the whole day
const dailySummary = {
  customersServed: 0,
  totalSales: 0,
  itemCounts: {} // e.g., { "Fried Rice": 5, "Juice": 3 } (total quantity sold per item)
};

// ===== DOM REFERENCES =====
const messageArea = document.getElementById("message-area");
const itemForm = document.getElementById("item-form");
const itemNameInput = document.getElementById("item-name");
const itemPriceInput = document.getElementById("item-price");
const itemQtyInput = document.getElementById("item-qty");
const orderTableBody = document.getElementById("order-table-body");
const orderTotalEl = document.getElementById("order-total");
const paymentForm = document.getElementById("payment-form");
const cashInput = document.getElementById("cash-received");
const changeAmountEl = document.getElementById("change-amount");
const customersServedEl = document.getElementById("customers-served");
const totalSalesEl = document.getElementById("total-sales");
const mostSoldItemEl = document.getElementById("most-sold-item");
const clearDayBtn = document.getElementById("clear-day-btn");

// ===== HELPER FUNCTIONS =====

// Formats a number as pesos, e.g., 1250.5 -> "₱1,250.50"
function formatPeso(amount) {
  return amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP"
  });
}

// Shows a message in the message area. type is "success" or "error".
function showMessage(text, type) {
  messageArea.innerHTML = ""; // clear any previous message
  const message = document.createElement("div");
  message.className = "message " + type;
  message.textContent = text;
  messageArea.appendChild(message);
}

// Adds up every line's subtotal (price x quantity) in the current order
function calculateTotal() {
  let total = 0;
  for (const item of currentOrder) {
    total += item.price * item.qty;
  }
  return total;
}

// ===== ORDER FUNCTIONS =====

// Reads the item form and adds the item to the current order
function addItem() {
  const item = {
    name: itemNameInput.value.trim(),
    price: parseFloat(itemPriceInput.value),
    qty: parseInt(itemQtyInput.value, 10)
  };

  currentOrder.push(item);
  renderOrder();
  itemForm.reset();
  itemNameInput.focus();
}

// Removes one line from the order using its position in the array
function removeItem(index) {
  currentOrder.splice(index, 1);
  renderOrder();
}

// Creates one table cell with plain text (safe: uses textContent)
function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

// Redraws the whole order table, then updates total and change
function renderOrder() {
  orderTableBody.innerHTML = ""; // clear old rows

  if (currentOrder.length === 0) {
    // Show the placeholder row
    const emptyRow = document.createElement("tr");
    emptyRow.className = "empty-row";
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 5;
    emptyCell.textContent = "No items added yet.";
    emptyRow.appendChild(emptyCell);
    orderTableBody.appendChild(emptyRow);
  } else {
    currentOrder.forEach(function (item, index) {
      const row = document.createElement("tr");
      row.appendChild(createCell(item.name));
      row.appendChild(createCell(formatPeso(item.price)));
      row.appendChild(createCell(item.qty));
      row.appendChild(createCell(formatPeso(item.price * item.qty)));

      // Action cell with a Remove button
      const actionCell = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn btn-remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", function () {
        removeItem(index);
      });
      actionCell.appendChild(removeBtn);
      row.appendChild(actionCell);

      orderTableBody.appendChild(row);
    });
  }

  orderTotalEl.textContent = formatPeso(calculateTotal());
  updateChange();
}

// Computes change = cash received - order total, and displays it
function updateChange() {
  const cash = parseFloat(cashInput.value) || 0; // empty input counts as 0
  const change = cash - calculateTotal();
  changeAmountEl.textContent = formatPeso(change);
}

// ===== PAYMENT AND SUMMARY FUNCTIONS =====

// Adds the finished order to the daily summary, then resets for the next customer
function completeOrder() {
  const total = calculateTotal();

  dailySummary.customersServed += 1;
  dailySummary.totalSales += total;

  // Add each line's quantity to that item's running total
  for (const item of currentOrder) {
    if (dailySummary.itemCounts[item.name]) {
      dailySummary.itemCounts[item.name] += item.qty;
    } else {
      dailySummary.itemCounts[item.name] = item.qty;
    }
  }

  // Reset the current order and payment section
  currentOrder.length = 0;
  paymentForm.reset();
  renderOrder(); // also resets the total and change display

  updateSummary();
  showMessage("Order completed. Total recorded: " + formatPeso(total), "success");
}

// Finds the item with the highest total quantity sold today
function getMostSoldItem() {
  let topName = "None yet";
  let topQty = 0;
  for (const name in dailySummary.itemCounts) {
    if (dailySummary.itemCounts[name] > topQty) {
      topQty = dailySummary.itemCounts[name];
      topName = name;
    }
  }
  return topName;
}

// Refreshes the three values in the Daily Sales Summary panel
function updateSummary() {
  customersServedEl.textContent = dailySummary.customersServed;
  totalSalesEl.textContent = formatPeso(dailySummary.totalSales);
  mostSoldItemEl.textContent = getMostSoldItem();
}

// Resets the daily summary after the user confirms
function clearDay() {
  const confirmed = confirm("Clear all sales for the day? This cannot be undone.");
  if (!confirmed) {
    return;
  }

  dailySummary.customersServed = 0;
  dailySummary.totalSales = 0;
  dailySummary.itemCounts = {};
  updateSummary();
  showMessage("Daily summary cleared.", "success");
}

// ===== EVENT LISTENERS =====

itemForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  addItem();
});

paymentForm.addEventListener("submit", function (event) {
  event.preventDefault();
  completeOrder();
});

cashInput.addEventListener("input", updateChange);

clearDayBtn.addEventListener("click", clearDay);

// ===== INITIAL DRAW =====
renderOrder();
updateSummary();