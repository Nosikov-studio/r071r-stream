const express = require("express")
const app = express()
const fs = require('fs')

// Обработка запроса к корню сайта '/'

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html')
})

// Обработка запроса на получение видео по маршруту '/video'

app.get('/video', (req, res) => {
    const range = req.headers.range; // Получаем заголовок Range из запроса (часть видео, которую хочет получить клиент)
// Если клиент не указал Range — возвращаем ошибку 400    
    if (!range) {
        return res.status(400).send('Requires Range header');
    }
    const videoPath = 'test.mp4'; // Путь к файлу с видео

    const videoSize = fs.statSync(videoPath).size; // Получаем размер видеофайла в байтах

    const CHUNK_SIZE = 10 ** 6;  // Размер чанка (кусочка видео) в байтах — 1 Мб
    const start = Number(range.replace(/\D/g, '')); // Получаем номер стартового байта из заголовка Range (например, "bytes=12345-" => 12345)
    
    // Рассчитываем конечный байт — минимальный из (start + CHUNK_SIZE) или последнего байта файла
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    // Длина передаваемого чанка в байтах
    const contentLength = end - start + 1;
    // Формируем заголовки ответа
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`, // Интервал байт, который возвращается
        'Accept-Ranges': 'bytes', // Сервер поддерживает запросы чанками
        'Content-Length': contentLength, // Размер возвращаемого чанка
        'Content-Type': 'video/mp4', // Тип контента — видео mp4
    };
 
// Устанавливаем статус 206 Partial Content и отправляем заголовки    
    res.writeHead(206, headers); 

// Создаём поток чтения файла — с нужного диапазона байт    
    const videoStream = fs.createReadStream(videoPath, { start, end });
// Передаём данные потока в ответ клиенту  (метод pipe -перенаправление из одного потока в другой)  
    videoStream.pipe(res);
});
app.listen(8000, ()=> {
    console.log('listening on port 8000')
})