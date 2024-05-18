document.addEventListener("DOMContentLoaded", function () {
  const formInputBook = document.getElementById("form-input-book");
  const bookSearch = document.getElementById("searchBook");
  const editBookForm = document.getElementById("edit-book-form");

  formInputBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  bookSearch.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  editBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveEditBook();
  });

  document.querySelector(".btn-cancel").addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector("#edit-modal").style.display = "none";
    document.body.classList.toggle("overflow");
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener("ondataloaded", () => {
  refreshDataFromBooks();
});

const STORAGE_KEY = "BOOKSHELF_APPS";

let books = [];

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung");
    return false;
  }
  return true;
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) books = data;

  document.dispatchEvent(new Event("ondataloaded"));
}

function dataToStorageUpdate() {
  if (isStorageExist()) saveData();
}

function composeBookObject(title, author, year, isComplete) {
  return {
    id: +new Date(),
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

function findBook(bookId) {
  for (book of books) {
    if (book.id === bookId) return book;
  }
  return null;
}

function findBookIndex(bookId) {
  let index = 0;
  for (book of books) {
    if (book.id === bookId) return index;
    index++;
  }
  return -1;
}

const completeBook = "completeBookshelfList";
const incompleteBook = "incompleteBookshelfList";
const ItemID = "itemID";
const incompleteCountID = "incompleteCount";
const completeBookCountID = "completeBookCount";
let unread_Count = 0;
let read_Count = 0;

function addBook() {
  const new_Title = document.getElementById("inputBookTitle").value;
  const new_Author = document.getElementById("inputBookAuthor").value;
  const new_Year = document.getElementById("inputBookYear").value;
  const new_Status = document.getElementById("inputBookIsComplete").checked;

  if (new_Title == "" || new_Author == "" || new_Year == "") {
    alert("Kolom harus diisi!!!");
    return;
  }

  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;

  const book = makeBook(new_Title, new_Author, new_Year, new_Status);
  const bookObject = composeBookObject(new_Title, new_Author, new_Year, new_Status);

  book[ItemID] = bookObject.id;
  books.push(bookObject);

  let listID;
  if (new_Status) {
    listID = completeBook;
    read_Count++;
  } else {
    listID = incompleteBook;
    unread_Count++;
  }

  const listBook = document.getElementById(listID);

  listBook.append(book);
  Count_update();
  dataToStorageUpdate();
  showBookShelf();
}

function makeBook(new_Title, new_Author, new_Year, new_Status) {
  const Title = document.createElement("h3");
  Title.innerText = new_Title;
  Title.classList.add("Title");

  const author = document.createElement("p");
  author.innerHTML = "penulis: <span class='author'>" + new_Author + "</span>";

  const year = document.createElement("p");
  year.innerHTML = "tahun: <span class='year'>" + new_Year + "</span>";

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("btn-wrapper");

  if (!new_Status) btnContainer.append(createCheckButton(), createEditButton(), createTrashButton());
  else btnContainer.append(createUndoButton(), createEditButton(), createTrashButton());

  const container = document.createElement("div");
  container.classList.add("item");

  container.append(Title, author, year, btnContainer);
  return container;
}

function createButton(iconButton, textButton, eventListener) {
  const button = document.createElement("button");
  button.classList.add("btn-action");

  const icon = document.createElement("i");
  icon.classList.add("fas", iconButton);

  button.innerHTML = icon.outerHTML + " " + textButton;

  button.addEventListener("click", function (event) {
    eventListener(event);
  });

  return button;
}

function createCheckButton() {
  return createButton("fa-check-circle", "Selesai Baca", function (event) {
    addBookToCompleted(event.target.parentElement.parentElement);
  });
}

function createEditButton() {
  return createButton("fa-edit", "Edit buku", function (event) {
    showEditModal(event.target.parentElement.parentElement);
  });
}

function createTrashButton() {
  return createButton("fa-trash", "Hapus buku", function (event) {
    removeBookFromCompleted(event.target.parentElement.parentElement);
  });
}

function createUndoButton() {
  return createButton("fa-sync-alt", "Baca ulang", function (event) {
    undoBookFromCompleted(event.target.parentElement.parentElement);
  });
}

function addBookToCompleted(bookItem) {
  const Title = bookItem.querySelector(".Title").innerText;
  const author = bookItem.querySelector(".author").innerText;
  const year = bookItem.querySelector(".year").innerText;

  const newBook = makeBook(Title, author, year, true);

  const book = findBook(bookItem[ItemID]);
  book.isComplete = true;
  newBook[ItemID] = book.id;

  const listSudahBaca = document.getElementById(completeBook);
  listSudahBaca.append(newBook);
  bookItem.remove();

  read_Count++;
  unread_Count--;
  Count_update();
  dataToStorageUpdate();
  showBookShelf();
}

function showBookShelf() {
  const statusBookshelUnread = document.querySelector(".status-BookShelf-Unread");
  const statusBookshelfRead = document.querySelector(".status-Bookshel-Read");

  if (unread_Count == 0 && statusBookshelUnread == null) {
    const newStatusUnread = document.createElement("h4");
    newStatusUnread.classList.add("status-BookShelf-Unread", "text-center");

    document.getElementById(incompleteBook).append(newStatusUnread);
  }

  if (unread_Count > 0 && statusBookshelUnread != null) {
    statusBookshelUnread.remove();
  }

  if (read_Count == 0 && statusBookshelfRead == null) {
    const newStatusRead = document.createElement("h4");
    newStatusRead.classList.add("status-Bookshel-Read", "text-center");

    document.getElementById(completeBook).append(newStatusRead);
  }

  if (read_Count > 0 && statusBookshelfRead != null) {
    statusBookshelfRead.remove();
  }
}

function showEditModal(bookItem) {
  const book = findBook(bookItem[ItemID]);
  const modalEdit = document.getElementById("edit-modal");
  document.body.classList.toggle("overflow");

  document.getElementById("edit-id").value = bookItem[ItemID];
  document.getElementById("edit-title").value = book.title;
  document.getElementById("edit-author").value = book.author;
  document.getElementById("edit-year").value = book.year;

  modalEdit.style.display = "block";
}

function saveEditBook() {
  const modalEdit = document.getElementById("edit-modal");

  const idBook = document.getElementById("edit-id").value;
  const Title = document.getElementById("edit-title").value;
  const author = document.getElementById("edit-author").value;
  const year = document.getElementById("edit-year").value;

  const bookPosition = findBookIndex(parseInt(idBook));

  books[bookPosition].title = Title;
  books[bookPosition].author = author;
  books[bookPosition].year = year;

  refreshDataFromBooks();
  modalEdit.style.display = "none";
  document.body.classList.toggle("overflow");

  dataToStorageUpdate();
}

function removeBookFromCompleted(bookItem) {
  let statusHapus = confirm("Apakah kamu yakin ingin menghapusnya???");

  if (!statusHapus) return;

  const bookPosition = findBookIndex(bookItem[ItemID]);
  const bookStatus = books[bookPosition].isComplete;

  if (bookStatus) {
    read_Count--;
  } else {
    unread_Count--;
  }

  books.splice(bookPosition, 1);
  bookItem.remove();

  Count_update();
  dataToStorageUpdate();
  showBookShelf();
}

function undoBookFromCompleted(bookItem) {
  const Title = bookItem.querySelector(".Title").innerText;
  const author = bookItem.querySelector(".author").innerText;
  const year = bookItem.querySelector(".year").innerText;

  const newBook = makeBook(Title, author, year, false);

  const book = findBook(bookItem[ItemID]);
  book.isComplete = false;
  newBook[ItemID] = book.id;

  const listBelumBaca = document.getElementById(incompleteBook);
  listBelumBaca.append(newBook);
  bookItem.remove();
  read_Count--;
  unread_Count++;
  Count_update();
  dataToStorageUpdate();
  showBookShelf();
}

function Count_update() {
  document.getElementById(incompleteCountID).innerText = unread_Count;
  document.getElementById(completeBookCountID).innerText = read_Count;
}

function refreshDataFromBooks() {
  const listBelumBaca = document.getElementById(incompleteBook);
  const listSudahBaca = document.getElementById(completeBook);

  listBelumBaca.innerHTML = "";
  listSudahBaca.innerHTML = "";

  read_Count = 0;
  unread_Count = 0;

  for (book of books) {
    const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
    newBook[ItemID] = book.id;

    if (book.isComplete) {
      read_Count++;
      listSudahBaca.append(newBook);
    } else {
      unread_Count++;
      listBelumBaca.append(newBook);
    }
  }
  Count_update();
  showBookShelf();
}

function searchBook() {
  const keyword = document.getElementById("searchBookTitle").value.toLowerCase();
  const listBelumBaca = document.getElementById(incompleteBook);
  let listSudahBaca = document.getElementById(completeBook);

  listBelumBaca.innerHTML = "";
  listSudahBaca.innerHTML = "";

  if (keyword == "") {
    refreshDataFromBooks();
    return;
  }

  read_Count = 0;
  unread_Count = 0;

  for (book of books) {
    [];
    if (book.title.toLowerCase().includes(keyword)) {
      const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
      newBook[ItemID] = book.id;

      if (book.isComplete) {
        read_Count++;
        listSudahBaca.append(newBook);
      } else {
        unread_Count++;
        listBelumBaca.append(newBook);
      }
    }
  }
  Count_update();
  showBookShelf();
}
