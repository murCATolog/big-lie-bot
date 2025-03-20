// імпортуємо клас Telegraf із бібліотеки telegraf
import { Telegraf, Markup } from "telegraf";
// імпортуємо цитати з локального файлу quotes.json і NodeJS разопарсить його як обʼєкт
import quotes from './quotes.json' with { type: 'json' };
// '7570011602:AAG9gpgzgg_MFxJBKVjFBhm99kG79_f9TTU');
// створюємо клас бот
class QuoteBot extends Telegraf {
    constructor(token) {
        super(token); // токен боту(метод успадкований з класу Telegraf)
        this.active = true;    // стан боту
        this.quotes = quotes;   // тут обʼєкт з цитатами
        //кнопки бота
        this.startKey = Markup.keyboard(['Запустити бота', 'Згенерувати цитату']).resize();
        this.stopKey = Markup.keyboard(['Зупинити бота', 'Згенерувати цитату']).resize();
        this.genQuoteKey = Markup.keyboard(['Згенерувати цитату']).resize();
    }
    // старт бота
    startBot() {
        this.start((context) => {   //метод start із бібліотеки Telegraf
            context.reply(
                'Доооооообрий вечір, хлопці!\nЯ буду генерувати Вам фрази широковідомих у вузьких колах шахраїв\n(і не тільки).\nЄ питання? Пиши: @murCATolog',
                this.stopKey
            );
        });
    };
    // логіка кнопок
    buttonsAction() {
        this.hears('Зупинити бота', (context) => {
            this.active = false;
            context.reply('Бота зупинено.', this.startKey);
        });
        this.hears('Запустити бота', (context) => {
            this.active = true;
            context.reply('Бота запущено.', this.stopKey);
        });
        this.hears('Згенерувати цитату', (context) => {
            context.reply(this.getRandomQuote(),  this.genQuoteKey);
        });

    };
    // генеруємо рандомні цитати
    getRandomQuote() {
        if (this.quotes.length > 0) {
            const number = Math.floor(Math.random() * this.quotes.length);
            return `${this.quotes[number].quote}\n— ${this.quotes[number].author}`; 
        } else {
            return 'Упс! Чомусь цитата не завантажилась! 😢 \nПовідом мене про помилку: \n@murCATolog';
        };
    };
};
// створюємо екземпляр бота і запускаємо його
const BigLiesBot = new QuoteBot('YOUR_NEW_TOKEN_HERE');

BigLiesBot.startBot();
BigLiesBot.buttonsAction();
BigLiesBot.launch();