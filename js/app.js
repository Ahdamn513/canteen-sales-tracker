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

// Reads a number from an input. Returns NaN if the box is empty or not a number.
function readNumber(input) {
  const text = input.value.trim();
  return text === "" ? NaN : Number(text);
}

// A price is valid if it is a real number greater than 0
function isValidPrice(price) {
  return Number.isFinite(price) && price > 0;
}

// A quantity is valid if it is a whole number of at least 1
function isValidQty(qty) {
  return Number.isInteger(qty) && qty >= 1;
}

// ===== VALIDATION FUNCTIONS =====

// Checks the item form values in order (name, price, quantity).
// Returns the first error message, or "" if everything is valid.
function validateItem(name, price, qty) {
  if (name === "") {
    return "Item name must not be empty.";
  }
  if (!isValidPrice(price)) {
    return "Price must be a number greater than 0.";
  }
  if (!isValidQty(qty)) {
    return "Quantity must be a whole number of at least 1.";
  }
  return "";
}

// Returns the input that caused the first item error, so we can focus it.
// Uses the same checks and the same order as validateItem().
function getInvalidItemField(name, price, qty) {
  if (name === "") {
    return itemNameInput;
  }
  if (!isValidPrice(price)) {
    return itemPriceInput;
  }
  return itemQtyInput;
}

// Blocks completing an order that has no items.
// Returns an error message, or "" if the order has items.
function validateOrder() {
  if (currentOrder.length === 0) {
    return "Cannot complete an empty order. Add at least one item first.";
  }
  return "";
}

// Checks the cash received against the order total.
// Returns an error message, or "" if the payment is enough.
function validatePayment(cash, total) {
  if (Number.isNaN(cash)) {
    return "Enter the cash received as a number.";
  }
  if (cash < total) {
    return "Cash received is less than the order total of " + formatPeso(total) + ".";
  }
  return "";
}

// ===== ORDER FUNCTIONS =====

// Reads the item form, validates it, and adds the item to the current order
function addItem() {
  const name = itemNameInput.value.trim();
  const price = readNumber(itemPriceInput);
  const qty = readNumber(itemQtyInput);

  // Stop and show the first error if anything is invalid
  const error = validateItem(name, price, qty);
  if (error) {
    showMessage(error, "error");
    getInvalidItemField(name, price, qty).focus();
    return;
  }

  currentOrder.push({ name: name, price: price, qty: qty });
  renderOrder();
  itemForm.reset();
  itemNameInput.focus();
  showMessage("Item added: " + name, "success");
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

// Validates the payment, adds the order to the daily summary, then resets
function completeOrder() {
  // Reject an empty order
  const orderError = validateOrder();
  if (orderError) {
    showMessage(orderError, "error");
    itemNameInput.focus();
    return;
  }

  // Reject missing or insufficient cash
  const total = calculateTotal();
  const cash = readNumber(cashInput);
  const paymentError = validatePayment(cash, total);
  if (paymentError) {
    showMessage(paymentError, "error");
    cashInput.focus();
    return;
  }

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