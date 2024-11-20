const cardValues = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H'];
let cards = [];
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let moveCount = 0;

// Shuffle the cards
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// Create the game board
function createBoard() {
    shuffle(cardValues);
    const gameContainer = document.getElementById('game-container');
    
    cardValues.forEach(value => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-value', value);
        card.addEventListener('click', flipCard);
        gameContainer.appendChild(card);
        cards.push(card);
    });
}

// Flip the card
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');
    this.textContent = this.getAttribute('data-value');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moveCount++;
    document.getElementById('move-count').textContent = moveCount;

    checkForMatch();
}

// Check for a match
function checkForMatch() {
    const isMatch = firstCard.getAttribute('data-value') === secondCard.getAttribute('data-value');
    
    lockBoard = true;

    if (isMatch) {
        disableCards();
        checkWin();
    } else {
        setTimeout(() => {
            unflipCards();
        }, 1000);
    }
}

// Disable matched cards
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

// Unflip cards if not matched
function unflipCards() {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    firstCard.textContent = '';
    secondCard.textContent = '';
    resetBoard();
}

// Reset the board for the next turn
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    firstCard = null;
    secondCard = null;
}

// Check if the player has won
function checkWin() {
    const allCardsFlipped = cards.every(card => card.classList.contains('fl ipped'));
    if (allCardsFlipped) {
        document.getElementById('status').textContent = 'You win!';
        document.getElementById('restart-btn').style.display = 'block';
    }
}

// Restart the game
document.getElementById('restart-btn').addEventListener('click', () => {
    cards.forEach(card => {
        card.classList.remove('flipped');
        card.textContent = '';
        card.addEventListener('click', flipCard);
    });
    moveCount = 0;
    document.getElementById('move-count').textContent = moveCount;
    document.getElementById('status').textContent = '';
    document.getElementById('restart-btn').style.display = 'none';
    cards = [];
    createBoard();
});

// Initialize the game
createBoard();