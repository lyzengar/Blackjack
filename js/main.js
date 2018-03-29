/*----- constants -----*/

class Card {
  constructor(face, value) {
    this.face = face;
    this.value = value;
  }
}

/*----- app's state (variables) -----*/

var deck = [];
var suits = ['d', 'c', 'h', 's'];
var faces = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
var dealerCards = [];
var playerCards = [];
var playerValue, dealerValue;
var handInProgress;
var bankroll, bet;
var messageToDisplay = '';

/*----- cached element references -----*/

var dealerHand = document.querySelector('#dealerHand');
var playerHand = document.querySelector('#playerHand');
var inPlayBtns = document.querySelector('#in-play-btns');
var shuffleBtn = document.querySelector('#newHand');
var message = document.querySelector('.message');
var betBtns = document.querySelector('#betButtons');
var bank = document.querySelector('#bank');
var currentBet = document.querySelector('#currentBet');

/*----- event listeners -----*/

document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stand').addEventListener('click', stand);
document.getElementById('newHand').addEventListener('click', deal);
document.getElementById('betButtons').addEventListener('click', incrementBet);

/*----- functions -----*/

function newDeck() {
  suits.forEach(function (suit) {
    faces.forEach(function (face) {
      var val = parseInt(face);
      if (isNaN(val)) {
        val = face === 'A' ? 11 : 10;
      }
      deck.push(new Card(suit + face, val));
    });
  });
}

function shuffle() {
  var shuffledDeck = [];
  while (deck.length) {
    var rnd = Math.floor(Math.random() * deck.length);
    shuffledDeck.push(deck.splice(rnd, 1)[0]);
  }
  deck = shuffledDeck;
}

function deal() {
  playerValue = null;
  dealerValue = null;
  deck = [];
  playerCards = [];
  dealerCards = [];
  messageToDisplay = '';
  newDeck();
  shuffle();
  handInProgress = true;
  playerCards.push(deck[0], deck[2]);
  dealerCards.push(deck[1], deck[3]);
  deck.splice(0, 4);
  playerValue = computeHand(playerCards);
  dealerValue = computeHand(dealerCards);
  if (playerValue === 21 && dealerValue === 21) {
    handInProgress = false;
    messageToDisplay = 'Tie Game';
    tieGame();
    newBet();
  } else if (playerValue === 21 && dealerValue !== 21) {
    handInProgress = false;
    messageToDisplay = 'Blackjack!';
    payout();
    newBet();
  } else if (playerValue !== 21 && dealerValue === 21) {
    handInProgress = false;
    messageToDisplay = 'Dealer Wins';
    newBet();
  }
  render();
}

function computeHand(hand) {
  var total = 0;
  var numAces = 0;
  hand.forEach(c => {
    total += c.value;
    numAces += c.value === 11 ? 1 : 0;
  });

  while (total > 21 && numAces) {
    total -= 10;
    numAces--;
  }
  return total;
}

function hit() {
  playerCards.push(deck[0]);
  deck.shift();
  playerValue = computeHand(playerCards);
  if (playerValue > 21) {
    handInProgress = false;
    messageToDisplay = 'Bust!'
    newBet();
  }
  render();
}

function stand() {
  if (dealerValue > 16) {
    render();
  }
  while (dealerValue <= 16) {
    dealerCards.push(deck[0]);
    dealerValue = computeHand(dealerCards);
    deck.shift();
    render();
    if (dealerValue > 21) {
      messageToDisplay = 'You Win!';
      payout();
      newBet();
      render();
    }
  }
  handInProgress = false;
  render();
  checkForWinner();
}

function checkForWinner() {
  if (playerValue === dealerValue) {
    messageToDisplay = 'Tie Game';
    tieGame();
    newBet();
  } else if (playerValue > dealerValue) {
    messageToDisplay = 'You Win!';
    payout();
    newBet();
    render();
  } else if (dealerValue > playerValue && dealerValue <= 21) {
    messageToDisplay = 'Dealer Wins';
    newBet();
  } else { }
  render();
}

function incrementBet(e) {
  bet += parseInt(e.target.textContent.replace('+ $', ''));
  bankroll -= parseInt(e.target.textContent.replace('+ $', ''));
  render();
}

function payout() {
  bankroll += (bet * 1.5);
  return bankroll;
}

function tieGame() {
  bankroll += bet;
  return bankroll;
}

function newBet() {
  bet = 0;
  return bet;
}

function initialize() {
  bankroll = 500;
  bet = 0;
}

function render() {
  var html = '';
  bank.innerHTML = `<span>Bank</span>$${bankroll}`;
  currentBet.innerHTML = `<span>Bet</span>$${bet}`;
  playerCards.forEach(function (card) {
    html += `<div class="card ${card.face}"></div>`;
  });
  playerHand.innerHTML = html;
  html = '';
  dealerCards.forEach(function (card, idx) {
    if (handInProgress) {
      html += `<div class="card ${idx ? card.face : 'back-red'}"></div>`;
    } else {
      html += `<div class="card ${card.face}"></div>`;
    }
  });
  dealerHand.innerHTML = html;
  inPlayBtns.style.display = handInProgress ? '' : 'none';
  shuffleBtn.style.display = handInProgress || (bet === 0) ? 'none' : '';
  betBtns.style.display = handInProgress || bankroll < 5 ? 'none' : '';
  messageToDisplay = bankroll < 5 && bet === 0 && handInProgress === false ? 'Game Over' : messageToDisplay;
  message.textContent = messageToDisplay;
}

initialize();
render();