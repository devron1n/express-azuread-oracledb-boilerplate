module.exports = {
    port: process.env.NODE_PORT || 3000, //порт, который слушаем
    timeout: 60 * 10 * 1000, //таймаут запросов к Oracle - 10 минут
    isPublic: +process.env.APP_IS_PUBLIC, //требуется ли авторизация для доступа к API

    //авторизация Azure
    //'https://login.microsoftonline.com/<tenant_guid>/.well-known/openid-configuration'
    identityMetadata: process.env.AZURE_IDENTITY_METADATA,
    clientID: process.env.AZURE_CLIENT_ID, //Application ID из Azure
    audience: process.env.AZURE_AUDIENCE, //App ID URI из Azure
    loggingLevel: process.env.AZURE_LOGGING_LEVEL,
    loggingNoPII: process.env.AZURE_LOGGING_NO_PII, //расширенное логирование, с личной информацией

    //авторизация БД
    db: {
        user: process.env.NODE_ORACLEDB_USER,
        password: process.env.NODE_ORACLEDB_PASSWORD,

        // For information on process.env.NODE connection strings see:
        // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
        connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,

        // Setting externalAuth is optional.  It defaults to false.  See:
        // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#extauth
        externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
    }
};