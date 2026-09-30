
//******************************************************************** */
// Forma e Logimit   index.html

function adminLogin() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

   // Kontrollon Usernamin dhe passwordin nese pershtaten
  if (username === "admin" && password === "admin123") {
    window.location.href = "admin-dashboard.html";
    return;
  }

  // Kontrollon per perdorues te regjistruar
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    sessionStorage.setItem("loggedInUser", username);
    window.location.href = "user-dashboard.html";
  } else {
    alert("Invalid username or password!");
  }
}

//*************************************************** */
// Admin-dashboard.html

function logOff() {
  window.location.href = "index.html"; // Redirect to login page
}

function goToRegisterUser() {
  window.location.href = "register-user.html";
}



//*************************************************** */
// Menaxhimi i Listes se Librave
let books = JSON.parse(localStorage.getItem("books")) || [];

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;

  if (!title || !author || !year || !quantity || !price) {
    alert("Ju lutem plotëso të gjitha fushat.");
    return;
  }

  books.push({ title, author, year, quantity, price });
  localStorage.setItem("books", JSON.stringify(books));

  displayBooks();
  clearForm();
}


function displayBooks() {
  const list = document.getElementById("bookList");
  list.innerHTML = "";
  books.forEach((book, index) => {
    list.innerHTML += `
      <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.year}</td>
        <td>${book.quantity}</td>
        <td>${book.price}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editBook(${index})">Ndrysho</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBook(${index})">Fshij</button>
        </td>
      </tr>
    `;
  });
}

function deleteBook(index) {
  if (confirm("A je i sigurt që dëshiron ta fshish këtë libër?")) {
    books.splice(index, 1);
    localStorage.setItem("books", JSON.stringify(books));

    displayBooks();
  }
}

function editBook(index) {
  const book = books[index];
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("year").value = book.year;
  document.getElementById("quantity").value = book.quantity;
  document.getElementById("price").value = book.price;

  // Fshije librin fillimisht, pastaj shtoje perseri gjate perditesimit.
  books.splice(index, 1);
  localStorage.setItem("books", JSON.stringify(books));

  displayBooks();
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("year").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("price").value = "";
}

// Ngarko librat gjate ngarkimit të faqes.
if (window.location.pathname.includes("admin-dashboard.html")) {
  window.onload = displayBooks;
}


//******************************************************************** */
// register-user.html

function registerUser() {
  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;

  if (!username || !password) {
    alert("Ju lutem shkruani emrin e përdoruesit ashtu edhe fjalëkalimin.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // CKontrillimi nese Username ekziston
  const exists = users.find(user => user.username === username);
  if (exists) {
    alert("Emri i përdoruesit ekziston tashmë!");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Përdoruesi u regjistrua me sukses!");
  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";

}

function backToDashboard() {
  window.location.href = "admin-dashboard.html";
}




//*************************************************************8 */
// user-dashboard.html

function displayBooksForSeller() {
  let books = JSON.parse(localStorage.getItem("books")) || [];
  const list = document.getElementById("bookList");
  list.innerHTML = "";

  books.forEach((book, index) => {
    const isOut = book.quantity <= 0;

    list.innerHTML += `
      <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.year}</td>
        <td>${book.quantity <= 0 ? '<span class="text-danger fw-bold">Out of stock</span>' : book.quantity}</td>
        <td>€${book.price}</td>
        <td>
          <button class="btn btn-sm btn-primary" ${isOut ? 'disabled' : ''} onclick="sellBook(${index})">Sell</button>
        </td>
      </tr>
    `;
  });
}

function updateSalesInfo() {
  let sales = JSON.parse(localStorage.getItem("sales")) || {
    totalRevenue: 0,
    soldBooks: {}
  };

  const salesDiv = document.getElementById("salesInfo");
  salesDiv.innerHTML = `<strong>Të Ardhurat Totale: </strong> €${sales.totalRevenue.toFixed(2)}`;
}

function sellBook(index) {
  let books = JSON.parse(localStorage.getItem("books")) || [];
  let sales = JSON.parse(localStorage.getItem("sales")) || {
    totalRevenue: 0,
    soldBooks: {}  // key = book title, value = quantity sold
  };

  if (books[index].quantity > 0) {
    books[index].quantity--;

    // Shto te ardhura
    sales.totalRevenue += parseFloat(books[index].price);

    // Ndjek sa here eshte shitur ky liber
    let title = books[index].title;
    sales.soldBooks[title] = (sales.soldBooks[title] || 0) + 1;

    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("sales", JSON.stringify(sales));
    displayBooksForSeller();
    updateSalesInfo();
  }
}

if (window.location.pathname.includes("user-dashboard.html")) {
  window.onload = () => {
    displayBooksForSeller();
    updateSalesInfo();
  };
}

function saveSales() {
  let sales = JSON.parse(localStorage.getItem("sales")) || { totalRevenue: 0, soldBooks: {} };
  let books = JSON.parse(localStorage.getItem("books")) || [];
  let history = JSON.parse(localStorage.getItem("salesHistory")) || [];

  const now = new Date();
  const dateTime = now.toLocaleString();

  for (let title in sales.soldBooks) {
    let qty = sales.soldBooks[title];
    let book = books.find(b => b.title === title);
    if (book) {
      history.push({
        dateTime,
        title: book.title,
        author: book.author,
        year: book.year,
        quantity: qty,
        price: book.price,
        total: qty * parseFloat(book.price)
      });
    }
  }

  localStorage.setItem("salesHistory", JSON.stringify(history));

  // Pastro shitjet aktuale
  localStorage.setItem("sales", JSON.stringify({ totalRevenue: 0, soldBooks: {} }));
  alert("Shitjet u ruajtën me sukses!");
  updateSalesInfo();
}

function goToSalesHistory() {
  window.location.href = "sales-history.html";
}



function logOff() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}


//***************************************************************************** */
// sales-history.html

function displaySalesHistory() {
  let history = JSON.parse(localStorage.getItem("salesHistory")) || [];
  const table = document.getElementById("salesHistoryTable");
  table.innerHTML = "";

  let totalQty = 0;
  let totalRevenue = 0;

  history.forEach(entry => {
    table.innerHTML += `
      <tr>
        <td>${entry.dateTime}</td>
        <td>${entry.title}</td>
        <td>${entry.author}</td>
        <td>${entry.year}</td>
        <td>${entry.quantity}</td>
        <td>€${parseFloat(entry.price).toFixed(2)}</td>
        <td>€${parseFloat(entry.total).toFixed(2)}</td>
      </tr>
    `;
    totalQty += parseInt(entry.quantity);
    totalRevenue += parseFloat(entry.total);
  });

    document.getElementById("summaryInfo").innerText = `📦 Totali i Shitur: ${totalQty} libra | 💰 Të Ardhurat Totale: €${totalRevenue.toFixed(2)}`;
}

function backToSellerDashboard() {
  window.location.href = "user-dashboard.html";
}

if (window.location.pathname.includes("sales-history.html")) {
  window.onload = displaySalesHistory;
}

function clearSalesHistory() {
  if (confirm("Are you sure you want to clear all sales history?")) {
    localStorage.removeItem("salesHistory");
    displaySalesHistory();
  }
}



function filterSalesByDate() {
  let date = document.getElementById("filterDate").value; 
  let history = JSON.parse(localStorage.getItem("salesHistory")) || [];
  const table = document.getElementById("salesHistoryTable");
  table.innerHTML = "";

  if (!date) {
    displaySalesHistory();
    return;
  }

  const filteredHistory = history.filter(entry => {
    let entryDateObj = new Date(entry.dateTime); 
    if (isNaN(entryDateObj)) return false; 
    let entryDateFormatted = entryDateObj.toISOString().split("T")[0]; // nxjerr daten ne YYYY-MM-DD
    return entryDateFormatted === date;
  });

  if (filteredHistory.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="text-center">Nuk u gjetën shitje për këtë datë.</td></tr>`;
    document.getElementById("summaryInfo").innerText = `📦 Totali i Shitur: 0 libra | 💰 Të Ardhurat Totale: €0.00`;
    return;
  }

  let totalQty = 0;
  let totalRevenue = 0;

  filteredHistory.forEach(entry => {
    table.innerHTML += `
      <tr>
        <td>${entry.dateTime}</td>
        <td>${entry.title}</td>
        <td>${entry.author}</td>
        <td>${entry.year}</td>
        <td>${entry.quantity}</td>
        <td>€${parseFloat(entry.price).toFixed(2)}</td>
        <td>€${parseFloat(entry.total).toFixed(2)}</td>
      </tr>
    `;
    totalQty += parseInt(entry.quantity);
    totalRevenue += parseFloat(entry.total);
  });

  document.getElementById("summaryInfo").innerText = `📦 Totali i Shitur: ${totalQty} libra | 💰 Të Ardhurat Totale: €${totalRevenue.toFixed(2)}`;
}


function exportSalesToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const sales = JSON.parse(localStorage.getItem("salesHistory") || "[]");

  if (sales.length === 0) {
    alert("Nuk ka shitje për t’u eksportuar!");
    return;
  }

  doc.setFontSize(14);
  doc.text("📦 Historia e Shitjeve", 14, 20);

  const headers = [["Data/Ora", "Titulli", "Autori", "Viti", "Sasia", "Çmimi (€)", "Totali (€)"]];

  const rows = sales.map(sale => [
    sale.dateTime,
    sale.title,
    sale.author,
    sale.year.toString(),
    sale.quantity.toString(),
    `€${parseFloat(sale.price).toFixed(2)}`,
    `€${parseFloat(sale.total).toFixed(2)}`
  ]);

  doc.autoTable({
    startY: 30,
    head: headers,
    body: rows,
    theme: 'striped',
    styles: { fontSize: 10 },
  });

  doc.save("sales-history.pdf");
}



function exportToCSV() {
  let history = JSON.parse(localStorage.getItem("salesHistory")) || [];
  if (history.length === 0) return alert("Nuk ka shitje për t’u eksportuar!");

  let csv = "\uFEFF";
  csv += "Data/Ora,Titulli,Autori,Viti,Sasia,Cmimi,Totali\n";
  history.forEach(entry => {
    csv += `"${entry.dateTime}","${entry.title}","${entry.author}",${entry.year},${entry.quantity},"€${entry.price}","€${entry.total}"\n`;
  });

  let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sales_history.csv");
  link.click();
}


//****************************************************************************** */




