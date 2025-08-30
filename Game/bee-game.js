// Handle Start Button overlay
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('game-start-button');
  const startOverlay = document.getElementById('game-start-overlay');

  if (startButton && startOverlay) {
    startButton.addEventListener('click', () => {
      startOverlay.classList.add('start-fade-out');
      setTimeout(() => {
        startOverlay.style.display = 'none';
      }, 500);

      startBackgroundBees();
    });
  }
});

// Set up basic game state
let money = 100;
let day = 1;
const maxDays = 10;

// Garden setup
let garden = [
  { flower: null, unlocked: true },
  { flower: null, unlocked: false },
  { flower: null, unlocked: false },
];

// Flower data
const flowers = [
  { name: 'Beebalm', price: 50, bees: 30, image: '../Game/sprites/Beebalm.png' },
  { name: 'Sunflower', price: 45, bees: 25, image: '../Game/sprites/Sunflower.png' },
  { name: 'Borage', price: 35, bees: 20, image: '../Game/sprites/Borage.png' },
  { name: 'Goldenrod', price: 25, bees: 15, image: '../Game/sprites/Goldenrod.png' },
  { name: 'Snapdragon', price: 20, bees: 10, image: '../Game/sprites/Snapdragon.png' },
  { name: 'Hyacinth', price: 15, bees: 5, image: '../Game/sprites/Hyacinth.png' },
];

// Seed shop setup
const seeds = [
  { name: 'SeedsBeebalm', flower: 'Beebalm', image: '../Game/sprites/SeedsBeebalm.png' },
  { name: 'SeedsSunflower', flower: 'Sunflower', image: '../Game/sprites/SeedsSunflower.png' },
  { name: 'SeedsBorage', flower: 'Borage', image: '../Game/sprites/SeedsBorage.png' },
  { name: 'SeedsGoldenrod', flower: 'Goldenrod', image: '../Game/sprites/SeedsGoldenrod.png' },
  { name: 'SeedsSnapdragon', flower: 'Snapdragon', image: '../Game/sprites/SeedsSnapdragon.png' },
  { name: 'SeedsHyacinth', flower: 'Hyacinth', image: '../Game/sprites/SeedsHyacinth.png' },
];

// DOM Elements
const moneySpan = document.getElementById('money');
const daySpan = document.getElementById('day');
const shopItemsDiv = document.getElementById('shop-items');
const shopPotDiv = document.getElementById('shop-pot');
const gardenArea = document.getElementById('garden-area');
const plantDisplay = document.getElementById('plant-display');
const endDayButton = document.getElementById('end-day-button');
const scoreboard = document.getElementById('scoreboard');
const scoreMoney = document.getElementById('score-money');
const scoreBees = document.getElementById('score-bees');
const scoreFlowers = document.getElementById('score-flowers');
const scoreStars = document.getElementById('score-stars');
const scoreBest = document.getElementById('score-best');
const restartButton = document.getElementById('restart-button');
const bonusOverlay = document.getElementById('end-day-bonus-overlay');
const bonusMessage = document.getElementById('bonus-message');
const bonusContinueButton = document.getElementById('bonus-continue-button');

// Initialize seed shop
seeds.forEach(seed => {
  const flower = flowers.find(f => f.name === seed.flower);

  const seedWrapper = document.createElement('div');
  seedWrapper.classList.add('seed-wrapper');

  const seedImg = document.createElement('img');
  seedImg.src = seed.image;
  seedImg.alt = seed.name;
  seedImg.classList.add('seed-packet');
  seedImg.setAttribute('draggable', true);

  const seedLabel = document.createElement('div');
  seedLabel.classList.add('seed-label');
  seedLabel.innerHTML = `<strong>${seed.flower}</strong><br>$${flower.price}`;

  seedWrapper.appendChild(seedImg);
  seedWrapper.appendChild(seedLabel);
  shopItemsDiv.appendChild(seedWrapper);

  seedImg.addEventListener('dragstart', function (e) {
    e.dataTransfer.setData('text/plain', seed.flower);
  });

  seedWrapper.updateAffordability = function () {
    const previouslyAffordable = seedImg.classList.contains('seed-affordable');

    if (money < flower.price) {
      seedImg.classList.add('seed-unaffordable');
      seedImg.classList.remove('seed-affordable');
    } else {
      if (!previouslyAffordable) {
        seedImg.classList.add('seed-glow');
        setTimeout(() => seedImg.classList.remove('seed-glow'), 600);
      }
      seedImg.classList.add('seed-affordable');
      seedImg.classList.remove('seed-unaffordable');
    }
  };

  seedWrapper.updateAffordability();

  if (!shopItemsDiv.seedWrappers) shopItemsDiv.seedWrappers = [];
  shopItemsDiv.seedWrappers.push(seedWrapper);
});

// Set up pot shop
const potWrapper = document.createElement('div');
potWrapper.classList.add('pot-wrapper');

const potImg = document.createElement('img');
potImg.src = '../Game/sprites/LiterallyJustAPot.png';
potImg.alt = 'Buy Pot';
potImg.classList.add('buyable-pot');
potImg.setAttribute('draggable', true);

const potLabel = document.createElement('div');
potLabel.classList.add('pot-label');
potLabel.innerHTML = '$50';

potWrapper.appendChild(potImg);
potWrapper.appendChild(potLabel);
shopPotDiv.appendChild(potWrapper);

potImg.addEventListener('dragstart', function (e) {
  e.dataTransfer.setData('text/plain', 'pot');
});

// Drag and drop logic
gardenArea.addEventListener('dragover', function (e) {
  e.preventDefault();
});

gardenArea.addEventListener('drop', function (e) {
  e.preventDefault();
  const name = e.dataTransfer.getData('text/plain');

  if (name === 'pot') {
    buyPot();
  } else {
    const flower = flowers.find(f => f.name === name);
    if (flower) {
      const potIndex = garden.findIndex(p => p.unlocked && !p.flower);
      if (potIndex !== -1 && money >= flower.price) {
        garden[potIndex].flower = flower;
        money -= flower.price;

        const potImages = plantDisplay.querySelectorAll('img');
        const img = potImages[potIndex];

        img.src = flower.image;
        img.classList.remove('harvestable');
        img.classList.remove('sparkle');
        img.classList.add('growing');

        // Plant grow animation
        img.classList.add('plant-grow');
        setTimeout(() => img.classList.remove('plant-grow'), 400);

        updateUI();
      }
    }
  }
});

// End of day logic
endDayButton.addEventListener('click', () => {
  if (day >= maxDays) {
    showScoreboard();
  } else {
    makeFlowersHarvestable();

    const baseBonus = 20;
    const beeBonus = calculateEndDayBeeBonus();
    money += baseBonus + beeBonus;

    bonusMessage.innerHTML = `
      You earned <strong>$${baseBonus}</strong> for surviving the day.<br>
      ${beeBonus > 0 ? `And an extra <strong>$${beeBonus}</strong> for bees!` : ''}
    `;
    bonusOverlay.style.display = 'flex';
    bonusOverlay.classList.remove('bonus-bounce-in');
    void bonusOverlay.offsetWidth;
    bonusOverlay.classList.add('bonus-bounce-in');

    updateUI();
  }
});

// Bonus continue button
bonusContinueButton.addEventListener('click', () => {
  bonusOverlay.style.display = 'none';
  day++;
  updateUI();
});

// Helper functions
function resetHarvestableState() {
  const pots = plantDisplay.querySelectorAll('img');
  pots.forEach((img) => {
    img.classList.remove('harvestable');
    img.classList.remove('growing');
  });
}

function makeFlowersHarvestable() {
  const pots = plantDisplay.querySelectorAll('img');
  pots.forEach((img, index) => {
    if (garden[index] && garden[index].flower) {
      img.classList.add('harvestable');
      img.classList.remove('growing');
      img.addEventListener('click', () => harvestFlower(index), { once: true });
    }
  });
}

function buyPot() {
  const nextLocked = garden.find(p => p.unlocked === false);
  if (nextLocked && money >= 50) {
    nextLocked.unlocked = true;
    money -= 50;
    updateGarden();
    updateUI();
  } else {
    alert('No locked pots left or not enough money!');
  }
}

function harvestFlower(index) {
  if (garden[index] && garden[index].flower) {
    const beesEarned = garden[index].flower.bees;
    money += beesEarned;

    const potImages = plantDisplay.querySelectorAll('img');
    const img = potImages[index];

    img.classList.add('harvest-fade-out');

    setTimeout(() => {
      garden[index].flower = null;
      updateGarden();
      updateUI();
    }, 400);

    spawnBee();
    checkCombos(index);
  }
}

function spawnBee() {
  const numberOfBees = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < numberOfBees; i++) {
    setTimeout(() => {
      const bee = document.createElement('img');
      bee.src = '../Game/sprites/beeLogo.png';
      bee.classList.add('bee-sprite');
      bee.style.left = Math.random() * 80 + 10 + '%';
      bee.style.bottom = '0px';
      gardenArea.appendChild(bee);

      setTimeout(() => {
        bee.remove();
      }, 2000);
    }, i * 150); // bees spawn slightly delayed
  }
}

function startBackgroundBees() {
  setInterval(() => {
    const garden = document.getElementById('garden-area');
    const bgBee = document.createElement('img');
    bgBee.src = '../Game/sprites/beeLogo.png';
    bgBee.classList.add('background-bee');

    bgBee.style.width = '16px';
    bgBee.style.height = '16px';
    bgBee.style.objectFit = 'contain';

    const gardenWidth = garden.clientWidth;
    const gardenHeight = garden.clientHeight;

    const startX = Math.random() * (gardenWidth - 30);
    const startY = Math.random() * (gardenHeight - 30);

    bgBee.style.left = `${startX}px`;
    bgBee.style.top = `${startY}px`;

    // Random movement distances
    const moveX = Math.random() * 120 - 60; // random -60px to +60px
    const moveY = Math.random() * 120 - 60; // random -60px to +60px

    // Unique animation name per bee
    const animationName = `beeFloat${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const keyframes = `
      @keyframes ${animationName} {
        0% {
          transform: translate(0px, 0px) scale(0.9);
          opacity: 0;
        }
        10% {
          opacity: 0.8;
        }
        50% {
          transform: translate(${moveX / 2}px, ${moveY / 2}px) scale(1.05);
          opacity: 0.8;
        }
        90% {
          opacity: 0.8;
        }
        100% {
          transform: translate(${moveX}px, ${moveY}px) scale(1);
          opacity: 0;
        }
      }
    `;

    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

    const randomDuration = 5 + Math.random() * 3; // 5s to 8s
    bgBee.style.animation = `${animationName} ${randomDuration}s linear forwards`;

    garden.appendChild(bgBee);

    setTimeout(() => {
      bgBee.remove();
    }, randomDuration * 1000);
  }, 2000);
}


function updateGarden() {
  const potImages = plantDisplay.querySelectorAll('img');
  potImages.forEach((img, index) => {
    const pot = garden[index];
    if (!pot) return;

    if (!pot.unlocked) {
      img.src = '../Game/sprites/GreyPot.png';
      img.classList.remove('growing', 'harvestable', 'sparkle');
    } else if (pot.flower) {
      img.src = pot.flower.image;
      img.classList.add('growing');
      img.classList.remove('harvestable', 'sparkle');
    } else {
      img.src = '../Game/sprites/LiterallyJustAPot.png';
      img.classList.remove('growing', 'harvestable', 'sparkle');
    }
  });

  if (shopItemsDiv.seedWrappers) {
    shopItemsDiv.seedWrappers.forEach(wrapper => {
      wrapper.updateAffordability();
    });
  }

  updatePotAffordability();
}

function updatePotAffordability() {
  if (money >= 50) {
    potImg.classList.add('pot-affordable');
  } else {
    potImg.classList.remove('pot-affordable');
  }
}

function updateUI() {
  moneySpan.textContent = `Money: $${money}`;
  daySpan.textContent = `Day: ${day}/${maxDays}`;

  if (shopItemsDiv.seedWrappers) {
    shopItemsDiv.seedWrappers.forEach(wrapper => {
      wrapper.updateAffordability();
    });
  }

  updatePotAffordability();
}

function checkCombos(index) {
  const flowerType = garden[index]?.flower?.name;
  if (!flowerType) return;

  const sameFlowers = garden.filter(p => p.flower?.name === flowerType);
  if (sameFlowers.length >= 2) {
    const potImages = plantDisplay.querySelectorAll('img');
    potImages[index].classList.add('sparkle');
    money += 50;
  }
}

function calculateBees() {
  return garden.reduce((total, pot) => {
    if (pot.flower) {
      return total + pot.flower.bees;
    }
    return total;
  }, 0);
}

function calculateEndDayBeeBonus() {
  const bees = calculateBees();
  if (bees >= 100) return 50;
  if (bees >= 50) return 30;
  if (bees >= 25) return 15;
  if (bees >= 10) return 5;
  return 0;
}

function showScoreboard() {
  const totalBees = calculateBees();
  const stars = calculateStars(totalBees);
  const bestBees = getBestBees();

  scoreMoney.textContent = `Total Money: $${money}`;
  scoreBees.textContent = `Total Bees Attracted: ${totalBees}`;
  scoreFlowers.textContent = `Total Flowers Planted: ${garden.filter(p => p.flower !== null).length}`;
  scoreStars.textContent = `⭐ ${stars} Stars`;

  if (totalBees > bestBees) {
    saveBestBees(totalBees);
    scoreBest.textContent = `New Best! ${totalBees} Bees!`;
  } else {
    scoreBest.textContent = `Best Record: ${bestBees} Bees`;
  }

  const gameArea = document.getElementById('bee-garden-game');
  gameArea.style.transition = 'opacity 0.5s ease';
  gameArea.style.opacity = '0';

  setTimeout(() => {
    gameArea.style.display = 'none';
    scoreboard.style.display = 'block';  // Make scoreboard visible
    scoreboard.classList.add('show');    // Then fade it in
  }, 500);
}

function calculateStars(bees) {
  if (bees >= 100) return 5;
  if (bees >= 75) return 4;
  if (bees >= 50) return 3;
  if (bees >= 25) return 2;
  if (bees >= 10) return 1;
  return 0;
}

function saveBestBees(bees) {
  localStorage.setItem('bestBees', bees);
}

function getBestBees() {
  return parseInt(localStorage.getItem('bestBees') || '0');
}

// Restart game button
restartButton.addEventListener('click', () => {
  location.reload();
});

// Initialize game display
updateGarden();
updateUI();
