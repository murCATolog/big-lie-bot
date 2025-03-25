// імпортуємо клас Telegraf із бібліотеки telegraf
import { Telegraf, Markup } from "telegraf";

// імпортмуємо модуль fs з NodeJS для роботи файловою системою асинхорнно
import fs from 'fs/promises';

// шлях до JSON файлів
const USERS_ID_JSON = './users_id.json';
const QUOTE_JSON = './quotes.json';

// створюємо клас бот
class QuoteBot extends Telegraf {
  constructor(token) {
    super(token); // токен боту (метод успадкований з класу Telegraf)
    this.chatId = null;
    this.activeUsers = [];    // масив юзерів, які підписалися на отримання автоповідомлень
    this.quotes = [];     // тут обʼєкт з цитатами
    this.quoteIndex = 0;    // індекс початкової цитати

    // інфа про активацію надсилання автоцитат
    this.activeGen = true;  // стан активності автоматичних цитат
    this.bufferDate = null; // буферна дата =)

    // КНОПКИ БОТА
    // назви кнопок
    this.keysNames = {
      generate: 'Згенерувати цитату. Прі мнє!',
      on: 'Присилати 1 цитату щодня',
      off: 'Не присилати цитату щодня',
    };
  };

  // отримуємо дані про юзерів із user_id.json і записуємо нові id
  async getUsers(context = null) {
    try{
      const readUsersFile = await fs.readFile(USERS_ID_JSON, 'utf-8');
      this.activeUsers = JSON.parse(readUsersFile); // перетворюємо json у об'єкт
      if (!this.activeUsers.includes(context.chat.id)) {  // фільтр вже істнуючих id
        this.activeUsers.push(context.chat.id); // додаємо новий id у об'єкт
        await fs.writeFile(USERS_ID_JSON, JSON.stringify(this.activeUsers, null, 2)); // парсимо об'єкт у файл і записуємо
      };  
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
    // інфа при старі бота
    this.start(async (context) => {
      // запуск метода додавання id чату при старті
      await this.getUsers(context);
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
    this.action('generate', async (context) => {
      context.reply(await this.getQuote());
    });

    // вимикання автогенерації
    this.action('off', (context) => {
      this.activeGen = false;
      context.reply('Головєшка ВИМКНУВ автоматичну генерацію цитат. Ти вчинив як п...', this.getButtonsMenu());
    });

    // вмикання автогенерації
    this.action('on', async (context) => {
        this.activeGen = true;
        await this.getUsers(context);  // додаємо id чату
        context.reply('Порядочно! Генерація цитат УВІМКНЕНА!', this.getButtonsMenu());
      });
  }


  // зчитуємо цитати з файлу
  async parseQuote() {
    try {
      const quotesData = await fs.readFile(QUOTE_JSON, 'utf-8');
      this.quotes = JSON.parse(quotesData);
    }
    catch(error) {
      console.error('Помилка зчитування файлу цитат: ' + error);
      this.quotes = [];
    }
  };

  // отримуємо цитату з масиву
  async getQuote() {
    try{
      await this.parseQuote();  // чекаємо зчитування файлу цитат
      if (this.quotes.length > 0) {
        if (this.quoteIndex >= this.quotes.length) {
        this.quoteIndex = 0;  // скидаємо індекс, якщо вийшли за межі
        };
        let newQuote = `${this.quotes[this.quoteIndex].quote}\n— ${this.quotes[this.quoteIndex].author}`;
        this.quoteIndex++;
        console.log(newQuote);
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
    setInterval(async () => {
      let currnetDate = new Date().getDate();  // поточна дата
      let currentHour = new Date().getHours(); // поточний час
      if(this.bufferDate == null) {
        this.bufferDate = currnetDate;
      }
      if(this.bufferDate == currnetDate && currentHour >= 10 && this.activeGen == true) {
        await this.telegram.sendMessage(7786433459, await this.getQuote());
        this.bufferDate = currnetDate + 1;
      };
    }, 3000);
  };

  // ініціалізація методів
  async init() {
    await this.getUsers(); // чекаємо користувачів
    this.eventKeys();      // налаштовуємо обробники
    this.timeWatcher();    // запускаємо таймер
  };
};

// анонімка самовкликаюча функція для запуску бота
(async () => {
  const BigLiesBot = new QuoteBot('7570011602:AAG9gpgzgg_MFxJBKVjFBhm99kG79_f9TTU');
  await BigLiesBot.init(); // чекаємо підготовку
  BigLiesBot.launch();           // запускаємо бота
})();