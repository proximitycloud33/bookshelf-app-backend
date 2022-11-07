const { nanoid } = require('nanoid');
const { books } = require('./books');

const addBookHandler = (request, h) => {
  // deconstruct from user request payload
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  //   console.log(name, year, author, summary, publisher, pageCount, readPage, readPage);

  const id = nanoid(5);
  const insertedAt = new Date();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};
const getBookByNameHandler = (request, h) => {
  const { name } = request.query;
  const regex = new RegExp(`${name}`, 'i');
  const filteredBooks = books.filter((book) => regex.test(book.name));

  if (filteredBooks.length === 0) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};
const getBookByReadingStatusHandler = (request, h) => {
  let { reading } = request.query;
  console.log(typeof reading);
  if (reading === '1') {
    reading = true;
  } else {
    reading = false;
  }
  console.log(reading);
  const filteredBooks = books.filter((book) => book.reading === reading);
  if (filteredBooks.length === 0) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};
const getBookByFinishedStatusHandler = (request, h) => {
  let { finished } = request.query;
  if (finished === '1') {
    finished = true;
  } else {
    finished = false;
  }
  const filteredBooks = books.filter((book) => book.finished === finished);
  if (filteredBooks.length === 0) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};
const getAllBookHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  if (name !== undefined) {
    console.log('name is exist');
    return getBookByNameHandler(request, h);
  }
  if (reading !== undefined) {
    console.log('reading is exist');
    return getBookByReadingStatusHandler(request, h);
  }
  if (finished !== undefined) {
    console.log('finished is exist');
    return getBookByFinishedStatusHandler(request, h);
  }

  const response = h.response({
    status: 'success',
    data: {
      books: books.map((book) => ({ id: book.id, name: book.name, publisher: book.publisher })),
    },
  });
  response.code(200);
  return response;
};

const getBookDetailHandler = (request, h) => {
  const { bookId: id } = request.params;
  const requestedBook = books.find((book) => book.id === id);
  if (requestedBook === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  const response = h.response({
    status: 'success',
    data: {
      book: requestedBook,
    },
  });
  response.code(200);
  return response;
};
const editBookByIdHandler = (request, h) => {
  const { bookId: id } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const index = books.findIndex((book) => book.id === id);
  const updatedAt = new Date();
  const finished = pageCount === readPage;

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    // Bad Request
    response.code(400);
    return response;
  }
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }
  if (index !== -1) {
    // only insertedAt not updated
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};
const deleteBookByIdHandler = (request, h) => {
  const { bookId: id } = request.params;
  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBookHandler,
  getBookDetailHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
