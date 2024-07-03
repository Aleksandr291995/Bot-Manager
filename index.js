const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Замени токеном бота
const token = '7327513055:AAGm_ZI9DaIJ-jofagf0agJBQWkz_q1z8A0';
const channelUsername = '@nosenkovcourse'; // Имя канала

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Для получения подарка нужно подписаться на канал. Нажмите кнопку "Проверить подписку", когда подпишетесь.', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Подписаться на канал', url: `https://t.me/${channelUsername.substring(1)}` },
          { text: 'Проверить подписку', callback_data: 'check_subscription' }
        ]
      ]
    }
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;

  if (callbackQuery.data === 'check_subscription') {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${token}/getChatMember`, {
        params: {
          chat_id: channelUsername,
          user_id: userId
        }
      });

      const { status } = response.data.result;

      if (status === 'member' || status === 'administrator' || status === 'creator') {
        bot.sendMessage(chatId, 'Спасибо за подписку! Вот ваш подарок.');

        // Отправка файла в качестве подарка
        const filePath = './file/ints.pdf';
        bot.sendDocument(chatId, fs.createReadStream(filePath));
      } else {
        bot.sendMessage(chatId, 'Вы не подписаны на канал. Пожалуйста, подпишитесь, чтобы получить подарок.');
      }
    } catch (error) {
      console.error('Ошибка при проверке подписки:', error);
      bot.sendMessage(chatId, 'Произошла ошибка при проверке подписки. Попробуйте позже.');
    }
  }
});

console.log('Бот запущен');