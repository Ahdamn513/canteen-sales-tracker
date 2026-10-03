// ===== STATE =====
// The current customer's order: an array of { name, price, qty } objects
const currentOrder = [];

// Totals for the whole day
const dailySummary = {
  customersServed: 0,
  totalSales: 0,
  // FIX 2: a Map from normalized item name -> { displayName, qty }
  // e.g., "fried rice" -> { displayName: "Fried Rice", qty: 4 }
  itemCounts: new Map()
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

// FIX 1: Rounds a peso amount to 2 decimal places and never returns -0.
// Number.EPSILON nudges values like 1.005 so they round the way people expect.
function roundMoney(amount) {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return rounded || 0; // -0 is falsy, so this turns -0 into 0
}

// FIX 2: Makes an item name comparable: trimmed, lowercase, one space between words.
// "  Fried   RICE " -> "fried rice"
function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

// Shows a message in the message area. type is "success" or "error".
function showMessage(text, type) {
  messageArea.innerHTML = ""; // clear any previous message
  const message = document.createElement("div");
  message.className = "message " + type;
  message.textContent = text;
  messageArea.appendChild(message);
}

// FIX 1: Subtotal of one order line (price x quantity), rounded to centavos
function getSubtotal(item) {
  return roundMoney(item.price * item.qty);
}

// FIX 1: Adds up every line's rounded subtotal, then rounds the sum
function calculateTotal() {
  let total = 0;
  for (const item of currentOrder) {
    total += getSubtotal(item);
  }
  return roundMoney(total);
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

// FIX 1: Checks the cash received against the order total.
// Both sides are rounded to centavos, so 0.3 is accepted for a 0.1 x 3 order.
// Returns an error message, or "" if the payment is enough.
function validatePayment(cash, total) {
  if (Number.isNaN(cash)) {
    return "Enter the cash received as a number.";
  }
  if (roundMoney(cash) < roundMoney(total)) {
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

// FIX 1: Redraws the whole order table (using getSubtotal so the rows match the total)
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
      row.appendChild(createCell(formatPeso(getSubtotal(item))));

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

// FIX 1: Computes change = cash received - order total, rounded so it never shows -₱0.00
function updateChange() {
  const cash = roundMoney(parseFloat(cashInput.value) || 0); // empty input counts as 0
  const change = roundMoney(cash - calculateTotal());
  changeAmountEl.textContent = formatPeso(change);
}

// ===== PAYMENT AND SUMMARY FUNCTIONS =====

// FIX 2: Adds one order line to the day's item counts, using a normalized key.
// The first spelling entered that day is kept as the display name.
function recordItemSale(item) {
  const key = normalizeName(item.name);
  if (!dailySummary.itemCounts.has(key)) {
    dailySummary.itemCounts.set(key, { displayName: item.name, qty: 0 });
  }
  dailySummary.itemCounts.get(key).qty += item.qty;
}

// FIX 1 and FIX 2: Validates the payment, records the sale, then resets
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
  dailySummary.totalSales = roundMoney(dailySummary.totalSales + total); // FIX 1: no drift

  // FIX 2: add each line's quantity under its normalized item name
  for (const item of currentOrder) {
    recordItemSale(item);
  }

  // Reset the current order and payment section
  currentOrder.length = 0;
  paymentForm.reset();
  renderOrder(); // also resets the total and change display

  updateSummary();
  showMessage("Order completed. Total recorded: " + formatPeso(total), "success");
}

// FIX 2: Finds the item with the highest total quantity sold today
// (case-insensitive, because the counts are stored by normalized name)
function getMostSoldItem() {
  let topName = "None yet";
  let topQty = 0;
  for (const entry of dailySummary.itemCounts.values()) {
    if (entry.qty > topQty) {
      topQty = entry.qty;
      topName = entry.displayName;
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

// FIX 2: Resets the daily summary after the user confirms
function clearDay() {
  const confirmed = confirm("Clear all sales for the day? This cannot be undone.");
  if (!confirmed) {
    return;
  }

  dailySummary.customersServed = 0;
  dailySummary.totalSales = 0;
  dailySummary.itemCounts = new Map(); // start with a fresh, empty Map
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