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
        // назви кнопок
        this.keysNames = {
            generate: 'Згенерувати цитату. Прі мнє!',
            plan: 'Запланувати цитату',
            on: 'Включити автогенерацію цитат',
            off: 'Вимкнути автогенерацію цитат',
        };
        // кнопки
        this.genQuoteKey = Markup.keyboard([this.keysNames.generate]).resize();
        this.quoteAlertKey = Markup.keyboard([this.keysNames.plan]).resize();
        // масив з набором годин
        this.hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        // конпка для вибору години для генерації цитати
        this.hoursKey = Markup.keyboard(this.hours).resize();
        // викликаємо обробник подій
        this.eventKeys();
    };
    // генерація меню в залежності від on/off
    getButtonsMenu() {
        const startKeys = Markup.keyboard([this.keysNames.generate, this.keysNames.plan, this.keysNames.on]).resize();
        const stopKeys = Markup.keyboard([this.keysNames.generate, this.keysNames.plan, this.keysNames.off]).resize();
        return this.activeGen ? stopKeys : startKeys;
    };
    // обробка всіх подій(окрім getButtonsMenu)
    eventKeys() {
        this.start(async (context) => {   //метод start із бібліотеки Telegraf
            try{
                await context.replyWithPhoto({ source: './img/main.jpg' });
            }
            catch(error) {
                console.log(error);
                context.reply('Упс! Чомусь картинка не завантажилась! 😢 \nПовідом мене про помилку: \n@murCATolog');
            }
            await context.reply(
                'Доооооообрий вечір, хлопці!\nЯ буду генерувати Вам фрази широковідомих у вузьких колах шахраїв\n(і не тільки).\nТи можеш генерувати цитати одразу або ж\nналаштувати автоматичну генерацію раз на добу.\nЄ питання? Пиши: @murCATolog'
            );
        });
        this.hears(this.keysNames.generate, (context) => {
            context.reply(this.getRandomQuote());
        });
        this.hears(this.keysNames.off, (context) => {
            this.activeGen = false;
            context.reply('Головєшка ВИМКНУВ автоматичну генерацію цитат. Ти вчинив як п...', this.getButtonsMenu());
        });
        this.hears(this.keysNames.on, (context) => {
            this.activeGen = true;
            context.reply('Порядочно! Генерація цитат УВІМКНЕНА!',this.getButtonsMenu());
        });
        this.hears(this.keysNames.plan, (context) => {
            context.reply('Малой, о котрій годині присилати цитату?', this.hoursKey);
        });
        this.hears(this.hours, (context) => {
            this.activeGen = true;
            context.reply('Цитату заплановано.', this.getButtonsMenu());
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
const BigLiesBot = new QuoteBot('7570011602:AAG9gpgzgg_MFxJBKVjFBhm99kG79_f9TTU');

BigLiesBot.launch();