require('dotenv').config();
const { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { getRandomQuestion, getCorrectAnswer } = require('./utils')

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
    const startKeyboard = new Keyboard()
        .text('HTML')
        .text('CSS')
        .row()
        .text('JavaScript')
        .text('React')
        .resized();
    await ctx.reply('' +
        'Привет! Меня зовут «Frontend Interview Bot» (◕‿◕)\n' +
        'Я помогу тебе подготовиться к собеседованию на позицию разработчика информационных систем! ' +
        'Начнём!'
    );
    await ctx.reply('Выберите тему для рассмотрения...', {
        reply_markup: startKeyboard,
    });
});

bot.hears(['HTML', 'CSS', 'JavaScript', 'React'], async (ctx) => {
    const topic = ctx.message.text;
    const question = getRandomQuestion(topic);

    let inlineKeyBoard;

    if (question.hasOptions) {
        const buttonRows = question.options.map(
            (option) => [InlineKeyboard.text(
                option.text,
                JSON.stringify({
                type: `${topic}-option`,
                isCorrect: option.isCorrect,
                questionId: question.id,
                })
            )]
        );

        inlineKeyBoard = inlineKeyBoard.from(buttonRows);
    } else {
        inlineKeyBoard = new InlineKeyboard().text(
            'Узнать ответ',
            JSON.stringify({
                type: topic,
                questionId: question.id,
            })
        );
    }

    await ctx.reply(question.text, {
        reply_markup: inlineKeyBoard,
    });
});

bot.on('callback_query:data', async (ctx) => {
    const callbackData = JSON.parse(ctx.callbackQuery.data);

    if (!callbackData.type.includes('option')) {
        const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);
        await ctx.reply(answer, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        await ctx.answerCallbackQuery();
        return;
    }

    if (callbackData.isCorrect) {
        await ctx.reply('Верно');
        await ctx.answerCallbackQuery();
        return;
    }

    const answer = getCorrectAnswer(callbackData.type.split('-')[0], callbackData.questionId);
    await ctx.reply(`Неверно! Правильный ответ: ${answer}`);
    await ctx.answerCallbackQuery();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.start();