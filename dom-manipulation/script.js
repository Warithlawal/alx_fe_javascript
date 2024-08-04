document.addEventListener('DOMContentLoaded', () => {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const exportQuotesButton = document.getElementById('exportQuotes');
  const importFileInput = document.getElementById('importFile');
  const categoryFilter = document.getElementById('categoryFilter');

  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Happiness" },
    { text: "Get busy living or get busy dying.", category: "Motivation" },
    // Add more initial quotes if desired
  ];

  const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Replace with your actual endpoint

  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `"${randomQuote.text}" - ${randomQuote.category}`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
  }

  function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote);

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer);
  }

  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      saveQuotes();
      populateCategories();
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      alert('Quote added successfully!');
      syncQuotes(); // Sync after adding a quote
    } else {
      alert('Please enter both a quote and a category.');
    }
  }

  function exportQuotes() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
      syncQuotes(); // Sync after importing quotes
    };
    fileReader.readAsText(event.target.files[0]);
  }

  function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    // Restore the last selected category from local storage
    const lastSelectedCategory = localStorage.getItem('selectedCategory');
    if (lastSelectedCategory) {
      categoryFilter.value = lastSelectedCategory;
    }
  }

  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('selectedCategory', selectedCategory);
    showRandomQuote();
  }

  function getFilteredQuotes() {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === 'all') {
      return quotes;
    }
    return quotes.filter(quote => quote.category === selectedCategory);
  }

  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(serverUrl);
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const serverQuotes = await response.json();
      // Assuming server quotes have the same structure as local quotes
      return serverQuotes.map(quote => ({
        text: quote.body,
        category: 'Server' // Assuming server quotes don't have categories
      }));
    } catch (error) {
      console.error('Error fetching quotes from server:', error);
      return [];
    }
  }

  async function syncQuotes() {
    try {
      // Fetch quotes from the server
      const serverQuotes = await fetchQuotesFromServer();

      // Resolve conflicts by giving precedence to server data
      quotes = [...new Map([...serverQuotes, ...quotes].map(item => [item.text, item])).values()];

      // Update local storage with the merged quotes
      saveQuotes();
      populateCategories();
      
      // Notify user that quotes have been synced with the server
      alert('Quotes synced with server!');
      
      // Send updated quotes to the server
      await sendQuotesToServer(quotes);
    } catch (error) {
      console.error('Error syncing quotes with server:', error);
    }
  }

  async function sendQuotesToServer(quotes) {
    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quotes)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Quotes successfully sent to server.');
    } catch (error) {
      console.error('Error sending quotes to server:', error);
    }
  }

  newQuoteButton.addEventListener('click', showRandomQuote);
  exportQuotesButton.addEventListener('click', exportQuotes);
  importFileInput.addEventListener('change', importFromJsonFile);

  // Display the last viewed quote from session storage if available
  const lastViewedQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
  if (lastViewedQuote) {
    quoteDisplay.innerHTML = `"${lastViewedQuote.text}" - ${lastViewedQuote.category}`;
  } else {
    // Display the first random quote on page load
    showRandomQuote();
  }

  // Populate the category filter dropdown
  populateCategories();

  // Create the form for adding new quotes
  createAddQuoteForm();

  // Sync quotes with the server periodically (every 60 seconds)
  setInterval(syncQuotes, 60000); // Sync every 60 seconds
});
