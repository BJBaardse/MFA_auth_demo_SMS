module.exports = {
    // HTTP port
    port: process.env.PORT || 3000,

    // Production Authy API key
    authyApiKey: '3lcwZJHQuRBEjCfey79jNfERzpd4l1Xw',
    dbusername: 'dbi359393',
    dbpassword: 'password',
    dbname: 'dbi359393',
    sessionsecret: 'extramoeilijkwachtwoord',


    // MongoDB connection string - MONGO_URL is for local dev,
    // MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGO_URL
};