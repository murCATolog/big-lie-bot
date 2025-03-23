// імпортуємо клас Telegraf із бібліотеки telegraf
import { Telegraf, Markup } from "telegraf";

// імпортмуємо модуль fs з NodeJS для роботи файловою системою асинхорнно
import fs from 'fs/promises';
import { quote } from "telegraf/format";

const USERS_ID_JSON = './users_id.json';
const QUOTE_JSON = './quotes.json';

// створюємо клас бот
class QuoteBot extends Telegraf {
  constructor(token) {
    super(token); // токен боту (метод успадкований з класу Telegraf)
    this.activeGen = true;    // стан активності автоматичних цитат
    this.activeUsers = [];    // масив юзерів, які підписалися на отримання автоповідомлень
    this.quotes = [];     // тут обʼєкт з цитатами
    this.quoteIndex = 0;    // індекс початкової цитати

    // КНОПКИ БОТА
    // назви кнопок
    this.keysNames = {
      generate: 'Згенерувати цитату. Прі мнє!',
      on: 'Присилати 1 цитату щодня',
      off: 'Не присилати цитату щодня',
    };
  }

  // отримуємо дані про юзерів із user_id.json
  async getUsers() {
    try{
      const readUsersFile = await fs.readFile(USERS_ID_JSON, 'utf-8');
      this.activeUsers = JSON.parse(readUsersFile); // перетворюємо json у об'єкт
    }
    catch(error){
      console.error('Помилка при збереженні файлу users_id.json:', error);
      this.activeUsers = [];  //повертаємо пустий масив у разі помилки
    }
    
  };

  // генерація меню в залежності від on/off
  getButtonsMenu() {
    const startKeys = Markup.inlineKeyboard([
      [Markup.button.callback(this.keysNames.generate, 'generate')],
      [Markup.button.callback(this.keysNames.on, 'on')]
    ]);
    const stopKeys = Markup.inlineKeyboard([
      [Markup.button.callback(this.keysNames.generate, 'generate')],
      [Markup.button.callback(this.keysNames.off, 'off')]
    ]);
    return this.activeGen ? stopKeys : startKeys;
  }

  // обробка всіх подій
  eventKeys() {
    // інфа при сатрі бота
    this.start(async (context) => {
      try {
        await context.replyWithPhoto({ source: './img/main.jpg' });
      } catch (error) {
        console.log(error);
        context.reply('Упс! Чомусь картинка не завантажилась!😢\nПовідом про помилку: \n@murCATolog');
      }
      await context.reply(
        'Доооооообрий вечір, хлопці!\nЯ буду присилати тобі фрази широковідомих у вузьких колах шахраїв\n(і не тільки).\nТи можеш генерувати цитати одразу або ж\nналаштувати автоматичну генерацію раз на добу.\nЄ питання? Пиши: @murCATolog',
        this.getButtonsMenu()
      );
    });

    // генерація цитати одразу
    this.action('generate', (context) => {
      context.reply(this.getQuote());
    });

    // вимикання автогенерації
    this.action('off', (context) => {
      this.activeGen = false;
      context.reply('Головєшка ВИМКНУВ автоматичну генерацію цитат. Ти вчинив як п...', this.getButtonsMenu());
    });

    // вмикання автогенерації
    this.action('on', (context) => {
        this.activeGen = true;
        if (!this.activeUsers.includes(context.chat.id)) {
            this.activeUsers.push(context.chat.id);
        };
        context.reply('Порядочно! Генерація цитат УВІМКНЕНА!', this.getButtonsMenu());
      });
  }

  // зчитуємо цитати з файлу
  async parseQuote() {
    try {
      const quotesData = await fs.readFile(QUOTE_JSON, 'utf-8');
      this.quotes = JSON.parse(quotesData);
      //return this.quotes;
    }
    catch(error) {
      console.error('Помилка зчитування файлу цитат: ' + error);
      this.quotes = [];
      //return this.quotes;
    }
  };
  // отримуємо цитату з масиву
  async getQuote() {
    try{
      await this.parseQuote();  // чекаємо зчитування фалу цитат
      if (this.quotes.length > 0) {
        if (this.quoteIndex >= this.quotes.length) {
        this.quoteIndex = 0;  // скидаємо індекс, якщо вийшли за межі
        };
        let newQuote = `${this.quotes[this.quoteIndex].quote}\n— ${this.quotes[this.quoteIndex].author}`;
        this.quoteIndex++;
        return newQuote;
      } else {
        return 'Список цитат порожній!';
      };
    }
    catch(error){
      console.error('Помилка отримання цитати: ' + error)
      return 'Упс! Чомусь цитата не завантажилась!😢\nПовідом про помилку: \n@murCATolog';
    }
  };
  
  // метод, що слідкує за часом
  timeWatcher() {
    const getHour = () => {
        let currentHour = new Date().getHours();
        return currentHour;
      };
    setInterval(() => {
        getHour();
        // код не дописано
        const nowDate = new Date().getDate();
        console.log(nowDate);
        if (getHour() >= 10 && getHour() <= 20) {
            this.activeUsers.forEach((id) => {
                this.telegram.sendMessage(id, this.getQuote());
            });
        };
    },10000);
  };
  // ініціалізація методів
  async init() {
    await this.getUsers(); // чекаємо користувачів
    this.eventKeys();      // налаштовуємо обробники
    this.timeWatcher();    // запускаємо таймер
  };
};

(async () => {
  const BigLiesBot = new QuoteBot('ТВІЙ ТОКЕН');
  await BigLiesBot.init(); // чекаємо підготовку
  BigLiesBot.launch();           // запускаємо бота
})();
