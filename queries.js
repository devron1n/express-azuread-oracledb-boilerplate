"use strict";

//модули
const oracledb = require('oracledb'); //модуль для подключения к БД

//конфиги
const config = require(__dirname + '/config/config');

//глобальные переменные
let _begDate = new Date();

//параметры подключения к БД
const connAttrs = {
    user: config.db.user,
    password: config.db.password,
    connectString: config.db.connectString
};

// ---------- настройка запросов к БД ----------
// >>>
oracledb.outFormat = oracledb.OBJECT; //представлять результаты запросов в виде объектов
oracledb.fetchAsBuffer = [ oracledb.BLOB ]; //получать блобы как баффер

//наименование пакета oracle
const CHECKLIST_UTILITY = 'checklist.CHECKLIST_UTILITY';

//типы вызова - функция/процедура
const CALL_TYPE = {
    FUNC: 'func',
    PROC: 'proc'
};

//типы вызова по возвращаемому ответу
const QUERY_MODE = {
    scalarFunc: 'scalarFunc', //функция возвращает одно значение,
    scalarProc: 'scalarProc', //процедура возвращает одно значение
    table: 'table', //запрос возвращает таблицу\строку
    cursor: 'cursor',  //процедура возвращает курсор
    noOut: 'noOut' //процедура ничего не возвращает
};

//основной настроечный объект - вызовы процедур/функций
const DB_CALL = {
    //Выбор организаций (get_typeorgs)
    P_GET_REF_TYPE_ORG: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Выбор объектов проверки (get_objects)
    P_GET_REF_OBJECTS: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_TYPE_ORG_ID: {dir: oracledb.BIND_IN,  type: oracledb.NUMBER},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Выбор мест/участков проверки (get_places)
    P_GET_REF_PLACES: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_TYPE_ORG_ID: {dir: oracledb.BIND_IN,  type: oracledb.NUMBER},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Выбор шаблонов (get_templates)
    P_GET_REF_TEMPLATES: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_TYPE_ORG_ID: {dir: oracledb.BIND_IN,  type: oracledb.NUMBER},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Список проверок чек-листа (get_checkups_chl)
    P_GET_CHECKUPS_CHL: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_CHECKLIST_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Список проверок для шаблона (get_checkups_tem)
    P_GET_CHECKUPS_TMP: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_TEMPLATES_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Список всех/незавершенных чек-листов (get_checklists)
    P_GET_CHECKLISTS: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_TYPE_ORG_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_STATUS: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Добавление нового чек-листа (pr_ins_checklist)
    P_INS_CHECKLIST: {
        type: CALL_TYPE.PROC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_REF_TEMPLATES_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_REF_OBJECTS_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_REF_PLACES_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_REF_TYPE_ORG_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AV_PDATE_BEG: {dir: oracledb.BIND_IN, type: oracledb.STRING},
          AV_PDATE_END: {dir: oracledb.BIND_IN, type: oracledb.STRING},
          p_recordset: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        },
        mode: QUERY_MODE.cursor
    },

    //Добавление нового чек-листа (fn_ins_checklist)
    F_INS_CHECKLIST: {
        type: CALL_TYPE.FUNC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_REF_TEMPLATES_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_REF_OBJECTS_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_REF_PLACES_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AN_REF_TYPE_ORG_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER},
          AV_PDATE_BEG: {dir: oracledb.BIND_IN, type: oracledb.STRING},
          AV_PDATE_END: {dir: oracledb.BIND_IN, type: oracledb.STRING}
        },
        mode: QUERY_MODE.scalarFunc
    },

    //Кол-во проверок в шаблоне (get_count_checkups)
    F_GET_COUNT_CHUP_TMP: {
        type: CALL_TYPE.FUNC, 
        package: CHECKLIST_UTILITY,
        vars:
        { 
          AN_REF_TEMPLATES_ID: {dir: oracledb.BIND_IN, type: oracledb.NUMBER}
        },
        mode: QUERY_MODE.scalarFunc
    }
};

//собрать запрос функции/процедуры
for (let key in DB_CALL) {
    let query;
    let varsString;
    let callVars = [];
    let call = DB_CALL[key]; //присваиваем функцию вызова переменной

    //присоединить двоеточия к именам переменных
    for (let varKey in call.vars) {
        callVars.push(`${varKey} => :${varKey}`);
    }

    //соединить элементы массива через запятую
    varsString = callVars.join();

    //формируем запрос
    if (call.type === CALL_TYPE.PROC) {
        query = 'BEGIN ' + call.package + '.' + key + '(' + varsString + '); END;'
    } else {
        // query = 'SELECT ' + call.package + '.' + key + '(' + varsString + ') as ' + call.returnName + ' from dual';
        query = 'SELECT ' + call.package + '.' + key + '(' + varsString + ')' + (call.returnName ? (' as ' + call.returnName) : '') + ' from dual';
    }

    //записываем запрос обратно в объект
    call.query = query;
    // console.log('DB_CALL: ', DB_CALL);
}


//собрать или переопределить переменные
function getVars(callName, body) {
    let call = DB_CALL[callName];
    let callVars = call.vars;
    let tempResult = {};
    let result = {};

    for (let varKey in callVars) {
        result[varKey] = {};

        Object.keys(callVars[varKey]).forEach((key) => {
            result[varKey][key] = callVars[varKey][key];
        });

        //значения добавляем только для входных переменных
        if (result[varKey].dir === oracledb.BIND_IN) {
            //только переменные, которые не заданы статически в DB_CALL
            if (!result[varKey].static) {
                if (result[varKey].nullable === true && body[varKey] === undefined) {
                    result[varKey].val = null;

                } else if (body[varKey] === undefined) {
                    //если переменной не хватает, вернуть ошибку
                    tempResult.error = 'Не заполнена переменная ' + varKey;
                    return tempResult;

                } else if (result[varKey].type === oracledb.DATE) {
                    result[varKey].val = new Date(body[varKey]);

                } else {
                    result[varKey].val = sanitizingValue(body, varKey, result[varKey].type); //TODO: сделать санитиацию данных передающихся в БД
                }
            }
        }
    }

    return result;
}
// <<<
// ---------- настройка запросов к БД ----------

module.exports = {
    '/get_typeorgs': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_REF_TYPE_ORG');
    },

    '/get_objects': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_REF_OBJECTS');
    },

    '/get_places': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_REF_PLACES');
    },

    '/get_templates': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_REF_TEMPLATES');
    },

    '/get_checkups_chl': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_CHECKUPS_CHL');
    },

    '/get_checkups_tem': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_CHECKUPS_TMP');
    },

    '/get_checklists': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_GET_CHECKLISTS');
    },

    '/pr_ins_checklist': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'P_INS_CHECKLIST');
    },

    '/fn_ins_checklist': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'F_INS_CHECKLIST');
    },

    '/get_count_checkups': function(req, res, body, begDate) {
        _begDate = begDate;
        makeDbCall(req, res, body, 'F_GET_COUNT_CHUP_TMP');
    }
};

function makeDbCall(req, res, body, callName) {
    if (body.AC_JSON) {
        body.AC_JSON = JSON.stringify(body.AC_JSON);
    }

    //формируем обьект с входящими значениями
    let vars = getVars(callName, body);
    console.log('Значения для запроса к БД(vars): ', vars);

    if (vars.error) {
        makeResponse(vars.error, null, res, null);
    } else {
        makeQuery(DB_CALL[callName].query, vars, res, DB_CALL[callName].mode, callName);
    }
}

function makeQuery(query, vars, res, mode, callName) {
    let errText = '';

    //подключение (пока без pool)
    oracledb.getConnection(
        connAttrs,

        //callback после подключения
        function (err, connection) {
            if (err) {
                errText = 'Ошибка при подключении к БД: ' + err.message;
                makeResponse(errText, null, res, connection);
                return;
            }

            //если подключились - выполнить запрос
            connection.execute(
                query,
                vars,

                //callback после выполнения запроса
                function (err, result) {
                    if (err) {
                        errText = 'Ошибка при выполнении запроса: ' + err.message;
                        makeResponse(errText, null, res, connection);
                        return;
                    }

                    processResult(connection, result, res, mode);
                }
            );
        }
    );
}

//обработка результата запроса в одном из 3 режимов
function processResult(connection, result, res, mode) {
    switch (mode) {
        case QUERY_MODE.scalarFunc:
            makeResponse(null, result.rows[0], res, connection);
            break;

        case QUERY_MODE.scalarProc:
            makeResponse(null, result.outBinds, res, connection);
            break;

        case QUERY_MODE.table:
            makeResponse(null, result.rows, res, connection);
            break;

        case QUERY_MODE.cursor:
            const numRows = 10;

            if (result.outBinds.cur_presence) {
                fetchResultSetRows(connection, result.outBinds.cur_presence, numRows, res, []);
            } else {
                fetchResultSetRows(connection, result.outBinds.p_recordset, numRows, res, []);
            }
            break;

        case QUERY_MODE.noOut:
            makeResponse(null, {}, res, connection);
            break;

        default:
            makeResponse('Неверно задан режим запроса', null, res, null);
    }
}

//обработка набора строк, пришедших от курсора, если BIND_OUT = oracle.CURSOR
function fetchResultSetRows(connection, resultSet, numRows, res, allRows) {
    resultSet.getRows(
        numRows,

        function (err, rows) {
            if (err) {
                doClose(resultSet);
                makeResponse(err.message, null, res, connection);

            } else if (rows.length === 0) { //закончились строки или их не было
                doClose(resultSet);

                //если вообще были строки, то завершаем с успехом
                if (allRows.length > 0) {
                    makeResponse(null, allRows, res, connection);
                } else {
                    makeResponse(null, {}, res, connection); //('Запрос вернул пустой ответ', null, res, connection);
                }

            } else if (rows.length > 0) {
                //если остались строки - добавляем их в массив и продолжаем дальше
                allRows = allRows.concat(rows);

                fetchResultSetRows(connection, resultSet, numRows, res, allRows);
            }
        }
    );
}

//выдача результата работы сервиса
function makeResponse(err, result, res, connection) {
    if (err) {
        console.error(err);
        res.status(500);
        res.send(err);

    } else {
        const resultString = JSON.stringify(result);
        const endDate = new Date();
        const elapsedSec = (endDate - _begDate) / 1000;

        console.log('Ответ: ', resultString.substr(0, 500) + (resultString.length > 500 ? '...' : ''));
        console.log('Время обработки запроса: ' + elapsedSec + ' сек.');

        res.status(200);
        res.send(result);
    }

    if (connection) {
        doClose(connection);
    }
}

//закрытие соединения
function doClose(target) {
    target.close(
        function (err) {
            if (err) {
                console.error('При закрытии: ', target);
                console.error('Произошла ошибка: ' + err.message);
            }
        }
    );
}

//проверка входных данных
function sanitizingValue(body, varKey, keyType) {
    //let keyValue = body[varKey];

    /*if (varKey === 'av_phone') {
        keyValue = '+' + keyValue.replace(/\D/ig, ''); //очищаем все кроме цифр для корректного телефонного номера
    }*/

    return body[varKey];
}