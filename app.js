const formEl = document.getElementById('calc-form');
const dateInputEl = document.getElementById('start-date');
const resultEl = document.getElementById('result');

const DAY_STEPS = Array.from({ length: 10 }, (_, index) => (index + 1) * 100);
const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

function createLocalDate(isoDateText) {
  const [year, month, day] = isoDateText.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = weekdayNames[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

function renderCards(startDate) {
  resultEl.innerHTML = '';

  const fragment = document.createDocumentFragment();

  DAY_STEPS.forEach((days) => {
    const targetDate = addDays(startDate, days);

    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('strong');
    title.textContent = `${days}일`;

    const dateText = document.createElement('time');
    dateText.dateTime = targetDate.toISOString().slice(0, 10);
    dateText.textContent = formatDate(targetDate);

    card.append(title, dateText);
    fragment.appendChild(card);
  });

  resultEl.appendChild(fragment);
}

function setDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  dateInputEl.value = `${year}-${month}-${day}`;
}

formEl.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!dateInputEl.value) {
    return;
  }

  const startDate = createLocalDate(dateInputEl.value);
  renderCards(startDate);
});

setDefaultDate();
renderCards(createLocalDate(dateInputEl.value));
