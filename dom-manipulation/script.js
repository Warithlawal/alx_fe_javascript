document.addEventListener('DOMContentLoaded', () => {
  const quotes = [
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Happiness" },
    { text: "Get busy living or get busy dying.", category: "Motivation" },
    // Add more initial quotes if desired
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');

  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    // Clear the previous quote
    quoteDisplay.textContent = '';
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
    quoteDisplay.appendChild(quoteText);
  }

  newQuoteButton.addEventListener('click', showRandomQuote);

  window.addQuote = function() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      alert('Quote added successfully!');
    } else {
      alert('Please enter both a quote and a category.');
    }
  };

  // Display the first random quote on page load
  showRandomQuote();
});
