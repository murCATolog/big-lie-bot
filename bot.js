// імпортуємо клас Telegraf із бібліотеки telegraf
import { Telegraf, Markup } from "telegraf";
// імпортуємо цитати з локального файлу quotes.json і NodeJS разопарсить його як обʼєкт
import quotes from './quotes.json' with { type: 'json' };
// створюємо клас бот
class QuoteBot extends Telegraf {
    constructor(token) {
        super(token); // токен боту(метод успадкований з класу Telegraf)
        this.activeGen = true;    // стан активності автоматичних цитат
        this.quotes = quotes;   // тут обʼєкт з цитатами
        // кнопки бота
        this.startKey = Markup.keyboard(['Згенерувати цитату! Прі мнє!', 'Запланувати цитату', 'Автогенерація цитат(OFF)']).resize();
        this.stopKey = Markup.keyboard(['Згенерувати цитату! Прі мнє!', 'Запланувати цитату', 'Автогенерація цитат(ON)']).resize();
        this.genQuote = Markup.keyboard(['Згенерувати цитату! Прі мнє!']).resize();
        this.quoteAlertKey = Markup.keyboard(['Запланувати цитату']).resize();
        this.hours = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
        // обрати годину для генерації цитати
        this.hoursKey = Markup.keyboard(this.hours).resize();
        // логіка кнопок
        this.hears('Згенерувати цитату! Прі мнє!', (context) => {
            context.reply(this.getRandomQuote());
        });
        this.hears('Автогенерація цитат(ON)', (context) => {
            this.activeGen = false;
            context.reply('Головєшка ВИМКНУВ автоматичну генерацію цитат. Ти вчинив як п...', this.startKey);
        });
        this.hears('Автогенерація цитат(OFF)', (context) => {
            this.activeGen = true;
            context.reply('Порядочно! Генерація цитат УВІМКНЕНА!',this.stopKey);
        });
        this.hears('Запланувати цитату', (context) => {
            context.reply('Малий, о котрій годині присилати цитату?', this.hoursKey);
        });
        this.hears(this.hours, (context) => {
            this.activeGen;
            context.reply('Цитату заплановано.', this.stopKey);
        });
    };
    // старт бота
    startBot() {
        this.start((context) => {   //метод start із бібліотеки Telegraf
            context.reply(
                'Доооооообрий вечір, хлопці!\nЯ буду генерувати Вам фрази широковідомих у вузьких колах шахраїв\n(і не тільки).\nТи можеш генерувати цитати одразу або ж\nналаштувати автоматичну генерацію раз на добу.\nЄ питання? Пиши: @murCATolog',
                this.startKey
            );
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
const BigLiesBot = new QuoteBot('YOUR_TOKEN!');

BigLiesBot.startBot();
BigLiesBot.launch();