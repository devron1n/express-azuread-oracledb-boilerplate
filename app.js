"use strict";

//модули
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const multer  = require('multer'); //обработка файлов в multipart/form-data
const passport = require('passport'); //для авторизации
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy; //для авторизации через Azure с passport

//конфиги
const config = require(__dirname + '/config/config');

//глобальные переменные
const queriesLogic = require(__dirname + '/queries'); //запросы к БД


// ---------- загрузка файлов ----------
// >>>
//проверка наличия папки для загрузки файлов
if (!fs.existsSync(__dirname + '/public/uploads')) {
    fs.mkdirSync(__dirname + '/public/uploads', '0755');
}

//настройка multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/ |_/g, ''));
    }
});
const upload = multer({ storage: storage });

//удаление загруженных файлов старше filesExpirePeriodMs
const filesExpirePeriodMs = 2592000000; //1 месяц (30 * 24 * 3600 * 1000)
const timerIntervalMs = 86400000; //1 день (24 * 3600 * 1000)

let deleteExpiredFiles = () => {
    let timestampForDelete = Date.now() - filesExpirePeriodMs;
    console.log(`Deleting expired files started, timestamp for deletion = ${timestampForDelete}`);

    fs.readdir(__dirname + '/public/uploads', (err, files) => {
        if (err) throw err;

        //console.log(files);
        if (files.length) {
            files.forEach((file, index) => {
                if (file.substr(0, file.indexOf('-')) < timestampForDelete) {
                    fs.unlink(__dirname + '/public/uploads/' + file, (err) => {
                        if (err) throw err;

                        console.log(__dirname + '/public/uploads/' + file + ' was deleted');
                    });
                }
            });
        } else {
            console.log(`No files found in ${__dirname}/public/uploads/`);
        }
    });
};

//запускаем таймер для удаления загруженных файлов старше filesExpirePeriodMs
let deleteExpiredFilesTimer = setInterval(deleteExpiredFiles, timerIntervalMs);
// <<<
// ---------- загрузка файлов ----------


// ---------- настройка express ----------
// >>>
const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//подключаем статику
app.use('/', express.static(__dirname + '/public')); 

//заголовки для CORS
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     next();
// });
// <<<
// ---------- настройка express ----------


// ---------- настройка для авторизации в непубличных приложениях ----------
// >>>
// if (!config.isPublic) {
//     //параметры токена для авторизации
//     const tokenOptions = {
//         identityMetadata: config.identityMetadata,
//         clientID: config.clientID,
//         audience: config.audience,
//         loggingLevel: config.loggingLevel,
//         loggingNoPII: config.loggingNoPII
//     };

//     //логика авторизации
//     const bearerStrategy = new OIDCBearerStrategy(tokenOptions, function (token, done) {
//             if (!token.oid) {
//                 done(new Error('OID не найден в токене Azure AD'));
//             } else {
//                 done(null, token);
//             }
//         }
//     );

//     //подключаем и инцициализируем passport
//     app.use(passport.initialize());
//     app.use(passport.session());
//     passport.use(bearerStrategy);
// }
// <<<
// ---------- настройка для авторизации в непубличных приложениях ----------


// ---------- настройка API ----------
// >>>
exposePost('/get_typeorgs');
exposePost('/get_objects');
exposePost('/get_places');
exposePost('/get_templates');
exposePost('/get_checkups_chl');
exposePost('/get_checkups_tem');
exposePost('/get_checklists');
exposePost('/pr_ins_checklist');
exposePost('/fn_ins_checklist');
exposePost('/get_count_checkups');

function exposePost(endpoint) {
    if (config.isPublic) {
        app.post(endpoint, upload.single('file'), makeRequest.bind(undefined, endpoint));
    } else {
        app.post(endpoint, upload.single('file'), passport.authenticate('oauth-bearer', { session: false }), makeRequest.bind(undefined, endpoint));
    }
}

function makeRequest(endpoint, req, res) {
    console.log('-----------------------------------------------');
    console.log('Запрос');
    // console.log('\n-req: ', req);
    console.log('\n-req.body: ', req.body);
    // console.log('\n-req.headers: ', req.headers);
	if (req.body) {
        const begDate = new Date();
        const queryFunc = queriesLogic[endpoint];
        
		queryFunc(req, res, req.body, begDate);
	} else {
		res.status(500);
		res.end('Пустое тело запроса');
	}
}
// <<<
// ---------- настройка API ----------


//запуск сервера
const server = app.listen(config.port, function () {
    if (process.env.NODE_ENV != 'production') {
        process.env.NODE_ENV = 'development';
    }

    //таймаут запросов
    server.setTimeout(config.timeout);

    console.log('\n-----------------------------------------------');
    console.log(`|  Server started and listening on port ${config.port}  |`);
    console.log(`|  process.env.NODE_ENV = ${process.env.NODE_ENV}         |`);
    console.log('-----------------------------------------------');
});