//імпортуємо клас Telegraf із бібліотеки telegraf
import { Telegraf } from "telegraf";
// імпортуємо цитати з локального файлу quotes.json і кажемо NodeJS розпарсити його як обʼєкт
import quotes from './quotes.json' with { type: 'json' };
//створюємо бота з токену
const bot = new Telegraf(/* BOT_TOKEN */);

//налаштовуємо обробку команди /start
bot.start((context) => {
//отримуємо рандомний індекс
    if(quotes.length > 0) {
        const getRandomQuote = () => Math.floor(Math.random() * quotes.length);
        let number = getRandomQuote();
        context.reply(quotes[number].quote + '\n' + quotes[number].author);
    } else {
        context.reply('Упс! Щось пішло не так! 😢 \n Повідом мене про помилку: \n @murCATolog');
    }
});

//запускаємо бота
bot.launch();