// імпортуємо клас Telegraf із бібліотеки telegraf
import { Telegraf, Markup } from "telegraf";
// імпортуємо цитати з локального файлу quotes.json і NodeJS розпарсить його як обʼєкт
import quotes from './quotes.json' with { type: 'json' };

// створюємо клас бот
class QuoteBot extends Telegraf {
  constructor(token) {
    super(token); // токен боту (метод успадкований з класу Telegraf)
    this.activeGen = true;    // стан активності автоматичних цитат
    this.quotes = quotes;     // тут обʼєкт з цитатами
    this.quoteIndex = 0;    // індекс початкової цитати
    this.activeUsers = [];    // масив юзерів, які підписалися на отримання автоповідомлень

    // КНОПКИ БОТА
    // назви кнопок
    this.keysNames = {
      generate: 'Згенерувати цитату. Прі мнє!',
      on: 'Присилати 1 цитату щодня',
      off: 'Не присилати цитату щодня',
    };

    // викликаємо обробники подій
    this.eventKeys();
    this.timeWatcher();
  }

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
    this.start(async (context) => {
      try {
        await context.replyWithPhoto({ source: './img/main.jpg' });
      } catch (error) {
        console.log(error);
        context.reply('Упс! Чомусь картинка не завантажилась! 😢 \nПовідом про помилку: \n@murCATolog');
      }
      await context.reply(
        'Доооооообрий вечір, хлопці!\nЯ буду присилати тобі фрази широковідомих у вузьких колах шахраїв\n(і не тільки).\nТи можеш генерувати цитати одразу або ж\nналаштувати автоматичну генерацію раз на добу.\nЄ питання? Пиши: @murCATolog',
        this.getButtonsMenu()
      );
    });

    this.action('generate', (context) => {
      context.reply(this.getQuote());
    });

    this.action('off', (context) => {
      this.activeGen = false;
      context.reply('Головєшка ВИМКНУВ автоматичну генерацію цитат. Ти вчинив як п...', this.getButtonsMenu());
    });

    this.action('on', (context) => {
        this.activeGen = true;
        if (!this.activeUsers.includes(context.chat.id)) {
            this.activeUsers.push(context.chat.id);
        };
        context.reply('Порядочно! Генерація цитат УВІМКНЕНА!', this.getButtonsMenu());
      });
  }

  // метод виводу цитати по порядку
  getQuote() {
    if (this.quotes.length > 0) {
        if (this.quoteIndex >= this.quotes.length) {
            this.quoteIndex = 0;
        }
        let quote = `${this.quotes[this.quoteIndex].quote}\n— ${this.quotes[this.quoteIndex].author}`;
        this.quoteIndex++;
        return quote;
    } else {
        return 'Упс! Чомусь цитата не завантажилась! 😢 \nПовідом про помилку: \n@murCATolog';
    }
  }
  // метод, що слідкує за часом
  timeWatcher() {
    const getHour = () => {
        let currentHour = new Date().getHours();
        return currentHour;
      };
    setInterval(() => {
        getHour();
        if (getHour() >= 10 && getHour() <= 20) {
            this.activeUsers.forEach((id) => {
                this.telegram.sendMessage(id, this.getQuote());
            });

        }
    },3600000);
  };
}

// створюємо екземпляр бота і запускаємо його
const BigLiesBot = new QuoteBot('7570011602:AAG9gpgzgg_MFxJBKVjFBhm99kG79_f9TTU');
BigLiesBot.launch();