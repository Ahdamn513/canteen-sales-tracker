# AI-Assisted Development Documentation

**Project:** Canteen Sales Tracker
**Student:** [Sherwin Adam Montealto]
**Tool used:** Claude (practice run)

---

## Prompt #1: Generate the application interface
**Stage:** Create application interface (Commit #2)

**1. Prompt used:**
```text
CONTEXT
I'm a student building a practice project for an Application Development
course. The project is a "Canteen Sales Tracker", a web app for a school
canteen. The owner currently records sales on paper, which makes computing
totals, change, and the daily summary slow and error-prone.

Target users: canteen staff and the canteen owner.

Inputs the app will need:
- Item name (text)
- Unit price (number, in pesos)
- Quantity (whole number)
- Cash received from the customer (number)

Features the app will eventually have (do NOT implement logic yet):
- Add multiple items to one customer order
- Order table with subtotal per line, order total, and a remove option
- Cash received and change computation
- "Complete Order" button that adds the order to a Daily Sales Summary
- Daily Sales Summary: customers served, total sales, most frequently sold item
- "Clear Day" button that resets the summary

TASK
Create ONLY the user interface (HTML and CSS). Do not write any
JavaScript logic yet. The layout should include:
1. An item entry form (item name, unit price, quantity, "Add Item" button)
2. A current-order table with columns: Item, Price, Qty, Subtotal, Action
   (a Remove button column), plus a row or area showing the order total
3. A payment section: cash received input, change display, and a
   "Complete Order" button
4. A Daily Sales Summary panel: customers served, total sales, most sold
   item, and a "Clear Day" button
5. A dedicated message area for error and success feedback

CONSTRAINTS
- Use only HTML and CSS (no frameworks, no libraries, no JavaScript yet)
- Semantic HTML (header, main, section, form, label, table)
- Every input must have a proper <label>
- Give elements clear id and class names so JavaScript can be attached
  later without changing the HTML
- Keep HTML and CSS in separate files: index.html and css/style.css
- Link to js/app.js with an empty script tag at the bottom of the body
- Clean, simple design with consistent spacing, readable fonts, and a
  responsive layout that works on both desktop and mobile
- Add short comments in the code explaining each section

OUTPUT FORMAT
Give each file in its own code block, labeled with its file path.
After the code, list the element ids you used so I know what to target
in JavaScript later.
```

**2. AI-generated response (summary):**
The AI produced `index.html` and `css/style.css`. The HTML uses semantic elements (header, main, section, form, table) with labeled inputs and a message area. The CSS uses CSS variables, a mobile-first grid layout that becomes two columns on desktop, and styled buttons and message classes. It also listed all element ids and the classes to use later (`.message.error`, `.message.success`, `.btn-remove`, `.empty-row`).

**3. Evaluation:**
- What worked: The prompt was specific, so the output matched the required layout and file structure. Every element I needed had a clear id, and the ids list made the next step easier. The page displayed correctly in the browser.
- What was missing or could be better: [e.g., no JavaScript yet so buttons do nothing, the design is plain, anything you noticed]
- How I tested it: Opened `index.html` in the browser [with Live Server], checked the layout on a wide window and a narrow window, and confirmed the CSS file loaded.

**4. Modifications I made:**
- Changed the border color in `css/style.css` to pink.
- Edited the header subtitle text in `index.html`.
- [Add anything else you changed]

---

## Prompt #2: Generate the core functionality
**Stage:** Implement core functionality (Commit #3)

**1. Prompt used:**
```text
CONTEXT
I'm continuing my "Canteen Sales Tracker" practice project (HTML, CSS,
vanilla JavaScript, no frameworks). The interface is already built in
index.html and css/style.css. I need the JavaScript in js/app.js.

Element ids already in my HTML:
- Message area: message-area
- Item form: item-form, inputs: item-name, item-price, item-qty
- Order table body: order-table-body, order total: order-total
- Payment form: payment-form, input: cash-received,
  change display: change-amount
- Summary: customers-served, total-sales, most-sold-item
- Buttons: add-item-btn, complete-order-btn, clear-day-btn
- Classes available: .message.error, .message.success, .btn-remove,
  .empty-row (the "No items added yet." placeholder row)

TASK
Write the core functionality ONLY. Do NOT add input validation yet
(I will request it separately). Implement:
1. Add Item: on item-form submit, read name, price, and quantity and
   add the item to the current order, then clear the form.
2. Render the order table: each row shows item, price, qty, subtotal,
   and a Remove button (class btn-remove). Show the "No items added
   yet." empty row when the order is empty.
3. Remove Item: clicking Remove deletes that line and updates totals.
4. Compute and display the order total, formatted as pesos (₱0.00).
5. Compute and display the change when the user types in cash-received.
6. Complete Order: on payment-form submit, add the order to the daily
   summary, reset the current order, cash input, and change display,
   and show a success message.
7. Daily Summary: update customers served, total sales, and the most
   frequently sold item (by total quantity sold).
8. Clear Day: reset the summary after a confirm() prompt.

CONSTRAINTS
- Vanilla JavaScript in js/app.js only. Do not change the HTML or CSS.
- Use event.preventDefault() on both form submit handlers.
- Keep state in plain variables (an array for the current order, an
  object for the daily summary).
- Use small, single-purpose functions with clear names
  (e.g., addItem, renderOrder, calculateTotal, updateSummary).
- Add short comments explaining each function.
- Create table rows safely (use textContent / createElement, not
  innerHTML with user input).

OUTPUT FORMAT
Give the complete js/app.js in one code block. After the code,
briefly explain how the data flows from "Add Item" to the daily
summary.
```

**2. AI-generated response (summary):**
The AI produced a complete `js/app.js`. State is kept in a `currentOrder` array and a `dailySummary` object (customers served, total sales, and per-item quantity counts). Functions include `addItem`, `removeItem`, `renderOrder`, `calculateTotal`, `updateChange`, `completeOrder`, `getMostSoldItem`, `updateSummary`, `clearDay`, plus helpers `formatPeso` and `showMessage`. Table rows are built with `createElement` and `textContent`, and event listeners handle both form submits, the cash input, and the Clear Day button. It also listed known gaps because I asked for no validation.

**3. Evaluation:**
- What worked: [e.g., adding and removing items, totals, change, completing an order, and the summary all worked as requested]
- What was wrong or missing: There is no input validation yet. Empty fields produce `NaN`, zero/negative/decimal quantities are accepted, cash below the total still lets the order complete, an empty order can be completed, and "Fried Rice" vs "fried rice" count as different items. [Add any bugs you found yourself]
- How I tested it: Added several items, removed one, typed cash amounts, completed an order, and cleared the day. I also tried [empty fields / negative numbers / etc.] to find weaknesses.

**4. Modifications I made:**
- [e.g., changed the success message wording, renamed a function, changed a variable name]
- [Add anything else you changed]

---

## Prompt #3: Add input validation
**Stage:** Add input validation (Commit #4)

**1. Prompt used:**
```text
CONTEXT
I'm continuing my "Canteen Sales Tracker" practice project (HTML, CSS,
vanilla JavaScript, no frameworks). My js/app.js already has working core
functionality. I've tested it and found these problems:
- Empty fields add items with NaN values
- Zero and negative prices are accepted
- Zero, negative, and decimal quantities are accepted
- Orders can be completed when cash is less than the total
- An empty order can be completed and counts as a customer

Existing pieces you should reuse (do not rewrite them):
- showMessage(text, type) where type is "success" or "error"
- addItem() reads the form and pushes { name, price, qty } to currentOrder
- completeOrder() adds the order to dailySummary
- calculateTotal() returns the order total
- Inputs: item-name, item-price, item-qty, cash-received

TASK
Add input validation ONLY. Do not change any other behavior.
Rules:
1. Item name must not be empty (trim whitespace first).
2. Price must be a number greater than 0.
3. Quantity must be a whole number of at least 1 (reject decimals).
4. Cash received must be a number and must not be less than the order
   total.
5. Completing an empty order is not allowed.

Behavior:
- If validation fails, do NOT add the item or complete the order, and
  show a clear error message using showMessage(..., "error"). The message
  should say exactly what is wrong (e.g., "Quantity must be a whole
  number of at least 1.").
- Report the first error found, one message at a time.
- After a failed item validation, put the cursor back in the field that
  caused the error.
- When an item is added successfully, show a success message such as
  "Item added: Fried Rice".

CONSTRAINTS
- Vanilla JavaScript, edit js/app.js only. Do not change the HTML or CSS.
- Write separate validation functions with clear names, for example
  validateItem(name, price, qty) and validatePayment(cash, total), that
  return an error message string, or an empty string if valid.
- Keep the existing function and variable names.
- Add short comments explaining each new function.

OUTPUT FORMAT
Show only the new and changed functions, each in its own code block, with
a note saying where each one goes in the file. Then give a short table of
test inputs and the expected result for each rule.
```

**2. AI-generated response (summary):**
The AI produced new helper functions (`readNumber`, `isValidPrice`, `isValidQty`) and validation functions (`validateItem`, `getInvalidItemField`, `validateOrder`, `validatePayment`) that return an error message string, or an empty string when the input is valid. It replaced `addItem()` so it validates before adding, shows the first error, focuses the faulty field, and shows a success message. It also replaced `completeOrder()` so it rejects an empty order and missing or insufficient cash. The AI noted that the old `parseInt` on quantity silently accepted decimals like `1.5`, so the new code reads raw values with `Number()`. It also gave a test table with expected results for each rule.

**3. Evaluation:**
- What worked: The prompt listed the exact rules, the existing function names to reuse, and the output format, so the response fit into my code without renaming anything. Returning a string from each validator (empty string means valid) made the logic easy to follow. [Add what you observed, e.g., error messages appeared correctly and the cursor jumped to the right field.]
- What was wrong or missing: Validation covers the five rules only. Problems that remain: "Fried Rice" and "fried rice" are counted as different items in the summary, and decimal prices such as `0.1 × 3` may cause floating-point rounding issues. [Add any other issues you found.]
- How I tested it: I ran every row of the test table: empty name, price of `0` and `-5`, quantity of `0`, `-2`, and `1.5`, empty cash, cash lower than the total, cash equal to the total, and completing an empty order. I also tested a case with several errors at once to confirm only the first error shows. [Mention anything extra you tried.]

**4. Modifications I made:**
- [e.g., reworded the error message for price to "Please enter a price greater than 0."]
- [Add anything else you changed]
- I merged the changes into one complete `app.js` and confirmed there is only one `addItem` and one `completeOrder` function.

---

## Bugs Found and Fixed
| # | Bug description | How I found it | Fix | Commit |
|---|---|---|---|---|
| 1 | [fill in later] | | | |

## Lessons Learned
- Keeping prompts narrow (one stage at a time) made the AI output easier to review and test.
- [Add your own lessons]